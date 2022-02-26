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

            // regex Expression for comment section: /" StrTrk\s\d\d\s\d\s\d\.\d\dV\s\d\dC\s\d\d\d\d\dPa "/i
            var notWorkIndex = [];
            for(let j = 0; j < bodyArray[0].length; j++)            //First loop is looping through the file line by line
            {
              if(commentRegex(bodyArray[7][j]) == false)
              {
                notWorkIndex.push(j);
              }
            }
            console.log(notWorkIndex.length);
            console.log(notWorkIndex);

            if(notWorkIndex.length != 0)
            {
              $( ".badData" ).append( "<p> Bad Data </p>" );
              for(let j = 0; j < notWorkIndex.length; j++)            //First loop is looping through the file line by line
              {
                $( ".badData" ).append( "<p>"+bodyArray[0][j]+" "+bodyArray[1][j]+" "+bodyArray[2][j]+" "+bodyArray[3][j]+" "+bodyArray[4][j]+" "+bodyArray[5][j]+" "+bodyArray[6][j]+" "+bodyArray[7][j]+"</p>" );
              }
            }

            console.log(commentRegex(" StrTrk 35 9 1.63V 27C 97893Pa "));
        }

        
      };
      reader.readAsText(file);
}

window.onload = function ()
{
    console.log(commentRegex("StrTrk 35 9 1.63V 27C 97893Pa"));
};

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

  document.getElementById('fileinput').addEventListener('change', readDataFile, false);  // Listener for the Data File input