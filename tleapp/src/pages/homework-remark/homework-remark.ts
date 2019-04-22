import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
/**
 * Generated class for the HomeworkRemarkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homework-remark',
  templateUrl: 'homework-remark.html',
})
export class HomeworkRemarkPage {
  public detaildata: any;
  public htmlContent: any;
  public title: any;
  public studentName : any;
  public temdata : any;
  public message : any;
  public popmessage : any = '';
  public studentrecord : any = '';
  globalObj: any = {};
  domainUrl: string = '';
  serverUrl: string = '';
 
  constructor(private alertCtrl: AlertController, private myProvider: CommonProvider, 
    private http: HttpClient, public navParams: NavParams, public navCtrl: NavController,
    private viewCtrl: ViewController) {
    this.globalObj.studentName = navParams.get('studentName');
    this.globalObj.subject = navParams.get('subject');
    this.globalObj.title = navParams.get('title');
    this.globalObj.homeworkId = navParams.get('homeworkId');
    this.globalObj.userId = navParams.get('userId');
  }
  ionViewCanEnter() {
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;
  }

  ionViewDidLoad(){}

  presentAlert(msg){
    msg = (msg) ? msg: "some error" 
    let alert = this.alertCtrl.create({
      title: msg,
      subTitle: '',
      buttons: ['Dismiss']
    });
    alert.present();
    return alert
  }

  discardAlert(){
    
    let alert = this.alertCtrl.create({
      title: "Discard this homework?",
      subTitle: '',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            
          }
        },
        { 
          text: 'Discard',
          handler: () => {
            // this.navCtrl.push('HomeworkPage')
            this.navCtrl.pop();
           // this.navCtrl.push('HomeworkCheckPage', {name: this.globalObj.studentName, user_id: this.globalObj.userId, homework_id: this.globalObj.homeworkId})
          }
        }
      ]
    });
    alert.present();
  }

  remarkhomework() {
    if(!this.htmlContent)
    { 
        let msg = "Kindly provide the remark";
        this.presentAlert(msg)
        return
    }
    const param = {
      'user_id': this.globalObj.userId.toString(),
      'homework_id': this.globalObj.homeworkId,
      'check_uncheck': "1",
      'remark': this.htmlContent,
      'token': this.globalObj.token
    };
    this.http.post(this.serverUrl + "homework/homeworksubmitandcheck", param).subscribe(details => {
      this.studentrecord = details;
      
      this.temdata  = this.studentrecord.response_status;
      if (this.temdata.status == '200') { 
           this.popmessage = this.temdata.message;
          let alert = this.alertCtrl.create({
            subTitle: this.popmessage,
            buttons: [{
                    text: 'ok',
                    handler: () => {
                     // this.navCtrl.pop();
                      //this.navCtrl.push('HomeworkDetailPage', {id:this.globalObj.homeworkId})
                      this.viewCtrl.dismiss({id:this.globalObj.homeworkId});
                    }
          }]
        });
        alert.present();
          
          
          
       }
       else{
        this.popmessage = this.temdata.message;
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: this.popmessage,
          buttons: [{
                  text: 'ok',
                  handler: () => {
                    this.navCtrl.push('HomeworkDetailPage', {id:this.globalObj.homeworkId})
                  }
        }]
      });
      alert.present();
       }
    })
  }

}
