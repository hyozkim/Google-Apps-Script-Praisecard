/* 리포트 페이지 직원별(+분기별) 가져오기 */
function getReceiverByQuarter_() { 
  Logger.log("<<<<<<<<<< getReceiverByQuarter(" + getTime(true) + ") START >>>>>>>>>>");
  //var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  getDBConn();
  isInsideOfLogic = true;
  
  var queryStr = "";
  queryStr += " SELECT p.quarter, p.send_dt, p.sender, p.receiver, p.content   ";
  queryStr += "     FROM p                                 ";
  queryStr += "         WHERE quarter=? AND receiver=?               ";    
   
  
  var stmt = conn.prepareStatement(queryStr);
  stmt.setString(1,currentQuarter);
  stmt.setString(2,selectedWorker);
  
  var results = stmt.executeQuery();
  var rows = new Array(); // new Object()와 동일한 문법
  
  while (results.next()) {
    /*              quarter               send_dt                sender                 receiver            content        */
    rows.push([results.getString(1), results.getString(2), results.getString(3), results.getString(4), results.getString(5)]);
  }
  
  results.close();
  stmt.close();
  isInsideOfLogic = false;
  closeDBConn();
  
  Logger.info(rows);
  Logger.log("rows.length:" + rows.length);
  
  Logger.log("<<<<<<<<<< getReceiverByQuarter(" + getTime(true) + ") END >>>>>>>>>>");
  return rows;
}
