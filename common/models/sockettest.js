'use strict';

var fs = require('fs');
var archiver = require('archiver');
var constantval = require('./constant');

module.exports = function(Common) {
    var errorMessage = {};
    var successMessage = {};
    
    Common.generatezip = (data, cb) => {
        var fileName = data.filename;
        var filePathArr = data.file_paths;
        
        
        var filePath = constantval.BASE_URL + constantval.PROJECT_NAME+'/upload/attachment/'+fileName+'.zip';
        
        var output = fs.createWriteStream(filePath);
        var archive = archiver('zip', {
            gzip: true,
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.on('error', (err)=> {
            return cb(null,err);
        });
        
        fs.chmod(constantval.BASE_URL + constantval.PROJECT_NAME+'/upload/attachment/'+fileName+'.zip', '777 -R');
        
        archive.pipe(output);
        
        for(let i in filePathArr){
            var file = filePathArr[i].replace("schoolerp/", "");
            file = file.replace("/upload", "upload");
            var fileNameInArr = filePathArr[i].split('/').slice(-1).pop();
            
            var filePaths = constantval.BASE_URL + constantval.PROJECT_NAME;
            archive.append(fs.createReadStream(filePaths+'/'+file), {name: fileNameInArr});
            
        }
        
        archive.finalize();
        
        
        
        successMessage.status = "200";
        successMessage.message = "success";
        var returnPath = constantval.LOCAL_URL+'/'+constantval.PROJECT_NAME+'/upload/attachment/'+fileName+'.zip';
        return cb(null,successMessage, returnPath);
        
        
    };
    
    Common.remoteMethod(
            'generatezip',
            {
                http: {path: '/generatezip', verb: 'post'},
                description: 'get data',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
            }
    );

};
