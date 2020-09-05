/* +--------------------------------------------------+
     0.  [공통]        
   +--------------------------------------------------+ */
   
/* 직원 정보 가져오기 */
var loadEmpQuery = "SELECT disp_order, team, name_kor, rank, class, work_sts, start_date, end_date, email, update_dt, input_id FROM emp WHERE email = ?";

/* +--------------------------------------------------+
     1.  [작성]        
   +--------------------------------------------------+ */
   
/* 분기별 내가 이미 작성한 사람 가져오기 */
var loadReceiverISendQuery = 'SELECT receiver FROM ' + getScriptProperty('PRAISE_CARD_TABLE') + ' WHERE sender=? AND quarter=?';

/* praise_card INSERT */
var insertCardPraiseCardTableQuery = 'INSERT INTO '+getScriptProperty('PRAISE_CARD_TABLE')+'(quarter,sender,receiver,send_dt,send_tm,content) VALUES (?,?,?,?,?,?)';

/* card_check INSERT */
var insertCardCheckTableQuery = 'INSERT INTO ' + getScriptProperty('CARD_CHECK_TABLE') + '(seq,name_kor,read_dt,read_tm,rec_flag) VALUES (?,?,?,?,?)';

/* praise_card에서 seq MAX 가져오기(동기화) */
var selectSeqMAXQuery = 'SELECT MAX(seq) FROM ' + getScriptProperty('PRAISE_CARD_TABLE');

/* 수정버튼 클릭 시 seq 가져오기   */
var getCardOnlyoneClickedQuery = 'SELECT receiver,content FROM ' + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE seq = ?';

/* praise_card Table UPDATE */
var updatePraiseCardTableQuery = 'UPDATE '+getScriptProperty('PRAISE_CARD_TABLE')+' SET receiver=?,send_dt=?,send_tm=?,content=? WHERE seq=?';

/* card_check Table UPDATE */
var updateCardCheckTableQuery = 'UPDATE '+getScriptProperty('CARD_CHECK_TABLE') + ' SET read_dt=?,read_tm=? WHERE seq=? AND name_kor=?';

/* praise_card Table DELETE */
var deletePraiseCardTableQuery = 'DELETE FROM ' + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE seq = ? AND quarter=?';

/* card_check Table DELETE */
var deleteCardCheckTableQuery = 'DELETE FROM ' + getScriptProperty("CARD_CHECK_TABLE") + ' WHERE seq = ?';

/* +--------------------------------------------------+
     1.1 [작성][목록]       
   +--------------------------------------------------+ */
   
/* 작성한 목록 가져오기 */
var getCardsIWriteQuery = 'SELECT seq,receiver,content FROM ' + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE sender = ? AND quarter = ? order by receiver asc';



/* +--------------------------------------------------+
     2.  [조회]
   +--------------------------------------------------+ */
   
/* Card_Check Table Evaluation Update */
var updateCardCheckTableEvaluationQuery = "";
updateCardCheckTableEvaluationQuery += " UPDATE " + getScriptProperty('CARD_CHECK_TABLE') + " ";
updateCardCheckTableEvaluationQuery += "    SET evaluation = ?                                ";
updateCardCheckTableEvaluationQuery += "  WHERE name_kor = ? AND seq = ?                      ";

/* Card_Check Table Evaluation Insert */
var insertCardCheckTableEvaluationQuery = "";
insertCardCheckTableEvaluationQuery += " INSERT INTO " + getScriptProperty('CARD_CHECK_TABLE') + " ";
insertCardCheckTableEvaluationQuery += " (read_dt, read_tm, name_kor, seq, evaluation)             ";
insertCardCheckTableEvaluationQuery += " VALUES                                                    ";
insertCardCheckTableEvaluationQuery += " (? ,? ,? ,? ,?)                                           ";

/* 칭찬카드 가장 많이 받은 사람 가져오기 */
var getTheNumberOfRecvCardsQuery = 'SELECT receiver, count(*) FROM praise_card WHERE quarter = ? GROUP BY receiver';

