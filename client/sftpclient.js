let Client = require('ssh2-sftp-client');
let sftp = new Client();

sftp.connect({
    host: '10.1.17.33',
    port: '21',
    username: 'extramarks12',
    password: '123',
    readyTimeout: 99999
}).then(() => {
    console.log("ffffff");
    return sftp.list('/opt/lampp/htdocs/patchdownloader/patchserver/');
}).then((data) => {
    console.log(data, 'the data info');
}).catch((err) => {
    console.log(err, 'catch error');
});
