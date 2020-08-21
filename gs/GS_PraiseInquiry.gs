function updateCardInInfoNew(formObject) {
  Logger.log(">> [updateCardInInfoNew] 카드 업데이트 START [ " + getTime () + " ] <<");
  
  var card_cmd     = formObject.card_cmd; // 어떤 버튼을 통해 넘어왔는지 확인
  var card_eval    = formObject.card_eval; // 점수
  var card_seq     = formObject.card_seq; // 카드 Key(seq)
  var card_quarter = formObject.card_quarter;
  var name_kor     = getUserProperty("name_kor");
  
  //var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  // isInsideOfLogic = false;
  // getDBConn();
  // isInsideOfLogic = true;

  // DB 연결
  db = new DbConnection();
  db.conn();
  
  //var stmt;

  var read_dt = getDate(); // 현재 날짜
  var read_tm = getTime(false); // 현재 시간

  
  Logger.log("[HS/TEST]card_cmd : " + card_cmd);
  
  try {
    // 이미 읽은 카드 일 때
    if(isAlreadyRead(card_seq, name_kor, false)) {
      // 내가 쓴 카드 일 때
      if(isAlreadyRead(card_seq, name_kor, true)) {
        // closeDBConn();
        // isInsideOfLogic = false;
        return 2;
      }
      // updateCardCheckTable(card_eval, name_kor, card_seq);
      db.exe("U", updateCardCheckTableEvaluationQuery, [card_eval, name_kor, card_seq]);
    // 처음 읽는 카드 일 때
    } else {
      // insertCardCheckTable(read_dt, read_tm, name_kor, card_seq, card_eval);
      db.exe("I", insertCardCheckTableEvaluationQuery, [read_dt, read_tm, name_kor, card_seq, card_eval]);
    }
  } catch (exception) {
    //closeDBConn();
    //isInsideOfLogic = false;
    db.close();
    return 4;
  }
  
  db.close();
  // closeDBConn();
  // isInsideOfLogic = false;
  return 0; // 성공 리턴
}


function updateCardCheckTable_(evaluation, name_kor, seq) {
  var queryStr = "";
  queryStr += " UPDATE card_check               ";
  queryStr += "    SET evaluation = ?           ";
  queryStr += "  WHERE name_kor = ? AND seq = ? ";
  
  Logger.log("[HS/TEST]updateCardCheckTable :  "+name_kor+ " "+seq+ " "+evaluation);
  getDBConn();
  
  var stmt = conn.prepareStatement(queryStr);
  stmt.setString(1, evaluation);
  stmt.setString(2, name_kor);
  stmt.setString(3, seq);
  
  try {
    stmt.executeUpdate();
  } catch(exception) {
    Logger.info(exception);
  }
  stmt.close();
  closeDBConn();  
}

function insertCardCheckTable_(read_dt, read_tm, name_kor, seq, evaluation) {
  var queryStr = "";
  queryStr += " INSERT INTO card_check ";
  queryStr += " (read_dt, read_tm, name_kor, seq, evaluation) ";
  queryStr += " VALUES ";
  queryStr += " (? ,? ,? ,? ,?) ";
  
  Logger.log("[HS/TEST]insertCardCheckTable : " + read_dt+" "+ read_tm+ " "+name_kor+ " "+seq+ " "+evaluation);
  getDBConn();
  
  var stmt = conn.prepareStatement(queryStr);
  stmt.setString(1, read_dt);
  stmt.setString(2, read_tm);
  stmt.setString(3, name_kor);
  stmt.setString(4, seq);
  stmt.setString(5, evaluation);
  
  try {
    stmt.execute();
  } catch(exception) {
    Logger.info(exception);
  }
  stmt.close();
  closeDBConn();  
}

function isAlreadyRead (seq, name_kor, is2CheckMine) {
  var queryStr = "";
  queryStr += " SELECT COUNT(*)                 ";
  queryStr += "   FROM card_check               ";
  queryStr += "  WHERE seq = ? AND name_kor = ? ";
  
  if(is2CheckMine)
    queryStr += " AND evaluation = 0 ";

  /*
  getDBConn();
  
  var stmt = conn.prepareStatement(queryStr);  
  
  stmt.setString(1, seq);
  stmt.setString(2, name_kor);
  */
  
  //var results = stmt.executeQuery();
  var results = db.exe("S", queryStr, [seq, name_kor]);
  
  var cnt = 0;
  cnt = results[0][0];
  
  /* ASIS 
  while(results.next()) {
    cnt = results.getInt(1);
  }
  */
  
  Logger.log(">>?" +cnt);
  
  //stmt.close();  
  //closeDBConn();
  
  if(cnt > 0)
    return true;
  return false;  
}

