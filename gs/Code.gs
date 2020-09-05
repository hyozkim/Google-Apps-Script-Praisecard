function init() {
  // 유저 프로퍼티에 이름이 없으면 emp 테이블에서 Google Session의 이메일 주소로 검색하여 유저 프로퍼티에 저장 합니다.
  if(getUserProperty("name_kor") == null || getUserProperty("email") == null) {
    Logger.log("<<<<<<<<<< LoadEmp() Start >>>>>>>>>>");
    empInfo = makeHashMapForm ( db.exe("S", loadEmpQuery, [Session.getActiveUser().getEmail()]), db.exe( "C", loadEmpQuery, [Session.getActiveUser().getEmail()]));
    
    var userProperties = PropertiesService.getUserProperties();
    // 유저 프로퍼티의 모든 값을 삭제
    userProperties.deleteAllProperties();
    // 테이블의 emp 정보를 유저 프로퍼티에 저장
    userProperties.setProperties(empInfo);
    
    Logger.log("<<<<<<<<<< LoadEmp() End >>>>>>>>>>");
  }
  
  // 관리자 확인
  if (worker == null) {
    var managers = convertStr2Obj(getScriptProperty("MANAGERS")); // 관리자 email 등록 
    worker = getUserProperty("name_kor");
    for(var i = 0; i < managers.length; i ++) {
      if(managers[i].equals(getUserProperty("email"))) {
        isManager = true;
        Logger.log("Manager : " + worker + " " + isManager);
        break;
      }
    }
  }
  
  // 디폴트 페이지 설정
  if(page == null) {
    page = "card_inquiry"; // default page 안 읽은 칭찬카드 // 관리자
  }
  
  // 에러코드 설정
  if(errorCode == null) {
    errorCode = convertStr2Obj(getScriptProperty("ERROR_CODE"));
  }
  
  // 사용할 단어 설정
  if(word == null) {
    word = convertStr2Obj(getScriptProperty("WORDS"));
  }
  
  if(cmd == null) {
    cmd = 'new';
  }
}

