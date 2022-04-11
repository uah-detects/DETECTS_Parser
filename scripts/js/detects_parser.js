var headerDataArray = [];
var bodyDataArray = [];

var rawFileVerificationHeaderArray = ["time","lasttime","lat","lng","speed","course","altitude","comment"];

var finalHeaderDataArray = ["time","lasttime","lat","lng","speed","course","altitude","Temperature (Celsius)","Pressure (Pa)"];
var finalBodyDataArray = [];

var erroredIndexesAndPosition = [];
var erroredIndexLastPosition = -1;

var correctedDataFields = [];
var deleteIndexArray = [];

var deleteButtonPressed = false;

function readDataFile(e) {
  resetMemDataToInit();
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var fileContentArray = this.result.split(/\r\n|\n/);

        console.log(fileContentArray);

        var headerLine = splitHeader(fileContentArray);

        if (verificationHeaderCheck(headerLine) == true)
        {
            console.log("in read --> " + headerLine);

            var headerSize = headerLine.length;
            console.log(headerSize);

            //parsing the body of the data
            var bodyArray = splitBody(headerSize, fileContentArray);
            console.log(bodyArray);

            //console.log(headerLine);

            console.log(bodyArray);

            //Setting global arrays
            headerDataArray = headerLine;
            bodyDataArray = bodyArray;

            //verify header
            var notWorkIndex = [];
            notWorkIndex = verifyData(bodyDataArray);
 
            console.log(notWorkIndex.length);
            console.log(notWorkIndex);



            if(notWorkIndex.length != 0)
            {
              unhideForm ();
              erroredIndexesAndPosition = identifyBadDataSection(notWorkIndex,bodyDataArray);

              nextErroredIndexLastPosition();

              var firstBadIndex = erroredIndexesAndPosition[erroredIndexLastPosition][0][0];

              //$( ".badData" ).append( "<p>"+bodyDataArray[0][firstBadIndex]+" "+bodyDataArray[1][firstBadIndex]+" "+bodyDataArray[2][firstBadIndex]+" "+bodyDataArray[3][firstBadIndex]+" "+bodyDataArray[4][firstBadIndex]+" "+bodyDataArray[5][firstBadIndex]+" "+bodyDataArray[6][firstBadIndex]+" "+bodyDataArray[7][firstBadIndex]+"</p>" );
              $( ".badData" ).append( "<p style='text-align:left'>"+"Time: "+bodyDataArray[0][firstBadIndex]+" | "+"Last Time:"+bodyDataArray[1][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Latitude: "+bodyDataArray[2][firstBadIndex]+" | "+"Longitude: " +bodyDataArray[3][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Speed: "+bodyDataArray[4][firstBadIndex]+" | "+"Course: "+bodyDataArray[5][firstBadIndex]+" | "+"Altitude: "+bodyDataArray[6][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Temperature & Pressure: "+bodyDataArray[7][firstBadIndex]+"</p>" );
              toggleDataCorrectionFields (erroredIndexesAndPosition[0][0]);

              // Change the fieldStateBinaryString to reflect the fields that need to be turned on
              document.getElementById("deleteButton").disabled = false;
            }
            else{
              parseData();
            }

            console.log(commentRegex(" StrTrk 35 9 1.63V 27C 97893Pa "));

        }

        
      };
      reader.readAsText(file);
}

function resetMemDataToInit()
{
  headerDataArray = [];
  bodyDataArray = [];
  finalBodyDataArray = [];
  erroredIndexesAndPosition = [];
  erroredIndexLastPosition = -1;
  correctedDataFields = [];
  deleteIndexArray = [];
  deleteButtonPressed = false;
}

function parseData()
{
  for(let i = 0; i < 9; i++)                         //Creating each array column of the multidimensional Array
  {
    finalBodyDataArray.push([]);
  }

  var badDataLineArry = [];
  var repairLineArry = [];
  var deleteLineArry = [];

  for(let j = 0; j < bodyDataArray[0].length; j++)
  {

    console.log(finalBodyDataArray);
    ////////////////////////////////////////////////////////////////////
    if(erroredIndexesAndPosition.length != 0)
    {
      var badDataLine = false;
      var repairLine = false;
      var deleteLine = false;
      var correctionIndex = -1;
      var badDataLineIndex = -1;
      for(let b = 0; b < erroredIndexesAndPosition.length; b++)            
      {
        if(j == erroredIndexesAndPosition[b][0][0])
        {
          badDataLine = true;
          badDataLineIndex = b;
        }
      }
      if(badDataLine == true)
      {
        for(let r = 0; r < correctedDataFields.length; r++)            
        {
          if(j == correctedDataFields[r][0])
          {
            repairLine = true;
            correctionIndex = r;
          }
        }
        for(let d = 0; d < correctedDataFields.length; d++)
        {
          if(j == deleteIndexArray[d])
          {
            deleteLine = true;
          }
        }
      }


      badDataLineArry.push(badDataLine);
      repairLineArry.push(repairLine);
      deleteLineArry.push(deleteLine);

      if(badDataLine == false)  // No change to Line
      {

        var parsedRowArray = [];
        parsedRowArray.push(bodyDataArray[0][j]);
        parsedRowArray.push(bodyDataArray[1][j]);
        parsedRowArray.push(bodyDataArray[2][j]);
        parsedRowArray.push(bodyDataArray[3][j]);
        parsedRowArray.push(bodyDataArray[4][j]);
        parsedRowArray.push(bodyDataArray[5][j]);
        parsedRowArray.push(bodyDataArray[6][j]);
        var temp = bodyDataArray[7][j].match(/-?(([0-9]{2})|([0-9]{1}))C/i);
        var press = bodyDataArray[7][j].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i);
        
        var tempNum = temp[0].match(/-?(([0-9]{2})|([0-9]{1}))/i);
        var pressNum = press[0].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))/i);

        parsedRowArray.push(tempNum[0]);
        parsedRowArray.push(pressNum[0]);

        for(let k = 0; k < 9; k++)                       //Looping through each line item, item by item
        {
          finalBodyDataArray[k].push(parsedRowArray[k]);
        }
      }
      else if(repairLine == false && deleteLine == true)  //Delete Line
      {
        //Do Nothing
      }
      else if(repairLine == true && deleteLine == false) //Repair Line
      {
        var parsedRowArray = [];

        var pos0 = false;
        var pos1 = false;
        var pos2 = false;
        var pos3 = false;
        var pos4 = false;
        var pos5 = false;
        var pos6 = false;
        var pos7 = false;


        for( let index = 1; index < erroredIndexesAndPosition[badDataLineIndex][0].length; index++)
        {
          console.log(erroredIndexesAndPosition[badDataLineIndex][0][index]);
          switch(erroredIndexesAndPosition[badDataLineIndex][0][index]) {
            case 0:
              pos0 = true;
              console.log("Set 0");
              break;
            case 1:
              pos1 = true;
              console.log("Set 1");
              break;
            case 2:
              pos2 = true;
              console.log("Set 2");
              break;
            case 3:
              pos3 = true;
              console.log("Set 3");
              break;
            case 4:
              pos4 = true;
              console.log("Set 4");
              break;
            case 5:
              pos5 = true;
              console.log("Set 5");
              break;
            case 6:
              pos6 = true;
              console.log("Set 6");
              break;
            case 7:
              pos7 = true;
              console.log("Set 7");
              break;
            default:
          }
        }

        console.log("POS 7 " + pos7 );

        if(pos0 == false)
        {
          parsedRowArray.push(bodyDataArray[0][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][1]);
        }

        if(pos1 == false)
        {
          parsedRowArray.push(bodyDataArray[1][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][2]);
        }
        
        if(pos2 == false)
        {
          parsedRowArray.push(bodyDataArray[2][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][3]);
        }
        
        if(pos3 == false)
        {
          parsedRowArray.push(bodyDataArray[3][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][4]);
        }
        
        if(pos4 == false)
        {
          parsedRowArray.push(bodyDataArray[4][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][5]);
        }
        
        if(pos5 == false)
        {
          parsedRowArray.push(bodyDataArray[5][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][6]);
        }
        
        if(pos6 == false)
        {
          parsedRowArray.push(bodyDataArray[6][j]);
        }
        else{
          parsedRowArray.push(correctedDataFields[correctionIndex][7]);
        }
        
        if(pos7 == false)
        {
          var temp = bodyDataArray[7][j].match(/-?(([0-9]{2})|([0-9]{1}))C/i);
          var press = bodyDataArray[7][j].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i);
          
          var tempNum = temp[0].match(/-?(([0-9]{2})|([0-9]{1}))/i);
          var pressNum = press[0].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))/i);
  
          parsedRowArray.push(tempNum[0]);
          parsedRowArray.push(pressNum[0]);
        }else{
          var temp = correctedDataFields[correctionIndex][8].match(/-?(([0-9]{2})|([0-9]{1}))C/i);
          var press = correctedDataFields[correctionIndex][9].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i);
          
          var tempNum = temp[0].match(/-?(([0-9]{2})|([0-9]{1}))/i);
          var pressNum = press[0].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))/i);
  
          parsedRowArray.push(tempNum[0]);
          parsedRowArray.push(pressNum[0]);
        }

        for(let k = 0; k < 9; k++)                       //Looping through each line item, item by item
        {
          finalBodyDataArray[k].push(parsedRowArray[k]);
        }
      }
    }

    //////////////////////////////////////////////////////////////////////////////////////
    else{

      var parsedRowArray = [];
      parsedRowArray.push(bodyDataArray[0][j]);
      parsedRowArray.push(bodyDataArray[1][j]);
      parsedRowArray.push(bodyDataArray[2][j]);
      parsedRowArray.push(bodyDataArray[3][j]);
      parsedRowArray.push(bodyDataArray[4][j]);
      parsedRowArray.push(bodyDataArray[5][j]);
      parsedRowArray.push(bodyDataArray[6][j]);
      var temp = bodyDataArray[7][j].match(/-?(([0-9]{2})|([0-9]{1}))C/i);
      var press = bodyDataArray[7][j].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i);
      
      var tempNum = temp[0].match(/-?(([0-9]{2})|([0-9]{1}))/i);
      var pressNum = press[0].match(/(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))/i);

      parsedRowArray.push(tempNum[0]);
      parsedRowArray.push(pressNum[0]);

      for(let k = 0; k < 9; k++)                       //Looping through each line item, item by item
      {
        finalBodyDataArray[k].push(parsedRowArray[k]);
      }
    }


  }

  exportToCSV();
  hideForm ();