function isAlreadyRead_ (seq, name_kor, is2CheckMine) {
  var queryStr = "";
  queryStr += " SELECT COUNT(*)                 ";
  queryStr += "   FROM card_check               ";
  queryStr += "  WHERE seq = ? AND name_kor = ? ";
  
  if(is2CheckMine)
    queryStr += " AND evaluation = 0 ";
  
  getDBConn();
  
  var stmt = conn.prepareStatement(queryStr);  
  
  stmt.setString(1, seq);
  stmt.setString(2, name_kor);
  
  var results = stmt.executeQuery();
  
  var cnt = 0;
  while(results.next()) {
    cnt = results.getInt(1);
  }
  
  
  Logger.log(">>?" +cnt);
  
  stmt.close();  
  closeDBConn();
  
  if(cnt > 0)
    return true;
  return false;  
}

function selectCards_(crntPage) {
  Logger.log("<<<<<<<<<< selectCards START [ " + getTime () + " ] >>>>>>>>>>");
  var menuList = cardMenuList; // 원래 getCardMenu()
  var pageId;
  var sql = [notReadPageQuery, recPageQuery, allPageQuery, givenPageQuery];
  
  for(var i = 0; i < menuList.length; i ++) {
    if(menuList[i] == crntPage) {
      pageId = i;
      break;
    }
  }
  
  /* page id : 0 > 안 읽은 카드, 1 > 추천 카드, 2 > 전체 카드, 3 > 받은 카드 */
  var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  
 getDBConn();
  var stmt = conn.prepareStatement(sql[pageId]);

  
  if(pageId == 0){    
    stmt.setString(1,currentQuarter);
    stmt.setString(2,worker);
  } else if(pageId == 1) {
    stmt.setString(1,currentQuarter);
  } else {
    stmt.setString(1,worker);
    stmt.setString(2,currentQuarter);
  }
  
  var results = stmt.executeQuery();
  var numCols = results.getMetaData().getColumnCount();
  var rows = new Array();
  
  /* results >> 0 : 보내는 사람, 1 : 받는 사람, 2 : 내용, 3 : 받은 날짜, 4 : 받은 시간, 5 : 점수 */  
  while (results.next()) {  
    if(pageId == 0) {
      rows.push([results.getString(3), results.getString(4), results.getString(5).trim(), null, null, null, results.getInt(1)]);
    } else if(pageId == 1) {
      rows.push([results.getString(3), results.getString(4), results.getString(5).trim(), null, null, results.getString(6), results.getInt(1)]);
    } else if(pageId == 2) {
      rows.push([results.getString(3), results.getString(4), results.getString(5).trim(), results.getString(6), results.getString(7), results.getString(8), results.getInt(1)]);
    } else if(pageId == 3) {
      rows.push([null, results.getString(2), results.getString(3).trim(), null, null, null, results.getInt(1)]);
    }    
  }
  
  if(pageId == 0 || pageId == 2) {
    rows = bbSorting(rows);
  }
  results.close();
  stmt.close();
  closeDBConn();
  Logger.log("<<<<<<<<<< selectCards END [ " + getTime () + " ] >>>>>>>>>>");
  return rows;
}

// 조회 페이지 jsp html에서 쉽게 처리하기 위해 정렬하는 함수
function makeSelectCardsNicely ( selectCards, pageId ) {
  var result = new Array();
  
  for(var i = 0 ;i < selectCards.length; i++ ) {
    if(pageId == 0) {
      result.push([selectCards[i][2], selectCards[i][3], selectCards[i][4].trim(), null, null, null, selectCards[i][0]]);
    } else if(pageId == 1) {
      result.push([selectCards[i][2], selectCards[i][3], selectCards[i][4].trim(), null, null, selectCards[i][5], selectCards[i][0]]);
    } else if(pageId == 2) {
      result.push([selectCards[i][2], selectCards[i][3], selectCards[i][4].trim(), selectCards[i][5], selectCards[i][6], selectCards[i][7], selectCards[i][0]]);
    } else if(pageId == 3) {
      result.push([null, selectCards[i][1], selectCards[i][2].trim(), null, null, null, selectCards[i][0]]);
    } 
  }

  return result;
}

function bbSorting(inputList) {
// 컨텐츠내용(2번째 값) 기준으로 버블정렬함
  for(var i = inputList.length-1; i > 0; --i) {
    for(var j = 0; j < i; ++ j) {
      if(inputList[j][2].length > inputList[j + 1][2].length) {
        var temp = inputList[j];
        inputList[j] = inputList[j + 1];
        inputList[j + 1] = temp;
      }
    }
  }
  return inputList;
}

function getTheNumberOfRecvCards_() {
  Logger.log(">> [getTheNumberOfRecvCards] 받은 칭찬카드 수 확인[전체 사원기준] START [ " + getTime () + currentQuarter + " ] <<");
  //var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  getDBConn();
  var stmt = conn.prepareStatement(getTheNumberOfRecvCardsQuery);  
  stmt.setString(1, currentQuarter);
  var results = stmt.executeQuery();
  var rows = new Array();
  
  while (results.next()) {
    rows.push([results.getString(1), results.getString(2)]);
  }
  results.close();
  stmt.close();
  closeDBConn();
  Logger.log(">> [getTheNumberOfRecvCards] 받은 칭찬카드 수 확인[전체 사원기준] END [ " + getTime () + " ] <<");
  return rows;
}