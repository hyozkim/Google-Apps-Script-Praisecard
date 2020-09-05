Google Apps Script를 활용한 사내 칭찬카드 웹 개발
===


📖 소스 코드 목록 
---

### .html

|Source Name | Description |
 |    ---- | ---- |
 |menu.html| 메뉴 페이지|
 |card_write.html| 작성 > 등록 페이지|
 |card_written.html|	작성 > 내가 작성한 카드 조회 페이지|
 |card_inquiry.html| 조회 페이지|
 |vote_monitor.html| 진행 현황 페이지|
 |report_year.html| 통계 > 년도별 페이지|		
 |report_emp.html| 통계 > 직원별 페이지	|

### .gs

 |Source Name | Description |
 |    ---- | ---- |
 |code.gs |HTTP 요청/응답 처리 컨트롤러|
 |queries.gs| SQL query 스크립트 |
 |card_inquiry.gs| 조회 페이지 스크립트|
 |card_write.gs| 작성 페이지 스크립트|
 |vote_monitor.gs| 진행 현황 페이지 스크립트|
 |report_year.gs| 통계 > 년도별 스크립트|
 |report_emp.gs | 통계 > 직원별 스크립트|
 |report_all.gs| 통계 > 전체 스크립트|
 |spreadsheet_info.gs| 스프레드시트 처리 스크립트|
 

🎈 Google Apps 스크립트 속성 (키-값) 
---

Google Apps Script 기능으로 Spring AOP처럼 메시징 처리나 기타 관리자 설정하는데 사용 가능

```
var scriptProperties = PropertiesService.getScriptProperties();
var value = scriptProperties.getProperty(key); // key Managers, WORDS, ... etc
```

|KEY | VALUES|
| ---- | ---- |
|CARD_MENU_LIST    | [["안 읽은 카드"], ["추천 카드"],["전체 카드"], ["받은 카드"]] |
|WORDS             | {"CLOSE_REC":"추천마감", "CLOSE_WRITE":"작성마감", "COMPLETE":"투표 완료", "DELETE":"삭제", "ENROLL":"등록", "INQUIRY":"조회", "IS_REC":"추천여부", "LIST":"목록", "MODIFY":"수정", "NO":"아니오", "NOT_COMPLETE":"투표 미완료", "NOT_READ_CNT":"안 읽은 카드 수", "NOT_WRITE":"미작성", "NAME":"이름", "PRAISE_CARD":"칭찬카드", "PRAISE_CONTENT":"칭찬 내용", "PROGRESS":"진행현황", "READ":"읽음", "REC":"추천", "REC_CNT":"점수", "RECEIVER":"받는 사람", "SAVE":"저장", "TOTAL_CNT":"전체 카드 수", "TOTAL_EMP_CNT":"전체 인원", "WRITE":"작성", "IS_WRITE":"작성여부", "YES":"예", "REC_RECV":"칭찬 받음", "REC_SEND":"칭찬 함", "SUM":"합계", "QUARTER":"분기", "YEAR":"년도", "DATE":"날짜", "SENDER":"하는 사람","READ_CNT":"읽은 카드 수","GUBUN":"구분","TOTAL_SUM":"총 합계"} |
|ERROR_CODE        | ["성공", "처리중 입니다.", "본인이 쓴 카드를 추천할 수 없습니다.", "이미 추천한 카드 입니다.", "쿼리 실행 중 오류가 발생하였습니다.", "입력 오류", "이름을 입력해 주세요.", "자기자신을 칭찬할 수 없습니다.", "칭찬 내용을 입력해 주세요."] |
|MESSAGE           | [ "선택한 카드를 삭제할까요?", "등록 요청 후 결과 대기중", "수정 요청 후 결과 대기중", "삭제 요청 후 결과 대기중"] |
|EMPLOYEES         | ["홍길동", "이순신"]|
|MANAGERS          | ["abc@abc.com", "abd@abd.com"]|
|PRAISE_CARD_TABLE | (confidential) |
|CARD_CHECK_TABLE  | (confidential) |
|EMP_TABLE         | (confidential) |
|CLOSED_TABLE      | (confidential) |