function doGet(request) {
    Logger.info("<<<<<<<<<< doGet("+page+") START >>>>>>>>>>");
    
    page = request.parameters.page;
    cmd = request.parameters.cmd;
    seq = request.parameters.seq;
    worker = request.parameters.worker;
    selectedWorker = request.parameters.selectedWorker; // 통계 조회시(직원별)
    inputYearSelect = request.parameters.inputYearSelect; // 통계 조회시(년도별)
    currentCard = request.parameters.inputCardSelect;
    currentQuarter = request.parameters.inputPeriodSelect;
    currentCnt = request.parameters.inputCntSelect;
    
    //Database Connect
    db = new DbConnection();    
    db.conn(); 
  
    init();
  
    // 보류 지울지 말지 언제 쓰일지
    if(page == 'card_write' || page == 'card_written') {
      if(message == null) {
        message = convertStr2Obj(getScriptProperty("MESSAGE"));
      }
    }
    
    /* ---------------------------------------------------------
          ##              작성 페이지 ( 수정 )                 ##
       --------------------------------------------------------- */ 
    if (cmd == 'update') {
      //selectedCard = getCardOnlyoneClicked(seq);
      selectedCard = db.exe("S", getCardOnlyoneClickedQuery, [seq]);
    }
    else {
      selectedCard = [
        ['', '']
      ];
    }
    
    
    if(page != 'card_write') {
      /* ---------------------------------------------------------------
           ##                        조회 페이지                        ##
         --------------------------------------------------------------- */
      // 조회 페이지
      if(cardMenuList == null) {
        cardMenuList = convertStr2Obj(getScriptProperty("CARD_MENU_LIST"));
      }
      
      // 조회 페이지 디폴트 지정
      // currentQuarter > EnrollCard 페이지 제외 공통
      quarterList = getPeriod();  
      if(currentCard == null && currentQuarter == null && currentCnt == null) {
        
        currentCard    = cardMenuList[0][0];// 안 읽은 카드
        currentCnt     = 5; // 관리자만
        currentQuarter = quarterList[quarterList.length-1][0] + quarterList[0][0] + " " + quarterList[quarterList.length-1][1] + quarterList[0][1];
        
        if(page == 'report_emp') {
          currentQuarter ='년도 분기';
        }
      }
      
      if(page == 'card_inquiry') {
        var pageId;
        var sql = [notReadPageQuery, recPageQuery, allPageQuery, givenPageQuery];
                
        for(var i = 0; i < cardMenuList.length; i ++) {
          if(cardMenuList[i] == currentCard.toString()) {
            pageId = i;
            break;
          }
        }
 
        /* page id : 0 > 안 읽은 카드, 1 > 추천 카드, 2 > 전체 카드, 3 > 받은 카드 */
        /* DataBase Connect 할때 4번째 prameter로 pageId 추가하여 Select 쿼리 실행 */
        if(pageId == 0) {
          selectCards = bbSorting( makeSelectCardsNicely( db.exe("S", sql[pageId], [currentQuarter, worker]), pageId ) );
        } else if(pageId == 1) {
          selectCards = makeSelectCardsNicely( db.exe("S", sql[pageId], [currentQuarter]), pageId );
        } else {
          selectCards = bbSorting ( makeSelectCardsNicely( db.exe("S", sql[pageId], [worker, currentQuarter]), pageId ) );
        }
                
        getTheNumberOfRecvCards = db.exe("S", getTheNumberOfRecvCardsQuery,[currentQuarter]);
      }
      
      /* ---------------------------------------------------------------
           ##               작성 페이지 & 진행 현황 공통                 ##
         --------------------------------------------------------------- */
      var totalcntNClose = db.exe("S", getTotalCntNCloseQuery, [currentQuarter]); // isClosed, isRecClosed, totalCnt
      isClosed    = totalcntNClose[0][0]; // 현재분기 작성마감 확인
      isRecClosed = totalcntNClose[0][1]; // 현재분기 추천마감 확인
      totalCnt    = totalcntNClose[0][2]; // 전체카드 수
         
      
      if(page == 'vote_monitor' || page == 'card_written') {
        // 공통 
        var closedDic = makeDicForm( db.exe("S", getEveryIsClosedQuery), 0, [1,2] );
        
        // 공통
        for(var i = 1; i < quarterList.length; i ++){
          var selectedQuarter = quarterList[i][0] + quarterList[0][0] + " " + quarterList[i][1] + quarterList[0][1];         
          if(closedDic[selectedQuarter][0] == 'Y') { // 작성마감 분기들 push
            closedQuarters.push(selectedQuarter);
          }
          if(closedDic[selectedQuarter][1] == 'Y') { // 추천마감 분기들 push
            closedRecQuarters.push(selectedQuarter);
          }
        }
        
         /* ---------------------------------------------------------------
              ##                      작성 페이지 목록                    ##
            --------------------------------------------------------------- */
        if(page == 'card_written') {
          // 내가 작성한 카드 목록 가져오기
          getCardsIWrite = db.exe("S", getCardsIWriteQuery, [getUserProperty("name_kor"), currentQuarter]);
        }
        
         /* ---------------------------------------------------------------
              ##                       진행 현황                         ##
            --------------------------------------------------------------- */
        if(page == 'vote_monitor') {
          // 현재 진행 상황 데이터 가져오기
          getCurrentSituation = db.exe("S", selectProgressMonitoringQuery, [currentQuarter, totalCnt, currentQuarter]);
                  
          // 작성 마감버튼이 눌렸을 때 
          if(isClosed == 'N') {
            var inputIsClickToClose = request.parameters.inputIsClickToClose;
            if(inputIsClickToClose == 'Y') {
              db.exe("U", updateWhenCloseQuery, [currentQuarter]);
              
              isClosed = 'Y';
              inputIsClickToClose = 'N';
            }
          }
          
          // 추천 마감버튼이 눌렸을 때 처리함
          if(isRecClosed == 'N') {
            var inputIsClickToRecClose = request.parameters.inputIsClickToRecClose;
            if(inputIsClickToRecClose == 'Y') {
              db.exe("U", updateWhenRecCloseQuery, [currentQuarter]);
              
              isRecClosed = 'Y';
              inputIsClickToRecClose = 'N';
              putQuarterIntoSheet();
              db.exe("I", insertNewQuarterQuery,[getLastQuarter()]);
            }
          }
        }     
      }
      
      /* ---------------------------------------------------------------
           ##                      우수 칭찬 카드                       ##
         --------------------------------------------------------------- */
      if(page == 'card_best') {
        getBestCards = db.exe("S", getBestCardsQuery);
      }
      
      /* ---------------------------------------------------------------
           ##         통계(년도별) 페이지  & 통계(직원별) 페이지          ##
         --------------------------------------------------------------- */
      if(page == 'report_emp' || page == 'report_year' || page == 'report_all') {
        empLoadAll = db.exe("S", loadWholeEmpNameQuery);
        
        if( page == 'report_year' ) {
          if(inputYearSelect == null ) {
            inputYearSelect = quarterList[quarterList.length-1][0] + quarterList[0][0];
          }
          
          getReportByQuarter = db.exe("S", getReportByQuarterQuery, [inputYearSelect,inputYearSelect]);
        } else if( page == 'report_emp' ) {
            getReceiverByQuarter = db.exe("S", getReceiverByQuarterQuery, [currentQuarter,selectedWorker]);
        } else if ( page == 'report_all' ) {
            getReportAll = db.exe("S", getReportAllQuery);
        }
      }
    } 
    
    var htmlTemplate = HtmlService.createTemplateFromFile(page);
  
    Logger.log("- " + page + " HTML 스크립트 릿(Google Apps Script)을 실행" + currentCnt + "TIME : " + getTime ());
    var result = htmlTemplate.evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1').setTitle("칭찬카드("+getScriptProperty("SYSTEM_MODE")+")");
    
    db.close();
    return result;
}

function doPost(request) {
  //Logger.log("<<<<<<<<<< doPost() START >>>>>>>>>>");
  var result = doGet(request)
  //Logger.log("<<<<<<<<<< doPost() END >>>>>>>>>>");
  return result;
}