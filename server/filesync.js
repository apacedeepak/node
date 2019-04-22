var file = require('file-system');
//var fs = require('fs-extra');
 
console.log("helloo");

file.copySync('/opt/lampp/htdocs/assessment', '/home/extramarks/Desktop/sync/',{
     //noProcess: '**/*.{jpg, png}',            // Don't process images 
  process: function(contents, filepath, relative) {
    console.log(filepath);
    return contents;
    // or custom destpath 
    return {
      contents: '',
      filepath: ''
    };
  } 
});
