function getBestCards_() {
  Logger.log("<<<<<<<<<< getBestCards(" + getTime(true) + ") START >>>>>>>>>>");
  //var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  getDBConn();
  isInsideOfLogic = true;
  
  var queryString = "";
  queryString += " SELECT B.SEQ, B.RECEIVER, B.CONTENT, A.QUARTER                                                                                    ";
  queryString += "   FROM (                                                                                                                          ";
  queryString += " 	        SELECT  QUARTER, MAX(EVALUATION) AS EVALUATION                                                                           ";
  queryString += "            FROM (                                                                                                                 ";
  queryString += "                   SELECT p.quarter AS QUARTER, SUM(c.evaluation) AS EVALUATION                                                    ";
  queryString += "                     FROM c, p                                                                              ";
  queryString += "                    WHERE c.evaluation > 0                                                                                         ";
  queryString += "                      AND c.seq = p.seq                                                                                            ";
  queryString += "                    GROUP BY p.quarter,c.seq                                                                                       ";
  queryString += "                 ) X                                                                                                               ";
  queryString += "           GROUP BY QUARTER                                                                                                        ";
  queryString += "        ) A,                                                                                                                       ";
  queryString += "        (                                                                                                                          ";
  queryString += "          SELECT p.seq AS SEQ, p.quarter AS QUARTER, p.receiver AS RECEIVER, p.content AS CONTENT, SUM(c.evaluation) AS EVALUATION ";
  queryString += "            FROM c, p                                                                                       ";
  queryString += "           WHERE c.evaluation > 0                                                                                                  ";
  queryString += "             AND c.seq = p.seq                                                                                                     ";
  queryString += "           GROUP BY p.quarter,c.seq                                                                                                ";
  queryString += "        ) B,                                                                                                                       ";
  queryString += "        (                                                                                                                          ";
  queryString += "          SELECT quarter                                                                                                           "; 
  queryString += "            FROM closed                                                                                                            ";
  queryString += "           WHERE isClosed = 'Y'                                                                                                    ";
  queryString += "             AND isRecClosed = 'Y'                                                                                                 ";
  queryString += "        ) C                                                                                                                        ";
  queryString += "  WHERE A.EVALUATION = B.EVALUATION                                                                                                ";
  queryString += "    AND A.QUARTER = B.QUARTER                                                                                                      ";  
  queryString += "    AND C.QUARTER = A.QUARTER                                                                                                      ";  
  queryString += "    AND C.QUARTER = B.QUARTER                                                                                                      ";

  var stmt = conn.prepareStatement(queryString);
  
  var results = stmt.executeQuery();
  var numCols = results.getMetaData().getColumnCount();
  var rows = new Array();
  
  while (results.next()) {
    /*                seq               receiver              content                   quarter     */
    rows.push([results.getString(1), results.getString(2), results.getString(3), results.getString(4)]);
  }
  
  results.close();
  stmt.close();
  Logger.log("rows.length:" + rows.length);
  isInsideOfLogic = false;
  closeDBConn();
  Logger.log("<<<<<<<<<< getBestCards("+ getTime(true) +") END >>>>>>>>>>");
  return rows;
}
