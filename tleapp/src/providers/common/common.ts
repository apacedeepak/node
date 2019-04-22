import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {  NavController, NavParams,AlertController,ModalController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import {PlatformLocation} from '@angular/common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


/*
  Generated class for the CommonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommonProvider {

  public globalObj: any = {};
  protected schoolId : string;
  protected loginId : string;
  protected token : string; 
  protected userType : string; 
  protected alertCtrl : any;
  protected modalCtrl : any;
  protected apiUrl : string; 
  protected domainUrl : string; 
  protected projectName : string; 
  protected sessionId : string;
  
  private messageSource = new BehaviorSubject("");
  currentMessage = this.messageSource.asObservable();
  
  
  constructor(public http: HttpClient,public platformLocation:PlatformLocation,
             private toastCtrl: ToastController,
             private alertCtrlClass: AlertController,
             private modalCtrlClass: ModalController) {
  this.globalObj.constant = {
               // apiURL : this.globalObj.serverUrl+":3001/api/",


                apiURL : "http://test.etl.extramarks.com:3000/api/", 
                projectName : "schoolerp",
                domainUrl : "http://test.etl.extramarks.com"


                
            };
            this.apiUrl =  this.globalObj.constant.apiURL; 
            this.domainUrl =  this.globalObj.constant.domainUrl;
            this.projectName =  this.globalObj.constant.projectName;
            this.schoolId = window.localStorage.getItem('schoolId');
            this.token = window.localStorage.getItem('token');
            this.loginId = window.localStorage.getItem('loginId');
            this.userType = window.localStorage.getItem('userType');
            this.alertCtrl = this.alertCtrlClass;
            this.modalCtrl = this.modalCtrlClass;
            this.sessionId = window.localStorage.getItem('sessionId');
  }
           toasterError(errormsg)
          {
            const toast = this.toastCtrl.create({
                  message: errormsg,
                  duration: 3000,
                  position: 'middle'
                });
                toast.present();
        }
        
        
    changeMessage(message: string) {
        this.messageSource.next(message)
      }
      
      

}
