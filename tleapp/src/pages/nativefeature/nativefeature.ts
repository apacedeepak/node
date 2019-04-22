import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';





/**
 * Generated class for the NativefeaturePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nativefeature',
  templateUrl: 'nativefeature.html',
})
export class NativefeaturePage {
  private contactlist: any[];
  resp :any; 
  local:any;
  constructor(private file:File,private platform : Platform,public navCtrl: NavController, public navParams: NavParams) {
   //this.getlocation();
  //  this.readSms();
     //this.playVideo();
   // this.contactAccess();
  }

  ionViewDidLoad() {
   
  }
  /*contactAccess(){
    let contact: Contact = this.contacts.create();

    contact.name = new ContactName(null, 'Smith', 'John');
    contact.phoneNumbers = [new ContactField('mobile', '6471234567')];
    contact.name = new ContactName(null, 'Ravi', 'Yadav');
    contact.phoneNumbers = [new ContactField('mobile', '6471264567')];
    contact.name = new ContactName(null, 'Dheeraj', 'Bisht');
    contact.phoneNumbers = [new ContactField('mobile', '6471734567')];
    contact.save().then(
      () => console.log('Contact saved!', contact),
      (error: any) => console.error('Error saving contact.', error)
    );

  //  this.contacts.pickContact().then((response :Contact) => {
 //  console.log(response)
   // });
   var options = {
    filter : "",
    multiple:true,
    hasPhoneNumber:true	
};
   this.contacts.find(["*"],options).then((contacts) => {

    for (var i = 0; i < contacts.length; i++) {
          var contact = contacts[i];
          var no =contacts[i].name.formatted;
          var phonenumber=contacts[i].phoneNumbers;
          if(phonenumber != null) {
              for(var n=0;n<phonenumber.length;n++) {
                  var type=phonenumber[n].type;
                  if(type=='mobile') {
                      var phone=phonenumber[n].value;
                      var mobile;
                      if(phone.slice(0,1)=='+' || phone.slice(0,1)=='0'){
                          mobile=phone.replace(/[^a-zA-Z0-9+]/g, "");
                      }
                      else {
                          var mobile_no=phone.replace(/[^a-zA-Z0-9]/g, "");
                          mobile=mobile_no;
                      }

                      var contactData={
                          "displayName":no,
                          "phoneNumbers":mobile,
                      }
                      this.contactlist.push(contactData);
                  }
              }
          }
      }

      console.log("contactlist >>>",this.contactlist);

  }).catch((err) => {
      console.log('err',err);
  });
  }

  playVideo(){
    
     let videoPath = this.file.externalRootDirectory+'WhatsApp/Media/WhatsApp Video/sathwik.mp4';
    console.log(this.file.externalRootDirectory);

     this.file.listDir(this.file.externalRootDirectory, '').then((listing) => {
       // console.log('Directory listing below');
      //  console.log(JSON.stringify(listing));
      });
    
    this.file.checkFile(videoPath, 'd').then(_ => console.log('File exists')).catch(err => console.log('File doesn\'t exist'));

    //this.videoPlayer.play('http://player.vimeo.com/external/85569724.sd.mp4?s=43df5df0d733011263687d20a47557e4').then(() => {
        this.videoPlayer.play(videoPath).then(() => {
      console.log('video completed');
     }).catch(err => {
      console.log(err);
     });
     console.log("done dna done");
  }

  readSms(){
   // if(this.sms.hasPermission)
   
    this.sms.send('8506067443', 'Hello Raviiiissssssiiii!');
    
    //console.log(this.readSms());
  }
 getlocation(){
  var options = {
    enableHighAccuracy: true,
    timeout : 30000
  };
  this.platform.ready().then((read) => {
    
  this.geolocation.getCurrentPosition(options).then((resp) => {
    console.log("latitude : "+resp.coords.latitude);
    this.resp = resp.coords.latitude;
    resp.coords.longitude
   }).catch((error) => {
     this.resp = error;
    console.log("Error:-"+error.message);
   });
   
   let watch = this.geolocation.watchPosition();
   watch.subscribe((data) => { //console.log("hiiii");
    // data can be a set of coordinates, or an error (if an error occurred).
    console.log(JSON.stringify(data))
    // data.coords.longitude
   })
 }).catch((error) => {
    console.warn("hi"+error);
     })
}*/
}
