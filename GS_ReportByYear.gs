/* 리포트 페이지 년도별 가져오기 */
function getReportByQuarter_(year) {
  Logger.log("<<<<<<<<<< getReportByQuarter(" + getTime(true) + ") START >>>>>>>>>>");
  //var conn = Jdbc.getConnection(dbUrl, user, userPwd);  
  getDBConn();
  isInsideOfLogic = true;
     
  var queryStr = "";
  queryStr += " SELECT quarter, a.name_kor, sum(sendCnt) AS sendCnt, sum(recvCnt) AS recvCnt                   ";
  queryStr += "       FROM (                                                                                   "; 
  queryStr += "              SELECT sender AS name_kor, quarter, count(*) AS sendCnt, 0 AS recvCnt             ";
  queryStr += "                   FROM praise_card p                                                           ";
  queryStr += '                       WHERE p.quarter like ? "%" GROUP BY sender, quarter                      ';
  queryStr += "       UNION ALL                                                                                ";
  queryStr += "              SELECT receiver AS name_kor, quarter, 0 AS sendCnt, count(*) AS recvCnt           ";
  queryStr += "                   FROM praise_card p                                                           ";
  queryStr += '                       WHERE p.quarter like ? "%" GROUP BY receiver, quarter                    ';
  queryStr += "            ) a, emp e where a.name_kor = e.name_kor and e.work_sts=1                           ";
  queryStr += " GROUP BY a.name_kor, quarter                                                                   ";
  
  var stmt = conn.prepareStatement(queryStr);
  stmt.setString(1,year);
  stmt.setString(2,year);
  
  var results = stmt.executeQuery();
  var rows = new Array(); // new Object()와 동일한 문법
  
  while (results.next()) {
    /*              분기                    이름                  보낸 갯수               받은 갯수         */
    rows.push([results.getString(1), results.getString(2), results.getString(3), results.getString(4)]);
  }
  
  results.close();
  stmt.close();
  
  isInsideOfLogic = false;
  closeDBConn();
  //Logger.info(rows);
  Logger.log("<<<<<<<<<< getReportByQuarter(" + getTime(true) + ") END >>>>>>>>>>");
  return rows;
}