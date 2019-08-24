/*
  1 : 등록/수정 전 예외처리
     1.1 : 분기별 이미 칭찬한 사람인지(분기별 같은 사람 칭찬 X)
     1.2 : 우리 회사 사람인지(스크립트 속성 쓰기)
     
  2 : 등록
     2.1 : praise_card Table INSERT
     2.2 : Seq 최대 값 불러오기 (praise_card, card_check Table 동기화)
     2.3 : card_check Table INSERT
  
  3 : 수정
     3.1 : 수정버튼 클릭시 해당 카드정보 가져오기
     3.2 : praise_card Table Update
     3.3 : card_check Table Update
  
  4 : 삭제
     4.1 : praise_card Table DELETE
     4.2 : card_check Table DELETE
  
*/

/* 1 : 등록 전 예외처리 */
/* 1.1 : 분기별 이미 작성한 사람인지 */
function loadReceiverISend_(quarter) {
  Logger.log("<<<<<<<<<< selectReceiverISend(" + getTime(true) + ") START >>>>>>>>>>");

  var queryStr = "";
  queryStr += " SELECT receiver FROM praise_card WHERE sender=? AND quarter=? ";
  
  var stmt = conn.prepareStatement(queryStr);
  stmt.setString(1,getUserProperty('name_kor'));
  stmt.setString(2,quarter);
  
  Logger.log(quarter);
  
  var results = stmt.executeQuery();
  var numCols = results.getMetaData().getColumnCount();
  var rows = new Array(); // new Object()와 동일한 문법

  Logger.info(rows);
  while(results.next()) {
    rows.push([results.getString(1)]);
  }

  results.close();
  stmt.close();
 
  Logger.log("<<<<<<<<<< selectReceiverISend(" + getTime(true) + ") END >>>>>>>>>>");
  return rows;
}


/* 2 : 칭찬카드 등록 */
function insertCard(formObject) {
  Logger.log("<<<<<<<<<< insertCard(" + getTime(true) + ") START >>>>>>>>>>");

  var quarter = formObject.inputPeriodSelect;
  var sender = getUserProperty('name_kor');
  var receiver = formObject.whoPraised;
  var send_dt = getDate(); // 현재 날짜
  var send_tm = getTime(false); // 현재 시간
  var content = formObject.cardContent; // 내용
  
  //var conn;
  var stmt; 
  var result;
  
  Logger.log('insertCard에서 form형으로 받은 '+ quarter);
  Logger.log('insertCard에서 form형으로 받은 '+ receiver);
  
  // DB 연결
  db = new DbConnection();
  db.conn();
  //getDBConn();
  //isInsideOfLogic = true;
  
  // toCheckEmp > 회사에 있는 사람 판별 =========================================================================
  var toCheckEmp = false;
  // var empList = convertStr2Obj(getScriptProperty("EMPLOYEES"));
  var empList = db.exe("S", loadWholeEmpNameQuery);
  
  if( empList.length != 0) {
    for(var i = 0; i < empList.length; i ++) {
      if( receiver == empList[i] ) {
        toCheckEmp = true;
        break;
      } 
    }
  }
  
  if(!toCheckEmp) {
    result = "<div class='alert alert-danger'><strong> 회사에 있는 사람을 입력해주세요. </strong></div>";
    return result;
  }
  // =========================================================================================================

  // toCheckPraiseOrNot > 이미 칭찬한 사람 판별 =================================================================
  var toCheckPraiseOrNot = false;
  // var sentList = loadReceiverISend(quarter);
  var sentList = db.exe("S", loadReceiverISendQuery, [getUserProperty("name_kor"), quarter]);
  
  if( sentList.length != 0 ) {
    for(var i=0; i<sentList.length;i++) {
      if( receiver == sentList[i] ) {
        toCheckPraiseOrNot = true;
        break;
      }
    }
  } 
  
  if(toCheckPraiseOrNot) {
    result = "<div class='alert alert-danger'><strong> 이미 칭찬한 사람입니다. </strong></div>";
    return result;
  }
  // =========================================================================================================
  
  // DB insert > 카드 등록 ====================================================================================
  if(!toCheckPraiseOrNot && toCheckEmp) {
     try {
       // 1. PriaseCard Table Insert
       // insertPraiseCard( quarter, sender, receiver, send_dt, send_tm, content );
       db.exe("I", insertCardPraiseCardTableQuery,[quarter, sender, receiver, send_dt, send_tm, content]);
       
       // 2. Seq 최대 값 불러오기 (praise_card, card_check Table 동기화)
       // var thisCardSeq = selectSeqMAX(); // select
       var thisCardSeq = db.exe("S", selectSeqMAXQuery, []);       
       Logger.log('2 >>>>>> selectSeqMAX : ' + thisCardSeq);

       // 3. CardCheck Talbe Insert
       // insertCardCheck(thisCardSeq, sender, send_dt, send_tm); // insert into card_check whether read or not
       db.exe("I", insertCardCheckTableQuery, [thisCardSeq, sender, send_dt, send_tm, 'N']);
       
       result = "<div class='alert alert-success'><strong>1건 저장 성공!</strong> 목록페이지로 이동중입니다.</div>";
       Logger.log('insertCardForReadCheck : ' + thisCardSeq);
     } catch(exception) {
       result = "<div class='alert alert-danger'><strong>카드 등록 실패!</strong> " + exception + "</div>";
       Logger.log(result);
     } finally {
       db.close();
    }
  }
  // =========================================================================================================
  // DB 연결 종료
  //isInsideOfLogic = false;
  //closeDBConn();
  db.close();
  Logger.log("- result:" + result);
  Logger.log("<<<<<<<<<< insertCard(" + getTime(true) + ") END >>>>>>>>>>");
  return result;
}