console.log(finalBodyDataArray);

}

function exportCleanedArray()
{
  var exporterArray = [];
  exporterArray.push(finalHeaderDataArray);
  // i delimits row, j delimits column
  console.log(finalBodyDataArray[0].length);
  console.log(finalBodyDataArray.length);
  for(let i = 0; i < finalBodyDataArray[0].length; i++)
  {
    var row = [];
    for(let j=0; j < finalBodyDataArray.length;j++)
    {
      row[j] = finalBodyDataArray[j][i];
    }
    exporterArray.push(row);
  }
  return exporterArray;
}

function exportToCSV()
{
  console.log("In Funcction CSV");
  var exportedArray = exportCleanedArray();
  console.log("New Array");
  console.log(exportedArray);

  let csvContent = "data:text/csv;charset=utf-8," 
    + exportedArray.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cleanedData.csv");
    document.body.appendChild(link); // Required for FF
    
    link.click(); 
}

function nextErroredIndexLastPosition()
{
  console.log(erroredIndexLastPosition);
  console.log(erroredIndexesAndPosition.length);
  if(erroredIndexLastPosition + 1 < erroredIndexesAndPosition.length)
  {
    erroredIndexLastPosition++;
  }
  else{
    erroredIndexLastPosition = -1;
  }
}

