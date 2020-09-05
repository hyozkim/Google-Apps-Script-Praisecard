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
  
  // toCheckEmp > 1. 회사에 있는 사람 판별
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

  // toCheckPraiseOrNot > 2. 이미 칭찬한 사람 판별
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
  
  // toCheckEmp > 1. 회사에 있는 사람 판별
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
  
  
  // toCheckPraiseOrNot > 2. 이미 칭찬한 사람 판별
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