/* 2.1 : praise_card Table INSERT */
function insertPraiseCard_( quarter, sender, receiver, send_dt, send_tm, content ) {
  Logger.log("<<<<<<<<<< insertPraiseCard(" + getTime(true) + ") START >>>>>>>>>>");
  var stmt; 
  var queryInsertStr = "";
  queryInsertStr += " INSERT INTO praise_card ( quarter,sender,receiver,send_dt,send_tm,content ) ";  
  queryInsertStr += " VALUES (?,?,?,?,?,?)                                                        ";      

  try {
    stmt = conn.prepareStatement(queryInsertStr);
    stmt.setString(1, quarter);
    stmt.setString(2, sender);
    stmt.setString(3, receiver);
    stmt.setString(4, send_dt);
    stmt.setString(5, send_tm);
    stmt.setString(6, content);
    stmt.execute();
  } catch (exception) {
    Logger.log("insertPraiseCard 실패!");
  } finally {
    
  }
  Logger.log("<<<<<<<<<< insertPraiseCard(" + getTime(true) + ") END >>>>>>>>>>");
}

/* 2.2 Seq 최대 값 불러오기 (praise_card, card_check Table 동기화) */
function selectSeqMAX_() {
  Logger.log("<<<<<<<<<< selectSeqMAX(" + getTime(true) + ") START >>>>>>>>>>");
  
  var queryStr = "";
  queryStr += " SELECT MAX(seq) FROM praise_card ";
  
  var stmt = conn.prepareStatement(queryStr);
  
  var results = stmt.executeQuery();
  
  var thisCardSeq;
  while(results.next()) {
    thisCardSeq = results.getInt(1);
  }
  
  results.close();
  stmt.close();
  Logger.log("<<<<<<<<<< selectSeqMAX(" + getTime(true) + ") END >>>>>>>>>>");
  return thisCardSeq;
}

