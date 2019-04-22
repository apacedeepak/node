import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,PopoverController ,ToastController,ViewController} from 'ionic-angular';
import { CalendarComponentOptions } from 'ion2-calendar';
import { DatepickercalendarPage } from '../datepickercalendar/datepickercalendar';

/**
 * Generated class for the HomeworkFilterDateSubjectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homework-filter-date-subject',
  templateUrl: 'homework-filter-date-subject.html',
})
export class HomeworkFilterDateSubjectPage {
  public globalObj: any = {};

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private popCtrl: PopoverController,private toastCtrl: ToastController,
              private viewCtrl: ViewController) {
    this.globalObj.tabSelected = 'datewise';
    this.globalObj.fromDate = '';
    this.globalObj.toDate = '';
    this.globalObj.searchFor = '';
    this.globalObj.subjectId = [];
    this.globalObj.subjectName = [];
    this.globalObj.isSubjectAssigned = true;
    this.globalObj.assignChecked = false;
    this.globalObj.submitChecked = false;
    this.globalObj.assignedSubject = this.navParams.get('subjectData');
    this.globalObj.homework = this.navParams.get('homework');
    if(this.globalObj.assignedSubject.length==0)
    {
      this.globalObj.isSubjectAssigned =  false;
    }
    else{
      let tempArr = [];
      for(let key in this.globalObj.assignedSubject)
      {
        let tempObj = {subject_id:this.globalObj.assignedSubject[key].subject_id,
                      subject_name:this.globalObj.assignedSubject[key].subject_name,
                      checked:false};
                      tempArr.push(tempObj);
      }
      this.globalObj.assignedSubject = [];
      this.globalObj.assignedSubject = tempArr;
    }
  }
  openCalendar(flag){
    if(this.globalObj.searchFor=='')
    {
      this.presentToast('Please select at least one search for');
    }
    else{
    if(flag == 'fromdate'){
     let modal = this.popCtrl.create(DatepickercalendarPage,{},{cssClass: 'contact-popover', showBackdrop: true});
     modal.onDidDismiss(data => {
         if(data){
          if((this.globalObj.toDate) && (data.date > this.globalObj.toDate)){
            this.presentToast('Please select from date less or equal to to date.');
            this.globalObj.fromDate = '';
        }
        else{
           this.globalObj.fromDate = data.date;
        }
         }
       });
     modal.present();
    }else if(flag == 'todate'){
      if(this.globalObj.fromDate)
      {
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
    else{
      this.presentToast('Please select  from date.');
    }
  }  
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
dismiss(){
  var finalObj = {};
    
  this.viewCtrl.dismiss(finalObj);
}

okFunction(){
  
  var finalObj = {searchFor:this.globalObj.searchFor,dateData:{fromDate:this.globalObj.fromDate,toDate:this.globalObj.toDate},subjectId:this.globalObj.subjectId,subjectName:this.globalObj.subjectName};  
  this.viewCtrl.dismiss(finalObj);
}
setSubject(subjectdata)
{
 
     
      var index = this.globalObj.subjectId.indexOf(subjectdata.subject_id);
      if(index!=-1)
      {
      this.globalObj.subjectId.splice(index,1);
      this.globalObj.subjectName.splice(index,1);
      let tempArr = [];
      for(let key in this.globalObj.assignedSubject)
      {
        let flagval = this.globalObj.assignedSubject[key].subject_id==subjectdata.subject_id?false:this.globalObj.assignedSubject[key].checked;
        let tempObj = {subject_id:this.globalObj.assignedSubject[key].subject_id,
                      subject_name:this.globalObj.assignedSubject[key].subject_name,
                      checked:flagval};
                      tempArr.push(tempObj);
      }
      this.globalObj.assignedSubject = [];
      this.globalObj.assignedSubject = tempArr;
      }
      else
      {
      this.globalObj.subjectId.push(subjectdata.subject_id);
      this.globalObj.subjectName.push(subjectdata.subject_name);
      let tempArr = [];
      for(let key in this.globalObj.assignedSubject)
      {
        let flagval = this.globalObj.assignedSubject[key].subject_id==subjectdata.subject_id?true:this.globalObj.assignedSubject[key].checked;
        let tempObj = {subject_id:this.globalObj.assignedSubject[key].subject_id,
                      subject_name:this.globalObj.assignedSubject[key].subject_name,
                      checked:flagval};
                      tempArr.push(tempObj);
      }
      this.globalObj.assignedSubject = [];
      this.globalObj.assignedSubject = tempArr;
      }
    
}
setSearchFor(val)
{ if(val=='assignment')
{
  this.globalObj.assignChecked = true;
  this.globalObj.submitChecked = false;
}
if(val=='submit')
{
  this.globalObj.assignChecked = false;
  this.globalObj.submitChecked = true;
}
  this.globalObj.assignChecked
  this.globalObj.searchFor = val;

}
close(){
  this.navCtrl.pop();
  // this.navCtrl.push("HomeworkPage");
}

  ionViewDidLoad() {
    //console.log('ionViewDidLoad HomeworkFilterDateSubjectPage');
  }

}