function toggleDataCorrectionFields (DataIndex)
{
  console.log(DataIndex);
  for(let j = 1; j < DataIndex.length; j++)            //First loop is looping through the file line by line
  {
    switch(DataIndex[j]) {
      case 0:
        document.getElementsByClassName("form-groupTime")[0].disabled = false;
        document.getElementsByClassName("form-groupTime")[0].hidden= false;
        break;
      case 1:
        document.getElementsByClassName("form-groupLastTime")[0].disabled = false;
        document.getElementsByClassName("form-groupLastTime")[0].hidden= false;
        break;
      case 2:
        document.getElementsByClassName("form-groupLat")[0].disabled = false;
        document.getElementsByClassName("form-groupLat")[0].hidden= false;
        break;
      case 3:
        document.getElementsByClassName("form-groupLng")[0].disabled = false;
        document.getElementsByClassName("form-groupLng")[0].hidden = false;
        break;
      case 4:
        document.getElementsByClassName("form-groupSpeed")[0].disabled = false;
        document.getElementsByClassName("form-groupSpeed")[0].hidden = false;
        break;
      case 5:
        document.getElementsByClassName("form-groupCourse")[0].disabled = false;
        document.getElementsByClassName("form-groupCourse")[0].hidden = false;
        break;
      case 6:
        document.getElementsByClassName("form-groupTemperature")[0].disabled = false;
        document.getElementsByClassName("form-groupAltitude")[0].hidden = false;
        break;
      case 7:
        document.getElementsByClassName("form-groupTemperature")[0].disabled = false;
        document.getElementsByClassName("form-groupPressure")[0].disabled = false;
        document.getElementsByClassName("form-groupTemperature")[0].hidden = false;
        document.getElementsByClassName("form-groupPressure")[0].hidden = false;
        break;
      default:
        // code block
    }
  }
}