/* 2.3 : card_check Table INSERT */
function insertCardCheck_(thisCardSeq, sender, send_dt, send_tm) {
  Logger.log("<<<<<<<<<< insertCardForReadCheck(" + getTime(true) + ") START >>>>>>>>>>");
  var stmt;  
  var queryInsertStr = "";
  queryInsertStr += " INSERT INTO card_check (seq,name_kor,read_dt,read_tm,rec_flag) ";
  queryInsertStr += " VALUES (?,?,?,?,?)                                             ";
  
  try {
    //conn = Jdbc.getConnection(dbUrl, user, userPwd);
    stmt = conn.prepareStatement(queryInsertStr);
    stmt.setInt(1, thisCardSeq);
    stmt.setString(2, sender);
    stmt.setString(3, send_dt);
    stmt.setString(4, send_tm);
    stmt.setString(5, 'N');
    stmt.execute();
  } catch (exception) {
    
  } finally {
  }

  Logger.log("<<<<<<<<<< insertCardForReadCheck(" + getTime(true) + ") END >>>>>>>>>>");
}


/* 3 : 칭찬카드 수정 */
function updateCard(formObject) {
  Logger.log("<<<<<<<<<< updateCard(" + getTime(true) + ") START >>>>>>>>>>");

  var receiver = formObject.whoPraised;
  var send_dt = getDate(); // 현재 날짜
  var send_tm = getTime(false); // 현재 시간
  var content = formObject.cardContent; // 내용
  var cardSeq = formObject.currentSeq; // 카드 키
  
  var quarter = formObject.inputPeriodSelect;
  var result;
  
  // DB 연결
  db = new DbConnection();
  db.conn();
  //getDBConn();
  //isInsideOfLogic = true;

  Logger.log('receiver= '+receiver+', send_dt= '+send_dt+', send_tm= '+send_tm);
  Logger.log('seq= '+cardSeq+', content= '+content);
  
  // toCheckEmp > 회사에 있는 사람 판별 =========================================================================
  var toCheckEmp = false;
  // var empList = convertStr2Obj(getScriptProperty("EMPLOYEES"));
  var empList = db.exe("S", loadWholeEmpNameQuery);
  if( empList.length != 0) {
    for(var i = 0; i < empList.length; i ++) {
      if( receiver == empList[i] ) {
        toCheckEmp = true;
        break;
      } 
    }
  }
   if(!toCheckEmp) {
    result = "<div class='alert alert-danger'><strong> 회사에 있는 사람을 입력해주세요. </strong></div>";
    return result;
  } 
  // =========================================================================================================
  
  // toCheckPraiseOrNot > 이미 칭찬한 사람 판별 =================================================================
  var toCheckPraiseOrNot = false; 
  // * 유효성검사
  // 1. 수정시 이미 칭찬한 사람인지
  //var sentList = loadReceiverISend(quarter);
  var sentList = db.exe("S", loadReceiverISendQuery, [getUserProperty("name_kor"), quarter]);
  // 2. 예외적으로 지금 클릭한 사람은 수정 가능
  // var crntCardInfo = getCardOnlyoneClicked(cardSeq);
  var crntCardInfo = db.exe("S", getCardOnlyoneClickedQuery, [cardSeq]);
  
  // TOBE ( receiver >> [0][0] )
  // var crntCardInfo = selectedCard[0][0];
  
  if( sentList.length != 0 ) {
    for(var i = 0; i < sentList.length; i ++) {
      if(sentList[i] == receiver) {
        if(sentList[i] == crntCardInfo[0][0]) {
        // TOBE 
        // if(sentList[i] == crntCardInfo) {
          toCheckPraiseOrNot = false;
          break;
        } else {
          toCheckPraiseOrNot = true;
        }
      }
    }
  }

  if(toCheckPraiseOrNot) {
    result = "<div class='alert alert-danger'><strong> 이미 칭찬한 사람입니다. </strong></div>";
    return result;
  }
  // =========================================================================================================

  
  // DB update > 카드 수정 ====================================================================================
  if(!toCheckPraiseOrNot && toCheckEmp) {
    try {
      // DB 연결
      //getDBConn();
      //isInsideOfLogic = true;
      
      // 1. update PriaseCard 
      // updatePriaseCard(receiver, send_dt, send_tm, content, cardSeq);
      db.exe("U", updatePraiseCardTableQuery, [receiver, send_dt, send_tm, content, cardSeq]);
      
      // 2. update CardCheck
      //updateCardCheck(cardSeq, send_dt, send_tm);
      db.exe("U", updateCardCheckTableQuery, [send_dt, send_tm, cardSeq, getUserProperty('name_kor')]);
       
      Logger.log('updateCardForCheck : ' + cardSeq);
      
      result = "<div class='alert alert-success'><strong>성공!</strong> 1건 저장</div>";
    } catch(exception) {
      result = "<div class='alert alert-danger'><strong>카드 수정 실패!</strong> " + exception + "</div>";
      Logger.log(result);
    } finally {
      // DB 연결 종료
      //isInsideOfLogic = false;
      //closeDBConn();
      db.close();
    }
  } 
  // =========================================================================================================
  db.close();
  Logger.log("- result:" + result);
  Logger.log("<<<<<<<<<< updateCard(" + getTime(true) + ") END >>>>>>>>>>");
  
  return result;
}

