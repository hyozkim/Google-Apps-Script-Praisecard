var address = ''; // DB, Google Cloud SQL IP
var db = '';
var user = '';
var userPwd = '';
var dbUrl = 'jdbc:mysql://' + address + '/' + db;

var DbConnection = function(){
  var module = {};
  
  var connection = null;
  var statement = null;
   
  // DB 연결
  var _connect = function() {
    if(!this.isConn()) {
      try{
        connection = Jdbc.getConnection(dbUrl, user, userPwd);
        Logger.info("DB Status : " + (this.isConn() ? "on" : "off"));
      } catch(exception) {
          Logger.info("_connect Error : " + exception);
      }
    }
  }
  
  // DB 연결종료
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

  // DB 닫혔는지 확인 false : 연결안되어있음 true : 연결되어있음
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
  
  // query : string / param : json / type : S elect, U pdate, D elete, I nsert, C olname
  // 쿼리 실행 후 결과값 반환
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
    
  module.conn    = _connect;
  module.close   = _close;
  module.isConn  = _isClosed;
  module.exe     = _exeQuery;
  
  return module;
}