👉 Database Module
---

공통적으로 자주 사용되는 데이터베이스 기능을 javascript 객체 리터럴 모듈 패턴으로 구현.

Database 서버가 미국에 있는 탓에 기본 DB Connect 시간이 2-3초 소요되는 이슈가 있어 어떤 한 로직에 필요한 DB Connect 수를 단 한번에 처리하기 위해 만든 이유도 있음.

1. DbConnection Module
```
var DbConnection = function() {
  var module = {};
  
  var connection = null;
  var statement = null;

  // Database 연결
  var _connect = function() { ... }

  // Database 연결 종료
  var _close = function() { ... }

  // Database 연결 종료 여부
  var _isClosed = function() { ... }

  // Database 쿼리 실행
  var _exeQuery = function() { ... }
     
  module.conn    = _connect;
  module.close   = _close;
  module.isConn  = _isClosed;
  module.exe     = _exeQuery;
  
  return module;
}
```

2. Database 연결
```
  var _connect = function() {
    if(!this.isConn()) {
      try{
        connection = Jdbc.getConnection(DBURL, USER, USERPWD);
        Logger.info("DB Status : " + (this.isConn() ? "on" : "off"));
      } catch(exception) {
          Logger.info("_connect Error : " + exception);
      }
    }
  }
```

3. Database 연결종료
``` 
  var _close = function () {
    if(this.isConn()) {
      try {
        connection.close();
        Logger.info("DB Status : " + (this.isConn() ? "on" : "off"));
      } catch(exception) {
        Logger.info("_close Error : " + exception);
      }
    }
  }
```

4. Database 연결 종료 여부 확인( false: 연결 끊김 true: 연결된 상태 )
```
  var _isClosed = function () {    
    try { 
      if(connection == null) {
        return false;
      } else {
        if(connection.isClosed())
          return false;        
        return true;
      }      
    } catch (exception) {
      Logger.info("_isClosed Error : " + exception);
      return false;
    }
  }
```

5. Database 쿼리 실행 (type : S elect, U pdate, D elete, I nsert, C olname)
```
  var _exeQuery = function (type, query, param) {
    Logger.info("_exeQuery query : " + query);
    Logger.info("_exeQuery param : " + ((param == null) ? "없음" : param));
    Logger.info("_exeQuery type : " + type);
    var isAutoConn = false;
    if(!this.isConn()) {
      this.conn();
      isAutoConn = true;
    }
    //var tempResult = null;
    var result = new Array();  // 조회 result
    
    try {
      statement = connection.prepareStatement(query);
      
      if(param != null) {
        for(var i = 0; i < param.length; i ++) {     
          try{
            statement.setString(i+1, param[i]);
          } catch(exception) {
            // 숫자로 파라미터에서 값을 받게되는 경우 예외처리로 해두었는데 테스트는 안해봄 확인해봐야함
            statement.setInt(i+1, param[i]);
            Logger.info(">>> " + exception);
          }
        }
      }
      
      if(type == "S" || type == "C") {
        var tempResult = null;
        tempResult = statement.executeQuery();
        
        if(tempResult != null) {
          var tempList = [];
          var numCols = tempResult.getMetaData().getColumnCount();
          
          // 모듈의 꼴을 조회페이지에 맞게 변형 시킴 
          while(tempResult.next()) {
            for(var i = 1; i <= numCols; i ++) {
              (type == "S") ? tempList.push(tempResult.getString(i))
                : result.push(tempResult.getMetaData().getColumnName(i));
            }
            if(type == "S") {
              result.push(tempList);
              tempList = [];
            }
          }
          
          Logger.info("Result : " + result);
        }
      } else if(type == "U") {
        statement.executeUpdate();
      } else if(type == "D" || type == "I") {
        statement.execute();
      } else {
        return ;
      }
      
    } catch(exception) {
      Logger.info(">>> " + exception);
    } finally {
      if(!statement.isClosed())
        statement.close();
      if(isAutoConn) {
        this.close();
      }
      return result;
    }
  
  }
```