// Spread Sheet > 년도 분기 가져오기 
function getPeriod() {
 Logger.log("<<<<<<<<<< getPeriod() START >>>>>>>>>>");
  var sheet = SpreadsheetApp.openById(getScriptProperty("SPREADSHEET_APP_ID")).getSheetByName("분기");
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  //Logger.log("lastRow=" + lastRow + ", lastCol=" + lastCol);
  var ret = sheet.getRange(1, 1, lastRow, 2).getValues();
  //Logger.log(ret);

  Logger.log("<<<<<<<<<< getPeriod() END >>>>>>>>>>" + ret);
  return ret;
}

// Spread Sheet > 분기 등록
function putQuarterIntoSheet() {
  var currentQuarter = getPeriod();
  var nextYear = currentQuarter[currentQuarter.length-1][0];
  var nextQuarter = currentQuarter[currentQuarter.length-1][1];
  
  if(currentQuarter[currentQuarter.length-1][1] == 4) { // 4분기일때
    nextQuarter = 1;
    nextYear += 1;
  } else {
    nextQuarter += 1;
  }
   
  var ss = SpreadsheetApp.openById(getScriptProperty("SPREADSHEET_APP_ID")).getSheetByName("분기");
  //SpreadsheetApp.getActiveSpreadsheet();
  //var sheet = ss.getSheets()[0];

  ss.appendRow([nextYear,nextQuarter]);
}

// Spread Sheet > 분기 가져오기
function getLastQuarter() {
  var lastQuarter = getPeriod();
  return (lastQuarter[lastQuarter.length-1][0] + lastQuarter[0][0] + " " + lastQuarter[lastQuarter.length-1][1]+lastQuarter[0][1]);
}