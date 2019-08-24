# Praise-Card-GAS
Google Apps Script를 활용한 사내 칭찬카드 웹 개발
-----------------------------------------------------------------------------------------------------------------------

스크립트 속성 (Key, Values)
-----------------------------------------------------------------------------------------------------------------------
      KEY         | VALUES
-----------------------------------------------------------------------------------------------------------------------
CARD_MENU_LIST    | [["안 읽은 카드"], ["추천 카드"],["전체 카드"], ["받은 카드"]]
WORDS             | {"CLOSE_REC":"추천마감", "CLOSE_WRITE":"작성마감", "COMPLETE":"투표 완료", "DELETE":"삭제", "ENROLL":"등록", "INQUIRY":"조회", "IS_REC":"추천여부", "LIST":"목록", "MODIFY":"수정", "NO":"아니오", "NOT_COMPLETE":"투표 미완료", "NOT_READ_CNT":"안 읽은 카드 수", "NOT_WRITE":"미작성", "NAME":"이름", "PRAISE_CARD":"칭찬카드", "PRAISE_CONTENT":"칭찬 내용", "PROGRESS":"진행현황", "READ":"읽음", "REC":"추천", "REC_CNT":"점수", "RECEIVER":"받는 사람", "SAVE":"저장", "TOTAL_CNT":"전체 카드 수", "TOTAL_EMP_CNT":"전체 인원", "WRITE":"작성", "IS_WRITE":"작성여부", "YES":"예", "REC_RECV":"칭찬 받음", "REC_SEND":"칭찬 함", "SUM":"합계", "QUARTER":"분기", "YEAR":"년도", "DATE":"날짜", "SENDER":"하는 사람","READ_CNT":"읽은 카드 수","GUBUN":"구분","TOTAL_SUM":"총 합계"}
ERROR_CODE        | [ "성공", "처리중 입니다.", "본인이 쓴 카드를 추천할 수 없습니다.", "이미 추천한 카드 입니다.", "쿼리 실행 중 오류가 발생하였습니다.", "입력 오류", "이름을 입력해 주세요.", "자기자신을 칭찬할 수 없습니다.", "칭찬 내용을 입력해 주세요."]
MESSAGE           | [ "선택한 카드를 삭제할까요?", "등록 요청 후 결과 대기중", "수정 요청 후 결과 대기중", "삭제 요청 후 결과 대기중"]
EMPLOYEES         | ["홍길동", "이순신"]
MANAGERS          | ["abc@abc.com",abd@abd.com]
PRAISE_CARD_TABLE | ? (보안상 숨김)
CARD_CHECK_TABLE  |  ? (보안상 숨김)
EMP_TABLE         | ? (보안상 숨김)
CLOSED_TABLE      | ? (보안상 숨김)


Source Name             | Description
-------------------------------------------------------------------------
| 코드.gs	                |	웹 전체 	|
| PC_Menu.html	          | 메뉴 페이지|	                         
| PC_EnrollCard.html	    | 작성 > 등록 페이지	                   |
| PC_EnrolledCard.html    |	작성 > 내가 작성한 카드 조회 페이지|
| PC_PraiseInquiry.html	  | 조회 페이지|
| PC_Monitoring.html	    | 진행 현황 페이지|
| PC_ReportByYear.html	  | 통계 > 년도별 페이지		|
| PC_ReportByEmp.html	    | 통계 > 직원별 페이지	|	
| GS_PraiseInquiry.gs		  | 조회 페이지 관련 메소드 모음	|
| GS_EnrollCard.gs	      | 작성 페이지 관련 메소드 모음	|
| InfoFromSpreadSheet.gs  |	"스프레드시트 가져오기 및 삽입 (분기처리만)"|
| GS_Monitoring.gs	      | 진행 현황 페이지 관련 메소드 모음	|
| GS_ReportByEmp.gs 		  | 통계 페이지 관련 메소드 모음|
| GS_ReportByYear.gs      | 통계 페이지 관련 메소드 모음|
| queries.gs		          | 데이터베이스 쿼리 모음	|
-------------------------------------------------------------------------


