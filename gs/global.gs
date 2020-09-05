// 페이지 별 변수
/* 0.  [공통]        */
var cmd, seq;                    // cmd / seq
var worker;                      // 직원
var isManager = false;           // 매니저확인
var page;                        // 현재 페이지
var db;                          // 데이터 베이스
var message;                     // 메시지
var word;                        // 사용하는 한글 단어
var errorCode;                   // 에러코드
var empInfo;                     // 사원 정보
var empLoadAll;                  // 현직 모든 사원 

var currentQuarter;              // 현재 분기
var closedQuarters = new Array(); // 작성 마감된 분기들 확인
var closedRecQuarters = new Array(); // 추천 마감된 분기들 확인
var quarterList; // 분기리스트

/* 1.  [작성]        */
var selectedCard; // 등록 시 ( *수정 ) 

/* 1.1 [작성][목록]   */
var getCardsIWrite;

/* 2.  [조회]        */
var selectCards;
var getTheNumberOfRecvCards;
var currentCard; // [조회페이지] 현재 선택된 카드 목록 종류 (안 읽은 카드, 추천 카드, 전체 카드, 받은 카드)
var currentCnt;  // [조회페이지] 관리자 -> 선택된 카드 수
var cardMenuList; // [조회] 카드메뉴 리스트

/* 3.  [우수칭찬카드] */
var getBestCards;

/* 4.  [진행현황]     */
var getCurrentSituation;
var isClosed;    // 작성마감확인
var isRecClosed; // 추천마감 확인
var totalCnt;    // 전체 카드 수

/* 5.1 [통계][년도별] */
var getReportByQuarter;

/* 5.2 [통계][직원별] */
var getReceiverByQuarter;
var selectedWorker;

/* 5.2 [통계][전체] */
var getReportAll;



// include 
function include(filename) {
  Logger.log("<<<<<<<<<< include() START >>>>>>>>>>");  
  var htmlTemplate = HtmlService.createTemplateFromFile(filename);
  var result = htmlTemplate.evaluate().getContent() ;
  Logger.log("<<<<<<<<<< include() END >>>>>>>>>>");
  return result;
}

// getScriptProperty
function getScriptProperty(key) {
  //Logger.log("<<<<<<<<<< getScriptProperty() START >>>>>>>>>>");  
  var scriptProperties = PropertiesService.getScriptProperties();
  var value = scriptProperties.getProperty(key);
  //Logger.log("key=" + key + ", value=" + value);
  //Logger.log("<<<<<<<<<< getScriptProperty() END >>>>>>>>>>");  
  return value
}

// userProperty 
function getUserProperty(key) {
  var userProperties = PropertiesService.getUserProperties();
  
  return userProperties.getProperty(key);
}

// Dictionary 형으로 만드는 함수
// list : 전체 리스트(2차)를 가져옴 
// keyIdx : 전체 리스트 중 키로 사용할 인덱스 
// valueIdx : 값으로 사용할 인덱스 (리스트로 인덱스를 받음)
function makeDicForm(list, keyIdx, valueIdx) {
  var resultsDic = {};
  
  for(var i = 0; i < list.length; i ++) {
    var resultValueList = [];
    for(var j = 0; j < valueIdx.length; j ++)
      resultValueList.push(list[keyIdx][valueIdx[j]]);
    
    resultsDic[list[i][keyIdx]] = resultValueList;
  }
  
  return resultsDic;
}

// Key:Value HashMap 형으로 만드는 함수
// 단, 하나의 result 값을 return할 때 사용 가능
/* value      : Array[list 배열] - 2차원
   columnName : [list 배열]      - 1차원
   return     : [배열]           - 1차원
*/
function makeHashMapForm( value, columnName ) {
  var empResult = {}; // 1차원으로 결과 리턴
  
    for (var i = 0; i < columnName.length; i++) {
      // 자바의 해쉬맵처럼 사용할 수 있음
      empResult[columnName[i]] = value[0][i];
    }  
  
  Logger.info(empResult);
  return empResult;
}

// debug > check 함수
function check(input) {
  if(input == null) {
    Logger.log("check");
  } else {
    Logger.log(input);
  }  
}

// getDate > yyyy-month-dd
function getDate() {
  var date = new Date();
  // 년 월 일
  var yyyy = date.getFullYear();
  var month = date.getMonth()+1; //January is 0!
  var dd = date.getDate();
  
  return yyyy+'-'+month+'-'+dd;
}

// getTime > hh:mm:ss (SSS)
function getTime(isDebug) {
  var date = new Date();
    // 시 분 초 
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();
  if(isDebug) {
    var SSS = date.getMilliseconds();
    return hh+':'+mm+':'+ss + ':' + SSS;
  }
  
  return hh+':'+mm+':'+ss;
}

// property에 저장되어있는 string을 jason 형식의 object로 변환
function convertStr2Obj(property) {
  var result = property.toString();
  result = JSON.parse(result);
  return result;
}