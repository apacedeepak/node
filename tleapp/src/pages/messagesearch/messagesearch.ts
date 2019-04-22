import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, PopoverController, ToastController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { HttpClient } from '@angular/common/http';
import { CalendarComponentOptions } from 'ion2-calendar';
import { DatepickercalendarPage } from '../datepickercalendar/datepickercalendar';

/**
 * Generated class for the MessagesearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messagesearch',
  templateUrl: 'messagesearch.html',
})
export class MessagesearchPage {
    date: string;
    type: 'string';
    
    public globalObj: any = {};
    public testRadioOpen: boolean;
    public admindata: any=[];
    public displayRecepient: any=[];
    public sectionlist: any=[];
    public sectionlists: any=[];
    public checkedItems:boolean[];
    public checkedItemsParent:boolean[];
    public staffList:any = [];
    public teacherList: any = [];
    public classTeacherList: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController,private myProvider: CommonProvider,
      private alertCtrl: AlertController,private http: HttpClient,
      public popCtrl: PopoverController, private toastCtrl: ToastController) {
      this.globalObj.tabSelected = 'userwise';
      this.globalObj.userTypeTab = '';
      this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.studentUserId = window.localStorage.getItem('studentUserId');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.fromDate = '';
    this.globalObj.toDate = '';
    
  }

  ionViewDidLoad() {
      
      this.globalObj.selectType = '';
      this.checkedItems = new Array();
      this.checkedItemsParent = new Array();
      
      let userId = this.globalObj.loginId;
      let user_type = this.globalObj.userType;
    
    if(this.globalObj.userType.toLowerCase() == 'parent'){
        userId = this.globalObj.studentUserId;
        user_type = 'Student';
    }
      
      let params = {
        user_id: userId,
        user_type: user_type,
        school_id:this.globalObj.schoolId,
        token: this.globalObj.token,
        session_id: this.globalObj.sessionId
      };
    this.http.post(this.globalObj.serverUrl+"communication/getcomposepopdata", params).subscribe(data => {
        const details: any = data;
        this.admindata = details.response[0].admin;
        var sectionlist = details.response[0].assignClass;
        var sectionlists = details.response[0].assignClass;
        
        for(let i in sectionlist){
            this.sectionlist.push({
                        section_id: sectionlist[i].section_id,
                        section_name: sectionlist[i].section_name,
                        check: false,
                        assignStudent:[]
                    });
            this.checkedItems.push(false);

            for(let k in sectionlist[i].assignStudent){
                this.sectionlist[i].assignStudent.push({
                    user_id: sectionlist[i].assignStudent[k].user_id,
                    old_user_id: sectionlist[i].assignStudent[k].old_user_id,
                    student_name: sectionlist[i].assignStudent[k].student_name,
                    admission_no: sectionlist[i].assignStudent[k].admission_no,
                    parent_userId: sectionlist[i].assignStudent[k].parent_userId,
                    check: false
                })
            }
        }
        
        
        for(let i in sectionlists){
            this.sectionlists.push({
                        section_id: sectionlists[i].section_id,
                        section_name: sectionlists[i].section_name,
                        check: false,
                        assignStudent:[]
                    });
            this.checkedItemsParent.push(false);
            for(let k in sectionlists[i].assignStudent){
                this.sectionlists[i].assignStudent.push({
                    user_id: sectionlists[i].assignStudent[k].user_id,
                    old_user_id: sectionlists[i].assignStudent[k].old_user_id,
                    student_name: sectionlists[i].assignStudent[k].student_name,
                    admission_no: sectionlists[i].assignStudent[k].admission_no,
                    parent_userId: sectionlists[i].assignStudent[k].parent_userId,
                    check: false
                })
            }
        }
        
        const teacherList = details.response[0].assignteachers;
        for(let key in teacherList){
            if(teacherList[key].class_teacher == 'No'){
              this.teacherList.push({
                    name: teacherList[key].name,
                    user_id: teacherList[key].user_id
                  });
            }else{
               this.classTeacherList.push({
                    name: teacherList[key].name,
                    user_id: teacherList[key].user_id
                  });
            }
        }
        
        this.http.post(this.globalObj.serverUrl+"staffs/stafflistbyschoolid", params).subscribe(data => {
            const details: any = data;
            this.staffList = details.response;
        });
    });
    
  }
  
  dismiss(){
      var finalObj = {
          receipent: [],
          selectedType: this.globalObj.selectType,
          fromDate: '',
          toDate: ''
        };
        this.displayRecepient = [];
      this.viewCtrl.dismiss(finalObj);
  }
  
  okFunction(){
      
      if(this.globalObj.fromDate && !this.globalObj.toDate){
          this.presentToast('Please select to date.');
          return false;
      }
      if(!this.globalObj.fromDate && this.globalObj.toDate){
          this.presentToast('Please select from date.');
          return false;
      }
      
      var finalArr = [];
      
      
     
      for(let k in this.displayRecepient){
          if(this.displayRecepient[k].check == true){
              finalArr.push({
                name: this.displayRecepient[k].name,
                user_id: this.displayRecepient[k].user_id,
                admissionNo: this.displayRecepient[k].admissionNo,
                check: true,
                studUserId: this.displayRecepient[k].studUserId
              });
          }
      }
      
      
      var finalObj = {
          receipent: finalArr,
          selectedType: this.globalObj.selectType,
          fromDate: this.globalObj.fromDate,
          toDate: this.globalObj.toDate
        };
        
        
      
      this.displayRecepient = [];
      this.viewCtrl.dismiss(finalObj);
  }
  
  userSelect(type){
      this.displayRecepient = [];
      this.globalObj.selectType = type;
      
      if(type == 'admin'){
          for(let k in this.admindata){
                this.displayRecepient.push({
                    user_id: this.admindata[k].user_id,
                    name: this.admindata[k].name,
                    admissionNo: '',
                    check: false,
                      studUserId: ''
                })
          }
      }else if(type == 'student'){
         this.globalObj.selectType = type;
         for(let ind in this.sectionlist){
             for(let index in this.sectionlist[ind].assignStudent){
                 this.displayRecepient.push({
                    name: this.sectionlist[ind].assignStudent[index].student_name,
                    user_id: this.sectionlist[ind].assignStudent[index].user_id,
                    admissionNo: this.sectionlist[ind].assignStudent[index].admission_no,
                    check: false,
                    studUserId: ''
                  });
             }
         }
      }else if(type == 'parent'){
          this.globalObj.selectType = type;
          for(let ind in this.sectionlists){
             for(let index in this.sectionlists[ind].assignStudent){
                 this.displayRecepient.push({
                    name: this.sectionlists[ind].assignStudent[index].student_name+ " (P)",
                    user_id: this.sectionlists[ind].assignStudent[index].parent_userId,
                    admissionNo: this.sectionlists[ind].assignStudent[index].admission_no,
                    check: false,
                    studUserId: this.sectionlists[ind].assignStudent[index].user_id
                  });
             }
         }
         
      }else if(type == 'staff'){
          for(let k in this.staffList){
              this.displayRecepient.push({
                      user_id: this.staffList[k].userId,
                      name: this.staffList[k].name,
                      admissionNo: '',
                      check: false,
                      studUserId: ''
               })
          }
      }else if(type ==  'classteach'){
          for(let k in this.classTeacherList){
              this.displayRecepient.push({
                      user_id: this.classTeacherList[k].user_id,
                      name: this.classTeacherList[k].name,
                      admissionNo: '',
                      check: false,
                      studUserId: ''
               })
          }
      }else if(type ==  'subteach'){
          for(let k in this.teacherList){
              this.displayRecepient.push({
                      user_id: this.teacherList[k].user_id,
                      name: this.teacherList[k].name,
                      admissionNo: '',
                      check: false,
                      studUserId: ''
               })
          }
      }
  }
  
  
  getStudent(index, type){
      if(type == 'student'){
          if(this.sectionlist[index].check){
              this.sectionlist[index].check = false;
          }else{
              this.sectionlist[index].check = true;
          }
          this.sectionlist = this.sectionlist;
      }else if(type == 'parent'){
          if(this.sectionlists[index].check){
              this.sectionlists[index].check = false;
          }else{
              this.sectionlists[index].check = true;
          }
          this.sectionlists = this.sectionlists;
      }
  }
  
  addFinalReceipent(userId, index, ischeck){
      if(ischeck){
          this.displayRecepient[index].check = false;
      }else{
          this.displayRecepient[index].check = true;
      }
      
  }
  
  checkedStudent(flag, userId, indexSec, indexStud, studUserId){
      
            
      
            for(let ind in this.displayRecepient){
                if(flag == 'parent'){
                    if(studUserId == this.displayRecepient[ind].studUserId) {
                        if(this.displayRecepient[ind].check){
                                this.displayRecepient[ind].check = false;
                        }else{
                            this.displayRecepient[ind].check = true;
                        }
                    }
                }else{
                    if(this.displayRecepient[ind].user_id == userId){
                        if(this.displayRecepient[ind].check){
                                this.displayRecepient[ind].check = false;
                        }else{
                            this.displayRecepient[ind].check = true;
                        }
                    }
                }
                
                    
            }
            
             
            
            if(flag == 'parent'){
                if(this.sectionlists[indexSec].assignStudent[indexStud].check){
                    this.sectionlists[indexSec].assignStudent[indexStud].check=false;
                }else{
                    this.sectionlists[indexSec].assignStudent[indexStud].check=true;
                }

                var checkAllFlag = true;
                for(let ind in this.sectionlists){
                    for(let k in this.sectionlists[ind].assignStudent){
                        if(this.sectionlists[ind].assignStudent[k].check == false){
                            checkAllFlag = false;
                        }
                    }
                }

                if(checkAllFlag){
                    this.checkedItemsParent[indexSec]=true;
                }else{
                    this.checkedItemsParent[indexSec]=false;
                }
            }else if(flag == 'student'){
                if(this.sectionlist[indexSec].assignStudent[indexStud].check){
                    this.sectionlist[indexSec].assignStudent[indexStud].check=false;
                }else{
                    this.sectionlist[indexSec].assignStudent[indexStud].check=true;
                }

                var checkAllFlag = true;
                for(let ind in this.sectionlist){
                    for(let k in this.sectionlist[ind].assignStudent){
                        if(this.sectionlist[ind].assignStudent[k].check == false){
                            checkAllFlag = false;
                        }
                    }
                }

                if(checkAllFlag){
                    this.checkedItems[indexSec]=true;
                }else{
                    this.checkedItems[indexSec]=false;
                }
            }
            
            
            
     
  }
  
  onChange($event) {
    
  }
  
   openCalendar(flag){
       if(flag == 'fromdate'){
        let modal = this.popCtrl.create(DatepickercalendarPage,{},{cssClass: 'contact-popover', showBackdrop: true});
        modal.onDidDismiss(data => {
            if(data){
                if(this.globalObj.toDate && data.date > this.globalObj.toDate){
                    this.presentToast('Please select from date less or equal to date.');
                    this.globalObj.fromDate = this.globalObj.fromDate;
                }else{
                    this.globalObj.fromDate = data.date;
                }
              
            }
          });
        modal.present();
       }else if(flag == 'todate'){
           let modal = this.popCtrl.create(DatepickercalendarPage,{},{cssClass: 'contact-popover', showBackdrop: true});
        modal.onDidDismiss(data => {
            if(data){
                if(this.globalObj.fromDate > data.date){
                    this.presentToast('Please select to date greater or equal to from date.');
                }else{
                    this.globalObj.toDate = data.date;
                }
                    
            }
          });
        modal.present();
       } 
    }
    
    presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }
 
  
}
