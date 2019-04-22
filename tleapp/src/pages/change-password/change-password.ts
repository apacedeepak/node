import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams ,ToastController} from 'ionic-angular';
import {FormGroup, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';

/**
 * Generated class for the ChangePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage implements OnInit {
public changepassForm: FormGroup;
public globalObj : any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams,private toastCtrl: ToastController,private http: HttpClient,private myProvider: CommonProvider) {
    this.globalObj.userId = window.localStorage.getItem("loginId");
    this.globalObj.userType = window.localStorage.getItem("userType");
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.schoolName = window.localStorage.getItem('schoolName');
    this.globalObj.schoolLogo = window.localStorage.getItem('schoolLogo');
  }
   ngOnInit() {
       this.changepassForm = new FormGroup({
            currentpassword: new FormControl(''),
            newpassword: new FormControl(''),
            confirmpassword: new FormControl('')
        });
   }
      onSubmit(value){
       const params = {
            "user_id": this.globalObj.userId,
            "password": value.newpassword,
            "old_password": value.currentpassword,
            "user_type": this.globalObj.userType
          
        };
          if(value.newpassword!=value.confirmpassword)
            {
                  
                const toast = this.toastCtrl.create({
                  message: 'New Password and Confirm Password are not same',
                  duration: 3000,
                  position: 'middle'
                });
                toast.present();
              
            }
              else
                {
                  this.changePassword(params);
                }
      }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ChangePasswordPage');
  }
changePassword(input)
{
 this.http.post(this.globalObj.serverUrl+"users/changepassword", input).subscribe(data => {
   var passres: any  = data;
   const toast = this.toastCtrl.create({
                  message: passres.response.responseMessage,
                  duration: 3000,
                  position: 'middle'
                });
                toast.present();
                this.callLogout(window.localStorage.getItem('loginId'),window.localStorage.getItem('deviceId'));
          localStorage.clear();
          let path = 'HomePage';
          this.navCtrl.setRoot(path);
  
 })
}
callLogout(userId,deviceId)
{
  const params ={
                  user_id:userId,
                  device_token:deviceId
                  }
  this.http.post(this.globalObj.serverUrl+"login/logout", params).subscribe(data => {
  });
}
}