function clearAllInputFields ()
{
  //Clear All input
  document.getElementById('timeInput').value = '';
  document.getElementById('lastTimeInput').value = '';
  document.getElementById('latInput').value = '';
  document.getElementById('lngInput').value = '';
  document.getElementById('speedInput').value = '';
  document.getElementById('courseInput').value = '';
  document.getElementById('altitudeInput').value = '';
  document.getElementById('temperatureInput').value = '';
  document.getElementById('pressureInput').value = '';

  //Clearing Validation UI
  var time = document.getElementById('timeInput');
  time.className = 'form-control';

  var lastTime = document.getElementById('lastTimeInput');
  lastTime.className = 'form-control';

  var lat = document.getElementById('latInput');
  lat.className = 'form-control';

  var lng = document.getElementById('lngInput');
  lng.className = 'form-control';

  var speed = document.getElementById('speedInput');
  speed.className = 'form-control';

  var course = document.getElementById('courseInput');
  course.className = 'form-control';

  var altitude = document.getElementById('altitudeInput');
  altitude.className = 'form-control';

  var temperature = document.getElementById('temperatureInput');
  temperature.className = 'form-control';

  var pressure = document.getElementById('pressureInput');
  pressure.className = 'form-control';

}

function hideAllInputFields ()
{
  clearAllInputFields ();
  document.getElementsByClassName("form-groupTime")[0].disabled = true;
  document.getElementsByClassName("form-groupLastTime")[0].disabled = true;
  document.getElementsByClassName("form-groupLat")[0].disabled = true;
  document.getElementsByClassName("form-groupLng")[0].disabled = true;
  document.getElementsByClassName("form-groupSpeed")[0].disabled = true;
  document.getElementsByClassName("form-groupCourse")[0].disabled = true;
  document.getElementsByClassName("form-groupAltitude")[0].disabled = true;
  document.getElementsByClassName("form-groupTemperature")[0].disabled = true;
  document.getElementsByClassName("form-groupPressure")[0].disabled = true;

  document.getElementsByClassName("form-groupTime")[0].hidden=true;
  document.getElementsByClassName("form-groupLastTime")[0].hidden= true;
  document.getElementsByClassName("form-groupLat")[0].hidden= true;
  document.getElementsByClassName("form-groupLng")[0].hidden = true;
  document.getElementsByClassName("form-groupSpeed")[0].hidden = true;
  document.getElementsByClassName("form-groupCourse")[0].hidden = true;
  document.getElementsByClassName("form-groupAltitude")[0].hidden = true;
  document.getElementsByClassName("form-groupTemperature")[0].hidden = true;
  document.getElementsByClassName("form-groupPressure")[0].hidden = true;

}