/* 3.1 : 수정버튼 클릭 시 seq 가져오기 */
function getCardOnlyoneClicked_(seq) { 
  Logger.log("<<<<<<<<<< getCardOnlyoneClicked(" + getTime(true) + ") START >>>>>>>>>>");
  // DB 연결
  getDBConn();
  isInsideOfLogic = true;
  
  var queryStr = "";
  queryStr += " SELECT receiver,content FROM praise_card WHERE seq = ? ";
  
  var stmt = conn.prepareStatement(queryStr);
  stmt.setInt(1,seq);
  
  var results = stmt.executeQuery();
  var numCols = results.getMetaData().getColumnCount();
  var rows = new Array(); // new Object()와 동일한 문법
  
  while (results.next()) {
    /*              receiver               content               */
    rows.push([results.getString(1), results.getString(2)]);
  }
  
  results.close();
  stmt.close();
  
  // DB 연결 종료
  isInsideOfLogic = false;
  closeDBConn();

  Logger.log("rows.length:" + rows.length);
  Logger.log("<<<<<<<<<< getCardOnlyoneClicked(" + getTime(true) + ") END >>>>>>>>>>");
  return rows;
}

/* 3.2 : praise_card Table UPDATE */
function updatePriaseCard_(receiver, send_dt, send_tm, content, cardSeq) {
  Logger.log("<<<<<<<<<< updatePriaseCard(" + getTime(true) + ") START >>>>>>>>>>");
  var stmt; 
  
  try {
      var queryUpdateStr = "";
      queryUpdateStr += " UPDATE praise_card                           ";  
      queryUpdateStr += " SET receiver=?,send_dt=?,send_tm=?,content=? ";
      queryUpdateStr += " WHERE seq=?                                  ";
      
      stmt = conn.prepareStatement(queryUpdateStr);
      stmt.setString(1, receiver);
      stmt.setString(2, send_dt);
      stmt.setString(3, send_tm);
      stmt.setString(4, content);
      stmt.setString(5, cardSeq);
      stmt.execute();
  } catch (exception) {
    Logger.log("updatePriaseCard 실패!");
  } finally {
  }
  Logger.log("<<<<<<<<<< updatePriaseCard(" + getTime(true) + ") END >>>>>>>>>>");
}

