/* 리포트 페이지 전체 가져오기 */
function getReportAll_(year) {
  Logger.log("<<<<<<<<<< getReportAll(" + getTime(true) + ") START >>>>>>>>>>");
  //var conn = Jdbc.getConnection(dbUrl, user, userPwd);  
  getDBConn();
  isInsideOfLogic = true;
     
  var queryStr = "";
  queryStr += "SELECT left(a.quarter,6) , a.name_kor as name_kor, sum(sendCnt) AS sendCnt, sum(recvCnt) AS recvCnt      ";
  queryStr += "       FROM (                                                                                            "; 
  queryStr += "             SELECT quarter, sender AS name_kor, count(*) AS sendCnt, 0 AS recvCnt                       ";
  queryStr += "                   FROM p                                                                    ";
  queryStr += "                       GROUP BY sender, quarter                                                          ";
  queryStr += "       UNION ALL                                                                                         ";
  queryStr += "             SELECT quarter, receiver AS name_kor, 0 AS sendCnt, count(*) AS recvCnt                     ";
  queryStr += "                   FROM p                                                                    ";
  queryStr += "                         GROUP BY receiver, quarter                                                      ";
  queryStr += "            ) a, emp e where a.name_kor = e.name_kor and e.work_sts=1                                    ";
  queryStr += " GROUP BY a.name_kor, left(a.quarter,6)                                                                  ";
  queryStr += " ORDER BY left(a.quarter,6) asc, name_kor asc                                                            ";
  
  var stmt = conn.prepareStatement(queryStr);
  
  var results = stmt.executeQuery();
  var rows = new Array(); // new Object()와 동일한 문법
  
  while (results.next()) {
    /*               xxxx년도               이름                  보낸 갯수               받은 갯수         */
    rows.push([results.getString(1), results.getString(2), results.getString(3), results.getString(4)]);
  }
  
  results.close();
  stmt.close();
  
  isInsideOfLogic = false;
  closeDBConn();
  //Logger.info(rows);
  Logger.log("<<<<<<<<<< getReportAll(" + getTime(true) + ") END >>>>>>>>>>");
  return rows;
}