function unhideForm ()
{
  document.getElementsByClassName("container")[0].disabled = false;
  document.getElementsByClassName("container")[0].hidden = false;
}

function hideForm ()
{
  document.getElementsByClassName("container")[0].disabled = true;
  document.getElementsByClassName("container")[0].hidden = true;
}

function verifyData(input)
{
  var badDataLineIndex = [];

  for(let j = 0; j < input[0].length; j++)            //First loop is looping through the file line by line
  {
    if(isValidDate(input[0][j]) == false){
      badDataLineIndex.push(j);
    } else if(isValidDate(input[1][j]) == false){
      badDataLineIndex.push(j);
    } else if(isNaN(input[2][j]) || input[2][j] === ""){
      badDataLineIndex.push(j);
    } else if(isNaN(input[3][j]) || input[3][j] === ""){
      badDataLineIndex.push(j);
    } else if(isNaN(input[4][j]) || input[4][j] === ""){
      badDataLineIndex.push(j);
    } else if(isNaN(input[5][j]) || input[5][j] === ""){
      badDataLineIndex.push(j);
    } else if(isNaN(input[6][j]) || input[6][j] === ""){
      badDataLineIndex.push(j);
    } else if(commentRegex(input[7][j]) == false){
      badDataLineIndex.push(j);
    } else {
      //Do nothing dataline is Within the tolerances
    }
  }
  console.log(badDataLineIndex);
  return badDataLineIndex
}

function identifyBadDataSection(badDataIndexArray,dataInputArray)
{
  var dataArray = [];

  for(let i = 0; i < badDataIndexArray.length; i++)                         //Creating each array column of the multidimensional Array
  {
      dataArray.push([]);
  }
  console.log(dataArray);

  

  for(let j = 0; j < badDataIndexArray.length; j++)            //First loop is looping through the file line by line Note: loop starts at one to leave off the header title that is stored in position 0 of the subarray
  {
    var dataColumnErrorArr = []; // Position zero contains the row index and all following positions are rows that contain an error
    dataColumnErrorArr.push(badDataIndexArray[j]);
 
    if(isValidDate(dataInputArray[0][badDataIndexArray[j]]) == false){
        dataColumnErrorArr.push(0);
    }
    if(isValidDate(dataInputArray[1][badDataIndexArray[j]]) == false){
      dataColumnErrorArr.push(1);
    }
    if(isNaN(dataInputArray[2][badDataIndexArray[j]]) || dataInputArray[2][badDataIndexArray[j]] === ""){
      dataColumnErrorArr.push(2);
    }
    if(isNaN(dataInputArray[3][badDataIndexArray[j]]) || dataInputArray[3][badDataIndexArray[j]] === ""){
      dataColumnErrorArr.push(3);
    }
    if(isNaN(dataInputArray[4][badDataIndexArray[j]]) || dataInputArray[4][badDataIndexArray[j]] === ""){
      dataColumnErrorArr.push(4);
    }
    if(isNaN(dataInputArray[5][badDataIndexArray[j]]) || dataInputArray[5][badDataIndexArray[j]] === ""){
      dataColumnErrorArr.push(5);
    }
    if(isNaN(dataInputArray[6][badDataIndexArray[j]]) || dataInputArray[6][badDataIndexArray[j]] === ""){
      dataColumnErrorArr.push(6);
    }
    if(commentRegex(dataInputArray[7][badDataIndexArray[j]]) == false){
      dataColumnErrorArr.push(7);
    }

    dataArray[j].push(dataColumnErrorArr);

  }
  return dataArray;
}