/* 3.3 : card_check Table UPDATE */
function updateCardCheck_(cardSeq, send_dt, send_tm) {
  Logger.log("<<<<<<<<<< updateCardCheck(" + getTime(true) + ") START >>>>>>>>>>"); 
  var stmt;
  
   try {
    var queryUpdateStr = "";
    queryUpdateStr += " UPDATE card_check                  ";  
    queryUpdateStr += " SET read_dt=?,read_tm=?            ";
    queryUpdateStr += " WHERE seq=? AND name_kor=?         "; 
    
    stmt = conn.prepareStatement(queryUpdateStr);
    stmt.setString(1, send_dt);
    stmt.setString(2, send_tm);
    stmt.setString(3, cardSeq);
    stmt.setString(4, getUserProperty('name_kor'));
    stmt.execute();
  } catch (exception) {
    Logger.log("updateCardCheck 실패!");
  } finally {
  }
  
  Logger.log("<<<<<<<<<< updateCardCheck(" + getTime(true) + ") END >>>>>>>>>>");
}

/* 4 : 칭찬카드 삭제 */
function deleteCard(formObject) {
  Logger.log("<<<<<<<<<< deleteCard(" + getTime(true) + ") START >>>>>>>>>>");
  var seq = formObject.delete_seq;
  var currQuarter = formObject.currQuarter;
  var result;

  Logger.log('gs에서 currQuarter 확인  : '+currQuarter);
  
  //getDBConn();
  //isInsideOfLogic = true;
  db = new DbConnection();
  db.conn();
  
  var stmt;
  try {
    // 1. delete PraiseCard
    //var cnt = deletePraiseCard(seq,currQuarter);  
    db.exe("D", deletePraiseCardTableQuery, [seq, currQuarter]);
    // 2. delete CardCheck
    //deleteCardCheck(seq);
    db.exe("D", deleteCardCheckTableQuery, [seq]);
      
    result = "<div class='alert alert-success'><strong>성공!</strong> 1건 삭제</div>";
    
  } catch(exception) {
    result = "<div class='alert alert-danger'><strong>카드 삭제 실패!</strong> " + exception + "</div>";
    Logger.log(result);
  } finally {
    //isInsideOfLogic = false;
    //closeDBConn();
    db.close();
  }
  
  db.close();
  Logger.log("- result:" + result);
  Logger.log("<<<<<<<<<< deleteCard("+ getTime(true) +") START >>>>>>>>>>");
 
  return result;  
}

/* 4.1 : praise_card Table DELETE */
function deletePraiseCard_(seq, currQuarter) {
  Logger.log("<<<<<<<<<< deletePraiseCard(" + getTime(true) + ") START >>>>>>>>>>"); 
  var stmt;
  
  var queryDeleteStr = "";
  queryDeleteStr += "DELETE FROM praise_card WHERE seq = ? AND quarter=? ";
  
  try {
    stmt = conn.prepareStatement(queryDeleteStr);
    stmt.setInt(1, seq);
    stmt.setString(2, currQuarter);
    //stmt.execute();
    var cnt = stmt.executeUpdate();
  } catch(exception) {
    Logger.log("deletePraiseCard 실패!");
  } finally {
    //closeDBConn();
  }
  
  return cnt;
  Logger.log("<<<<<<<<<< deletePraiseCard("+ getTime(true) +") END >>>>>>>>>>"); 
}

/* 4.2 : card_check Table DELETE */
function deleteCardCheck_(seq) {
  Logger.log("<<<<<<<<<< deleteCardCheck(" + getTime(true) + ") START >>>>>>>>>>");
  
  //var conn;
  var stmt;
  var queryDeleteStr = "";
  queryDeleteStr += "DELETE FROM card_check WHERE seq = ? ";
  
  try {
    stmt = conn.prepareStatement(queryDeleteStr);
    stmt.setInt(1, seq);
    //stmt.execute();
    var cnt = stmt.executeUpdate();
  } catch (exception) {
    Logger.log("deleteCardCheck 실패!");
  } finally {
    //closeDBConn();
  }
  
  Logger.log("<<<<<<<<<< deleteCardCheck("+ getTime(true) +") START >>>>>>>>>>");
}

