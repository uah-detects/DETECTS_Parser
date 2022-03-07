var headerDataArray = [];
var bodyDataArray = [];
var rawFileVerificationHeaderArray = ["time","lasttime","lat","lng","speed","course","altitude","comment"];



function readDataFile(e) {

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
            notWorkIndex = verifyData(bodyArray);
            /*for(let j = 0; j < bodyArray[0].length; j++)            //First loop is looping through the file line by line
            {
              if(commentRegex(bodyArray[7][j]) == false)
              {
                notWorkIndex.push(j);
              }
            }*/
            console.log(notWorkIndex.length);
            console.log(notWorkIndex);



            if(notWorkIndex.length != 0)
            {
              var output = [];
              output = identifyBadDataSection(notWorkIndex,bodyArray);
              console.log(output);

              $( ".badData" ).append( "<p> Bad Data </p>" );
              for(let j = 0; j < notWorkIndex.length; j++)            //First loop is looping through the file line by line
              {
                $( ".badData" ).append( "<p>"+bodyArray[0][notWorkIndex[j]]+" "+bodyArray[1][notWorkIndex[j]]+" "+bodyArray[2][notWorkIndex[j]]+" "+bodyArray[3][notWorkIndex[j]]+" "+bodyArray[4][notWorkIndex[j]]+" "+bodyArray[5][notWorkIndex[j]]+" "+bodyArray[6][notWorkIndex[j]]+" "+bodyArray[7][notWorkIndex[j]]+"</p>" );
              }
            }

            console.log(commentRegex(" StrTrk 35 9 1.63V 27C 97893Pa "));


            ////////////////////////////////////////////////Splitting comment//////////////////////////
            /* Regex Broken Down:
            /StrTrk\s : Identifier
            (([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})) : Packet # Max of 4 digits
            \s[0-9] : Radio Score
            \s[0-9]\.(([0-9]{2})|([0-9]{1}))V : Voltage One digit . up to two digits V
            \s-?(([0-9]{2})|([0-9]{1}))C  : Temperature Possible negative up to two digits C
            \s(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i   : Pressure up to 6 digits Pa
            */                 
            /*let regexSub = /StrTrk\s(([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))\s[0-9]\s[0-9]\.(([0-9]{2})|([0-9]{1}))V\s-?(([0-9]{2})|([0-9]{1}))C\s(([0-9]{6})|([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1}))Pa/i;
            var commentSplit = regexSub.exec(bodyArray[7][1]);
            var commentSplitArr = commentSplit[0].split(/[ ,]+/);
            console.log(commentSplitArr);*/
            ////////////////////////////////////////////////Splitting comment//////////////////////////

        }

        
      };
      reader.readAsText(file);
}

window.onload = function ()
{
    console.log(commentRegex("StrTrk 35 9 1.63V 27C 97893Pa"));
};

function verifyData(input)
{
  var badDataLineIndex = [];

  for(let j = 0; j < input[0].length; j++)            //First loop is looping through the file line by line
  {
    let regexTimeFormOne = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})/i;
    let regexTimeFormTwo = /(([0-9]{2})|([0-9]{1}))\/([0-9]{2})\/([0-9]{4})\s([0-9]{2}):([0-9]{2})/i;
    //NEED TO ADD REGEX FOR DATE TO Check it is returning correct form
    //2021-06-01\s+16:54:14
    if(regexTimeFormOne.test(input[0][j]) == false && regexTimeFormTwo.test(input[0][j]) == false){
      const dateTime = Date.parse(input[0][j]);

      if(isNaN(dateTime)){
        badDataLineIndex.push(j);
      }

    } else if(regexTimeFormOne.test(input[1][j]) == false && regexTimeFormTwo.test(input[1][j]) == false){
      const dateLastTime = Date.parse(input[1][j]);

      if(isNaN(dateLastTime)){
        badDataLineIndex.push(j);
      }
      
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

    let regexTimeFormOne = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})/i;
    let regexTimeFormTwo = /(([0-9]{2})|([0-9]{1}))\/([0-9]{2})\/([0-9]{4})\s([0-9]{2}):([0-9]{2})/i;
 
    if(regexTimeFormOne.test(dataInputArray[0][badDataIndexArray[j]]) == false && regexTimeFormTwo.test(dataInputArray[0][badDataIndexArray[j]]) == false){
      const dateTime = Date.parse(dataInputArray[0][badDataIndexArray[j]]);

      if(isNaN(dateTime)){
        dataColumnErrorArr.push(0);
      }

    }
    if(regexTimeFormOne.test(dataInputArray[1][badDataIndexArray[j]]) == false && regexTimeFormTwo.test(dataInputArray[1][badDataIndexArray[j]]) == false){
      const dateLastTime = Date.parse(dataInputArray[1][badDataIndexArray[j]]);

      if(isNaN(dateLastTime)){
        dataColumnErrorArr.push(1);
      }
      
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
    /*for(let k = 0; k < badDataIndexArray.length - 1; k++)                       //Looping through each line item, item by item
    {
      
    }*/

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
  timeInput: /^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})$/i,
  lastTimeInput: /^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})$/i,
  latInput: /^(-?([0-9]{3})|([0-9]{2})|([0-9]{1}))(\.(([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})))?$/i,
  lngInput: /^(-?([0-9]{3})|([0-9]{2})|([0-9]{1}))(\.(([0-9]{5})|([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})))?$/i,
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
  } else {
    field.className = 'form-control invalid';
  }
}


  document.getElementById('fileinput').addEventListener('change', readDataFile, false);  // Listener for the Data File input