function commentRegex(input) {
  /* Regex Broken Down:
  /StrTrk\s : Identifier
  (([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})) : Packet # Max of 4 digits
  \s[0-9] : Radio Score
  \s[0-9]\.(([0-9]{2})|([0-9]{1}))V : Voltage One digit . up to two digits V
  \s-?(([0-9]{2})|([0-9]{1}))C  : Temperature Possible negative up to two digits C
  \s(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i   : Pressure up to 6 digits Pa
  */                 
  let regex = /StrTrk\s(([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))\s[0-9]\s[0-9]\.(([0-9]{2})|([0-9]{1}))V\s-?(([0-9]{2})|([0-9]{1}))C\s(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i;
 
  return regex.test(input);
}

function verificationHeaderCheck(headerLine)
{
  var headerLineArray = [];
  headerLineArray = headerLine;
  console.log( headerLineArray);
  console.log(rawFileVerificationHeaderArray);
  if(headerLine.length == rawFileVerificationHeaderArray.length)
  {
    for(let i = 0; i <rawFileVerificationHeaderArray.length; i++)
    {
      if(rawFileVerificationHeaderArray[i] != headerLine[i])
      {
        return false;
      }
    }
    return true;
  }
  return false;

}

function splitHeader(fileContentArray)
{
  var headerLine = fileContentArray[0].split(',');
  console.log(headerLine);
  return headerLine;
}
function splitBody(headerSize,fileContentArray)
{
  var dataArray = [];
  var headerLine = fileContentArray[0].split(',');

  for(let i = 0; i < headerSize; i++)                         //Creating each array column of the multidimensional Array
  {
      dataArray.push([]);
  }
  console.log(dataArray);
  
  for(let j = 1; j < fileContentArray.length - 1; j++)            //First loop is looping through the file line by line Note: loop starts at one to leave off the header title that is stored in position 0 of the subarray
  {
    var parseLine = fileContentArray[j].split(',');

    for(let k = 0; k < headerSize; k++)                       //Looping through each line item, item by item
    {
      dataArray[k].push(parseLine[k]);
    }

  }

  return dataArray;
}


const inputs = document.querySelectorAll('input');

const patterns = {
  timeInput: /^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})$/i,
  lastTimeInput: /^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})$/i,
  latInput: /^-?(([0-9]{3})|([0-9]{2})|([0-9]{1}))(\.(([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})))?$/i,
  lngInput: /^-?(([0-9]{3})|([0-9]{2})|([0-9]{1}))(\.(([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})))?$/i,
  speedInput: /^-?(([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))$/i,
  courseInput: /^-?(([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))$/i,
  altitudeInput: /^(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))(\.(([0-9]{3})|([0-9]{2})|([0-9]{1})))?$/i,
  temperatureInput: /^-?(([0-9]{2})|([0-9]{1}))C$/,
  pressureInput: /^(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa$/
};

inputs.forEach((input) => {
  input.addEventListener('keyup', (e) => {
    validate(e.target, patterns[e.target.attributes.id.value]);
  });
});

function validate(field, regex) {
  if (regex.test(field.value)) {
    field.className = 'form-control valid';
    
    if(formComplete())
    {
      document.getElementById("submitButton").disabled = false;
    }

    
  } else {
    field.className = 'form-control invalid';
    document.getElementById("submitButton").disabled = true;
  }
}

// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
function isValidDate(dateString)
{
  //if
  if(/(([0-9]{2})|([0-9]{1}))\/([0-9]{2})\/([0-9]{4})\s([0-9]{2}):([0-9]{2})/i.test(dateString))
  {
    const dateTime = Date.parse(dateString);
    if(isNaN(dateTime)){
      return false;
    }
    else{
      var date = dateString.match(/(([0-9]{2})|([0-9]{1}))\/([0-9]{2})\/([0-9]{4})/i);
      if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date[0]))
      {
        // Parse the date parts to integers
        var parts = date[0].split("/");
        var day = parseInt(parts[1], 10);
        var month = parseInt(parts[0], 10);
        var year = parseInt(parts[2], 10);

        console.log(day);
        console.log(month);
        console.log(year);

        // Check the ranges of month and year
        if(year < 1000 || year > 3000 || month == 0 || month > 12)
            return false;

        var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        // Adjust for leap years
        if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
            monthLength[1] = 29;

        // Check the range of the day
        return day > 0 && day <= monthLength[month - 1];
      }
      else{
        return false;
      }
    }
  }
  else if(/([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})/i.test(dateString))
  {
    const dateTime = Date.parse(dateString);
    if(isNaN(dateTime)){
      return false;
    }
    else{
      var date = dateString.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})/i);
      if(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.test(date[0]))
      {
        // Parse the date parts to integers
        var parts = date[0].split("-");
        var month = parseInt(parts[1], 10);
        var year = parseInt(parts[0], 10);
        var day = parseInt(parts[2], 10);

        console.log(day);
        console.log(month);
        console.log(year);

        // Check the ranges of month and year
        if(year < 1000 || year > 3000 || month == 0 || month > 12)
            return false;

        var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        // Adjust for leap years
        if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
            monthLength[1] = 29;

        // Check the range of the day
        return day > 0 && day <= monthLength[month - 1];
      }
      else{
        return false;
      }
    }
  }
  else{
    return false;
  }
};