/* 분기별 읽지 않은 카드 조회 */
var notReadPageQuery_ = 'SELECT seq, quarter, sender, receiver,content FROM ' 
                                      + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE seq NOT IN (SELECT seq FROM ' 
                                      + getScriptProperty('CARD_CHECK_TABLE') + ' WHERE name_kor = ?) AND quarter = ?'; 
var notReadPageQuery = 'SELECT seq, quarter, sender, receiver,content FROM praise_card P WHERE quarter = ? AND NOT EXISTS (SELECT "x" FROM card_check C WHERE C.seq = P.seq AND name_kor = ?)';                                      

/* 분기별 전체 카드 조회 */
var allPageQuery = 'SELECT p.seq, p.quarter, p.sender, p.receiver, p.content, c.read_dt, c.read_tm, c.evaluation FROM ' 
                                      + getScriptProperty("PRAISE_CARD_TABLE") + ' p LEFT OUTER JOIN ' 
                                      + getScriptProperty("CARD_CHECK_TABLE") + ' c ON p.seq=c.seq AND c.name_kor= ? WHERE p.quarter=?';


/* 분기별 추천 카드 조회 */
var recPageQuery = 'SELECT p.seq, p.quarter, p.sender, p.receiver, p.content, sum(c.evaluation) AS eval FROM ' 
                                      + getScriptProperty("PRAISE_CARD_TABLE") + ' p, ' + getScriptProperty("CARD_CHECK_TABLE") 
                                      + ' c WHERE p.seq=c.seq AND c.evaluation > 0 AND p.quarter=? GROUP BY c.seq ORDER BY eval DESC';                                      

/* 분기별 받은 카드 조회 */
var givenPageQuery = 'SELECT SEQ,RECEIVER,CONTENT FROM ' + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE RECEIVER=? AND quarter=?';


/* +--------------------------------------------------+
     3.  [우수칭찬카드]
   +--------------------------------------------------+ */
   
/* 전체 우수 칭찬 카드 가져오기 */
var getBestCardsQuery = "";
getBestCardsQuery += " SELECT B.SEQ, B.RECEIVER, B.CONTENT, A.QUARTER                                                                                    ";
getBestCardsQuery += "   FROM (                                                                                                                          ";
getBestCardsQuery += " 	        SELECT  QUARTER, MAX(EVALUATION) AS EVALUATION                                                                           ";
getBestCardsQuery += "            FROM (                                                                                                                 ";
getBestCardsQuery += "                   SELECT p.quarter AS QUARTER, SUM(c.evaluation) AS EVALUATION                                                    ";
getBestCardsQuery += "                     FROM " + getScriptProperty('CARD_CHECK_TABLE') + " c, " + getScriptProperty('PRAISE_CARD_TABLE') +" p         ";
getBestCardsQuery += "                    WHERE c.evaluation > 0                                                                                         ";
getBestCardsQuery += "                      AND c.seq = p.seq                                                                                            ";
getBestCardsQuery += "                    GROUP BY p.quarter,c.seq                                                                                       ";
getBestCardsQuery += "                 ) X                                                                                                               ";
getBestCardsQuery += "           GROUP BY QUARTER                                                                                                        ";
getBestCardsQuery += "        ) A,                                                                                                                       ";
getBestCardsQuery += "        (                                                                                                                          ";
getBestCardsQuery += "          SELECT p.seq AS SEQ, p.quarter AS QUARTER, p.receiver AS RECEIVER, p.content AS CONTENT, SUM(c.evaluation) AS EVALUATION ";
getBestCardsQuery += "            FROM " + getScriptProperty('CARD_CHECK_TABLE') + " c, " + getScriptProperty('PRAISE_CARD_TABLE') +" p                  ";
getBestCardsQuery += "           WHERE c.evaluation > 0                                                                                                  ";
getBestCardsQuery += "             AND c.seq = p.seq                                                                                                     ";
getBestCardsQuery += "           GROUP BY p.quarter,c.seq                                                                                                ";
getBestCardsQuery += "        ) B,                                                                                                                       ";
getBestCardsQuery += "        (                                                                                                                          ";
getBestCardsQuery += "          SELECT quarter                                                                                                           "; 
getBestCardsQuery += "            FROM " + getScriptProperty('CLOSED_TABLE') + "                                                                         ";
getBestCardsQuery += "           WHERE isClosed = 'Y'                                                                                                    ";
getBestCardsQuery += "             AND isRecClosed = 'Y'                                                                                                 ";
getBestCardsQuery += "        ) C                                                                                                                        ";
getBestCardsQuery += "  WHERE A.EVALUATION = B.EVALUATION                                                                                                ";
getBestCardsQuery += "    AND A.QUARTER = B.QUARTER                                                                                                      ";  
getBestCardsQuery += "    AND C.QUARTER = A.QUARTER                                                                                                      ";  
getBestCardsQuery += "    AND C.QUARTER = B.QUARTER                                                                                                      ";


/* +--------------------------------------------------+
     4.  [진행현황]
   +--------------------------------------------------+ */
   
/* 작성 건수, 안 읽은 카드 수, 추천 여부 리스트 가져오기 */
var selectProgressMonitoringQuery = 'SELECT B.name_kor, (SELECT COUNT(sender) FROM praise_card WHERE sender = A.name_kor AND quarter = ?) AS write_cnt, ?-IF(read_cnt IS NULL, 0, read_cnt) AS not_read_cnt, read_cnt FROM emp B LEFT OUTER JOIN (SELECT C.name_kor, COUNT(C.name_kor) AS read_cnt FROM praise_card P, card_check C WHERE P.quarter = ? AND P.seq = C.seq GROUP BY C.name_kor) A ON B.name_kor = A.name_kor WHERE B.work_sts = 1 and B.isOutsourcing = 0 ORDER BY B.name_kor ASC, read_cnt ASC';

/* 분기별 마감 여부, 갯수 가져오기 */
var getTotalCntNCloseQuery = 'SELECT distinct c.isClosed, c.isRecClosed, count(p.seq) FROM ' 
                                        + getScriptProperty("CLOSED_TABLE") + ' c, ' + getScriptProperty("PRAISE_CARD_TABLE") + ' p WHERE c.quarter = p.quarter and p.quarter = ?';

/* 작성 마감 버튼 눌렀을 때 해당 분기 마감 처리 */
var updateWhenCloseQuery = 'UPDATE ' + getScriptProperty("CLOSED_TABLE") + ' SET isClosed = "Y" WHERE quarter = ?';

/* 추천 마감 버튼 눌렀을 때 해당 분기 마감 처리 */
var updateWhenRecCloseQuery = 'UPDATE ' + getScriptProperty("CLOSED_TABLE") + ' SET isRecClosed = "Y" WHERE quarter = ?';

/* 추천마감시 새로운 분기를 등록 */
var insertNewQuarterQuery = 'insert closed (quarter) values (?)';

/* closed Table 모두 가져오기 */
var getEveryIsClosedQuery = 'SELECT * FROM ' + getScriptProperty("CLOSED_TABLE") + ' ORDER BY quarter asc';

/* +--------------------------------------------------+
     5.1 [통계][년도별]
   +--------------------------------------------------+ */
   
/* 리포트 페이지 년도별 가져오기 */
var getReportByQuarterQuery_ = 'SELECT quarter, name_kor, SUM(IF(name_kor=sender,1,0)) AS sendCnt, SUM(IF(name_kor=receiver,1,0)) AS recvCnt FROM '
                              +' (SELECT e.name_kor AS name_kor, p.quarter AS quarter, p.sender AS sender, p.receiver AS receiver FROM ' 
                                    + getScriptProperty("EMP_TABLE") + ' e LEFT OUTER JOIN ' 
                                    + getScriptProperty("PRAISE_CARD_TABLE") + ' p ON e.work_sts=1 AND p.quarter like ? "%") A WHERE quarter is not null GROUP BY name_kor, quarter';
var getReportByQuarterQuery = 'SELECT quarter, a.name_kor, sum(sendCnt) AS sendCnt, sum(recvCnt) AS recvCnt FROM ( SELECT sender AS name_kor, quarter, count(*) AS sendCnt, 0 AS recvCnt FROM praise_card p	WHERE p.quarter like ? "%" GROUP BY sender, quarter UNION ALL SELECT receiver AS name_kor, quarter, 0 AS sendCnt, count(*) AS recvCnt	FROM praise_card p WHERE p.quarter like ? "%" GROUP BY receiver, quarter) a, emp e where a.name_kor = e.name_kor and e.work_sts=1 GROUP BY a.name_kor, quarter';

/* +--------------------------------------------------+ 
     5.2 [통계][직원별]
   +--------------------------------------------------+ */
   
/* 리포트 페이지 직원별(+분기별) 가져오기 */
var getReceiverByQuarterQuery = 'SELECT quarter, send_dt, sender,receiver,content FROM ' + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE quarter=? AND receiver=?';


/* 직원 이름 가져오기 */
var loadWholeEmpNameQuery = 'SELECT name_kor FROM ' + getScriptProperty('EMP_TABLE') + ' WHERE work_sts=1 and isOutSourcing=0 order by name_kor asc';


/* +--------------------------------------------------+
     5.3 [통계][전체]
   +--------------------------------------------------+ */
   
/* 리포트 페이지 전체 가져오기 */
var getReportAllQuery = 'SELECT left(a.quarter,6) , a.name_kor as name_kor, sum(sendCnt) AS sendCnt, sum(recvCnt) AS recvCnt    FROM (   	  SELECT quarter, sender AS name_kor, count(*) AS sendCnt, 0 AS recvCnt   FROM praise_card p      GROUP BY sender, quarter    UNION ALL  SELECT quarter, receiver AS name_kor, 0 AS sendCnt, count(*) AS recvCnt    FROM praise_card p   GROUP BY receiver, quarter ) a, emp e where a.name_kor = e.name_kor and e.work_sts=1    GROUP BY a.name_kor, left(a.quarter,6) ORDER BY left(a.quarter,6) asc, name_kor asc';



/* +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+ 
     6. [사용하지 않는 쿼리]
   +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+ */
/* 사용자가 추천한 칭찬카드 조회 */
var selectSeqRecQuery = 'SELECT c.seq FROM ' + getScriptProperty("CARD_CHECK_TABLE") + ' c, ' 
                                       + getScriptProperty("PRAISE_CARD_TABLE") + ' p WHERE c.rec_flag = "Y" and c.seq = p.seq AND c.name_kor = ? AND p.quarter = ? ORDER BY c.read_dt DESC, c.read_tm DESC';
                                       
/* 추천 및 읽음 버튼을 눌렀을 때 이미 추천한 카드인지 이미 읽었던 카드인지 확인 */                                       
var isCheckAboutQuery = 'SELECT seq FROM ' + getScriptProperty("CARD_CHECK_TABLE") + ' WHERE name_kor = ? AND seq = ?';

/* 분기별 전체 칭찬카드수 조회 */                                       
var getTotalCardsCntQuery = 'SELECT count(seq) FROM ' + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE quarter = ?';

/* 분기별 마감 조회 */
var getCloseByQuarterQuery = 'SELECT isClosed FROM ' + getScriptProperty("CLOSED_TABLE") + ' where quarter = ?';

/* 추천한 칭찬카드가 있을 때 해당 카드를 추천 안함으로 바꾸는 처리 */
var updateRecY2NQuery = 'UPDATE ' + getScriptProperty("CARD_CHECK_TABLE") + ' SET rec_flag = "N" WHERE rec_flag = "Y" AND name_kor = ? AND seq = ?';

/* 추천클릭한 카드를 추천카드로 업데이트 처리 - 이미 읽음 처리 된 카드일 때 */
var updateCardToRecCardQuery = 'UPDATE ' + getScriptProperty("CARD_CHECK_TABLE") + ' SET rec_flag = "Y", read_dt = ?, read_tm = ? WHERE rec_flag = "N" AND name_kor = ? AND seq = ?';

/* 읽음 클릭한 카드 읽은시간 업데이트 처리 - 이미 읽음 처리 된 카드일 때 */
var updateCardWhenReadAgainQuery = 'UPDATE ' + getScriptProperty("CARD_CHECK_TABLE") + ' SET read_dt = ?, read_tm = ? WHERE name_kor = ? AND seq = ?';

/* 읽음 클릭한 카드 읽은시간 업데이트 처리 - 처음 읽는 카드일 때 */
var updateCardWhenReadFirstQuery = 'INSERT INTO '+getScriptProperty('CARD_CHECK_TABLE')+'(read_dt, read_tm, name_kor, seq, rec_flag) VALUES (?,?,?,?,?)';

/* 추천한 칭찬카드가 두개이상인 경우 칭찬된 카드 모두를 초기화 */
var initY2NWhenOver2Query = 'UPDATE ' + getScriptProperty('CARD_CHECK_TABLE') + ' SET rec_flag="N" WHERE seq IN (SELECT seq FROM ' 
                                      + getScriptProperty("PRAISE_CARD_TABLE") + ' WHERE quarter = ?)  and rec_flag = "Y" and name_kor = ?';
                                    
/* 작성 마감된 분기 가져오기 */
var getClosedQuartersQuery = 'SELECT quarter FROM ' + getScriptProperty("CLOSED_TABLE") + ' where isClosed = "Y"';

/* 추천 마감된 분기 가져오기 */
var getRecClosedQuartersQuery = 'SELECT quarter FROM ' + getScriptProperty("CLOSED_TABLE") + ' where isRecClosed ="Y"';

/* 분기마다 작성마감 여부, 추천마감 여부 가져오기 */
var getCloseQuery = 'SELECT isClosed, isRecClosed FROM ' + getScriptProperty("CLOSED_TABLE") + ' WHERE quarter = ?';

/* 전체 읽음 */
var totalReadQuery = "INSERT INTO card_check (seq, name_kor, read_dt, read_tm, rec_flag) SELECT seq, sender, ?, ?, 'N' FROM praise_card WHERE sender != ? AND quarter = ? AND seq NOT IN (SELECT seq FROM card_check WHERE name_kor = ?)";