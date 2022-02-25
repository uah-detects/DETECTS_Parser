function readDataFile(e) {

    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var fileContentArray = this.result.split(/\r\n|\n/);
      console.log(fileContentArray);
      
    };
    reader.readAsText(file);
  }

  document.getElementById('fileinput').addEventListener('change', readDataFile, false);  // Listener for the Data File input