function formComplete()
{
  var allowSubmission = true;
  const formCon = 'form-control valid';
  
  if(document.getElementsByClassName("form-groupTime")[0].hidden == false)
  {
    if(document.getElementById('timeInput').className.normalize() === formCon.normalize())
    {
      if(isValidDate(document.getElementById('timeInput').value) == false){
        allowSubmission = false;
        var time = document.getElementById('timeInput');
        time.className = 'form-control invalid';
      }
    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupLastTime")[0].hidden == false)
  {
    if(document.getElementById('lastTimeInput').className.normalize() === formCon.normalize())
    {
      if(isValidDate(document.getElementById('lastTimeInput').value) == false){
        allowSubmission = false;
        var lastTime = document.getElementById('lastTimeInput');
        lastTime.className = 'form-control invalid';
      }
    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupLat")[0].hidden == false)
  {
    if(document.getElementById('latInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupLng")[0].hidden == false)
  {
    if(document.getElementById('lngInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupSpeed")[0].hidden == false)
  {
    if(document.getElementById('speedInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupCourse")[0].hidden == false)
  {
    if(document.getElementById('courseInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupAltitude")[0].hidden == false)
  {
    if(document.getElementById('altitudeInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupTemperature")[0].hidden == false)
  {
    if(document.getElementById('temperatureInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }
  if(document.getElementsByClassName("form-groupPressure")[0].hidden == false)
  {
    if(document.getElementById('pressureInput').className.normalize() === formCon.normalize())
    {

    }
    else{
      allowSubmission = false;
    }
  }

  return allowSubmission;

}

function submisionAction()
{
//correctedDataFields
  var lastPos = erroredIndexLastPosition;
  nextErroredIndexLastPosition();
  console.log(erroredIndexLastPosition);

  var correctedArray = [];
  console.log(erroredIndexLastPosition);

  var currentIndex = erroredIndexesAndPosition[lastPos][0][0];
  correctedArray.push(currentIndex);

  correctedArray.push(document.getElementById('timeInput').value);
  correctedArray.push(document.getElementById('lastTimeInput').value);
  correctedArray.push(document.getElementById('latInput').value);
  correctedArray.push(document.getElementById('lngInput').value);
  correctedArray.push(document.getElementById('speedInput').value);
  correctedArray.push(document.getElementById('courseInput').value);
  correctedArray.push(document.getElementById('altitudeInput').value);
  correctedArray.push(document.getElementById('temperatureInput').value);
  correctedArray.push(document.getElementById('pressureInput').value);


  correctedDataFields.push(correctedArray);

  if(erroredIndexLastPosition != -1)
  {
    //clearing form and setting up for next input
    hideAllInputFields ();
    document.getElementById('badData').innerHTML = "";

    var firstBadIndex = erroredIndexesAndPosition[erroredIndexLastPosition][0][0];
    console.log(firstBadIndex);
    $( ".badData" ).append( "<p style='text-align:left'>"+"Time: "+bodyDataArray[0][firstBadIndex]+" | "+"Last Time:"+bodyDataArray[1][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Latitude: "+bodyDataArray[2][firstBadIndex]+" | "+"Longitude: " +bodyDataArray[3][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Speed: "+bodyDataArray[4][firstBadIndex]+" | "+"Course: "+bodyDataArray[5][firstBadIndex]+" | "+"Altitude: "+bodyDataArray[6][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Temperature & Pressure: "+bodyDataArray[7][firstBadIndex]+"</p>" );
    toggleDataCorrectionFields (erroredIndexesAndPosition[erroredIndexLastPosition][0]);
    console.log("Corrected");
    console.log(correctedDataFields);
    console.log("Deleted");
    console.log(deleteIndexArray);
  }
  else{
    //clearing form
    hideAllInputFields ();
    document.getElementById('badData').innerHTML = "";
    console.log("Corrected");
    console.log(correctedDataFields);
    console.log("Deleted");
    console.log(deleteIndexArray);
    parseData();
  }

}

function deleteAction()
{
  //deleteIndexArray
  var lastPos = erroredIndexLastPosition;
  nextErroredIndexLastPosition();
  console.log(erroredIndexLastPosition);

  var deleteIndex= erroredIndexesAndPosition[lastPos][0][0];
  deleteIndexArray.push(deleteIndex);

  if(erroredIndexLastPosition != -1)
  {
    //clearing form and setting up for next input
    hideAllInputFields ();
    document.getElementById('badData').innerHTML = "";

    var firstBadIndex = erroredIndexesAndPosition[erroredIndexLastPosition][0][0];
    console.log(firstBadIndex);
    $( ".badData" ).append( "<p style='text-align:left'>"+"Time: "+bodyDataArray[0][firstBadIndex]+" | "+"Last Time:"+bodyDataArray[1][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Latitude: "+bodyDataArray[2][firstBadIndex]+" | "+"Longitude: " +bodyDataArray[3][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Speed: "+bodyDataArray[4][firstBadIndex]+" | "+"Course: "+bodyDataArray[5][firstBadIndex]+" | "+"Altitude: "+bodyDataArray[6][firstBadIndex]+"</p>"+"<p style='text-align:left'>"+"Temperature & Pressure: "+bodyDataArray[7][firstBadIndex]+"</p>" );
    toggleDataCorrectionFields (erroredIndexesAndPosition[erroredIndexLastPosition][0]);
    console.log("Corrected");
    console.log(correctedDataFields);
    console.log("Deleted");
    console.log(deleteIndexArray);
  }
  else{
    //clearing form
    hideAllInputFields ();
    document.getElementById('badData').innerHTML = "";
    console.log("Corrected");
    console.log( correctedDataFields);
    console.log("Deleted");
    console.log(deleteIndexArray);
    parseData();
  }

}

$('#deleteButton').click(function (e) {
  deleteButtonPressed = true;
  console.log("Pressed Del");
});

$('#submitButton').click(function (e) {
  deleteButtonPressed = false;
  console.log("Pressed Sub");
});

$('#form').submit(function (e) {
  e.preventDefault();

  console.log("Delete State " + deleteButtonPressed);

  if(deleteButtonPressed)
  {
    deleteAction();
  }
  else{
    submisionAction();
  }

});

document.getElementById('fileinput').addEventListener('change', readDataFile, false);  // Listener for the Data File input