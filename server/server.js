'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.use('/express-status', function(req, res, next) {
  res.json({ running: true });
});

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      var schedule = require('node-schedule');
      var dateFormat = require('dateformat');
      var rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = [0,1,2,3,4,5,6];
      rule.hour = 23;
      rule.minute = 55;
 

var j = schedule.scheduleJob(rule, function(){
  console.log('Schedular has started for Staff Inactive Process.....'+dateFormat(Date(), "yyyy-mm-dd"));
  app.serversyncprocess();
  app.staffinactiveprocess();

});
    }
  });
};
app.staffinactiveprocess = function()
{
  var filter = { status: 'Active',inactive_date:{"neq":null} };
      app.models.staff.find({where:filter}
                ,function(err,response){
                  if(err)
                    {
                      console.log("Error Occurred:-"+err);
                    }
                    else
                      {
                        if(response.length==0)
                          {
                            console.log("No data Available for Staff Inactivity");
                          }
                          else
                            { var dateFormat = require('dateformat');
                              var promise = [];
                              let todaydate = dateFormat(Date(), "yyyy-mm-dd");

                               for(let key in response)
                                {
                                  let releasedate = dateFormat(response[key].inactive_date,"yyyy-mm-dd");
                                  if(todaydate>releasedate)
                                    {
                                        response[key].status = 'Inactive';
                                        promise.push(app.models.staff.inactivestaff(response[key]));
                                        let userdata = {id:response[key].userId,status:'Inactive'};
                                        promise.push(app.models.user.updateuserstatus(userdata));

                                    }

                                }
                                  if(promise.length>0){
                                    Promise.all(promise).then(function(responsestatus){


                                    });
                                  }
                                  else
                                    {
                                      console.log("No data Available for Staff Inactivity");
                                    }
                            }
                      }
                          console.log('Schedular has completed Staff Inactive Process.....');

      });
}
    
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

var connections = [];
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){
    //app.start();
    app.io = require('socket.io')(app.start());
    app.io.on('connection', function(socket){
        connections.push(socket);
        console.log('Connected: %s sockets connected', connections.length);
        //app.io.sockets.emit('notify','SERVERRRRRRRRRRRRRRRRRR');

        socket.on('disconnect', function(){
        connections.splice(connections.indexOf(socket), 1);

        console.log('Disconnected: %s sockets connected', connections.length);
        
      });
    });
  }
});
