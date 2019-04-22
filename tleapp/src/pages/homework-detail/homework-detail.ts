import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Modal, ModalController, ToastController ,AlertController} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FormGroup, FormControl, FormArray } from '@angular/forms'

/**
 * Generated class for the HomeworkDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homework-detail',
  templateUrl: 'homework-detail.html',
})
export class HomeworkDetailPage {
  globalObj: any = {};
  domainUrl: string = '';
  serverUrl: string = '';
  detail_filter: any = 'allhome'  
  public token: any;
  public homeworkdetail: any;
  public allhomework: any = 0;
  public subhomework: any = 0;
  public subhomeworkstring: any;
  public nsubhomeworkstring: any;
  public chksubhomeworkstring: any;
  public nchksubhomeworkstring: any;
  public latehomeworkstring: any;
  public subhomeworkarr: any = [];
  public nsubhomework: any = 0;
  public nsubhomeworkarr: any = [];
  public chksubhomework: any = 0;
  public chksubhomeworkarr: Array<any> = new Array<any>();
  public nchksubhomework: any = 0;
  public nchksubhomeworkarr: Array<any> = new Array<any>();
  public allhomeworkarr: Array<any> = new Array<any>();
  public allhomeworkarrfinal: Array<any> = new Array<any>();
  public allhomeworkarrfinalOrig: Array<any> = new Array<any>();
  public latehomework: any = 0;
  public latehomeworkarr: Array<any> = new Array<any>();
  public latehomeworkarrfinal: Array<any> = new Array<any>();
  public latehomeworkarrfinalOrig: Array<any> = new Array<any>();
  public responseMessage: boolean = false;
  public popmessage: any = '';
  public user_id :any = '';
  closeFlag: any = [];
  subhomeworkarrfinal: any = [];
  subhomeworkarrfinalOrig: any = [];
  nsubhomeworkarrfinal: any = [];
  nsubhomeworkarrfinalOrig: any = [];
  nchksubhomeworkarrfinal: any = [];
  nchksubhomeworkarrfinalOrig: any = [];
  public id : any;
  public userid : any;
  public message : any;
  submitColClick = false;
  checkColClick = false;
  
  constructor(private toastCtrl: ToastController, private modal: ModalController, public navCtrl: NavController, 
    public navParams: NavParams, private http: HttpClient, private myProvider: CommonProvider,private alertCtrl: AlertController) {
      this.domainUrl = this.myProvider.globalObj.constant.domainUrl;
  }

  ionViewCanEnter(){
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;

    this.globalObj.data = this.navParams.get('data');
    this.globalObj.homework_id = this.navParams.get('id');
    if(this.globalObj.userType.toLowerCase() == 'teacher'){
      this.updatemodulenotification();
      this.homeworkList()
    }  
  }

  initializeHomework(){
        this.globalObj.student_detail = []
        this.nsubhomeworkarr = []
        this.subhomeworkarr = []
        this.chksubhomeworkarr = [] 
        this.nchksubhomeworkarr = [] 
        this.latehomeworkarr = [] 
        this.allhomeworkarr = []
  }

  homeworkList(){
    if(!this.globalObj.data)
    {
      this.globalObj.data = {};
      this.globalObj.data.homework_id = this.globalObj.homework_id;
    }
    
    const params = {
      homework_id: this.globalObj.data.homework_id,
      token: this.globalObj.token
    }

    const url = this.serverUrl + "homework/homeworkdetail"
  
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj.result = data.response.homework_detail
        this.initializeHomework()
        this.globalObj.student_detail = data.response.student_detail
     
        this.homeworkdetail = data.response;
      
        this.allhomework = "All Students ("+this.homeworkdetail.student_detail.length+")";
        let submitcount = 0;
        let ntsubmitcount = 0;
        let unchksubcount = 0;
        let chksubcount = 0;
        let latsubcount = 0;
  
        let count = this.homeworkdetail.student_detail.length;
        this.homeworkdetail.student_detail.forEach((element, key) => {
          let tempflag = false;
          this.closeFlag[element.user_id] = (element.remark_date == '')? 'close': 'checkmark';
          if (element.submitted_date != '') {
            let submdate = Date.parse(element.submitted_date);
            let tardate = Date.parse(this.homeworkdetail.homework_detail.target_date);
            if (submdate > tardate) {
              tempflag = true;
            }
          }
  
          if (element.submitted_date == '') {
            ntsubmitcount++;
            this.nsubhomeworkarr.push(element);
          }

          if (element.submitted_date != '' && element.remark_date == '') {
            submitcount++;
            this.subhomeworkarr.push(element);
          }
          if (element.submitted_date != '' && element.remark_date != '') {
            chksubcount++;
            this.chksubhomeworkarr.push(element);
          }
          if (element.submitted_date != '' && element.remark_date == '') {
            unchksubcount++;
            this.nchksubhomeworkarr.push(element);
          }
          if (element.submitted_date != '' && tempflag) {
            latsubcount++;
            this.latehomeworkarr.push(element);
          }
          this.allhomeworkarr.push(element);
        });
        this.arrayreturn('allhome');
       
        if (submitcount > 0) {
          this.arrayreturn('submit');
        }

        if (ntsubmitcount > 0) {
          this.arrayreturn('nsubmit');
        }

        if (unchksubcount > 0) {
          this.arrayreturn('unchksubmit');
        }

        if (latsubcount > 0) {
          this.arrayreturn('latesubmit');
        }
  
        this.subhomework = submitcount;
        this.subhomeworkstring = "Submitted ("+submitcount+")";
        this.nsubhomework = ntsubmitcount;
        this.nsubhomeworkstring = "Not Submitted ("+ntsubmitcount+")";
        this.chksubhomework = chksubcount;
        this.chksubhomeworkstring = "Checked Submissions ("+chksubcount+")";
        this.nchksubhomework = unchksubcount;
        this.nchksubhomeworkstring = "Unchecked Submissions ("+unchksubcount+")";
        this.latehomework = latsubcount;
        this.latehomeworkstring = "Late Submissions ("+latsubcount+")";
      })
  }
  
  segmentChanged(){
    this.globalObj.student_detail = (this.detail_filter == "nsubmit") ? this.nsubhomeworkarr : this.globalObj.student_detail
    this.globalObj.student_detail = (this.detail_filter == "submit") ? this.subhomeworkarr : this.globalObj.student_detail
    this.globalObj.student_detail = (this.detail_filter == "checked") ? this.chksubhomeworkarr : this.globalObj.student_detail
    this.globalObj.student_detail = (this.detail_filter == "unchksubmit") ? this.nchksubhomeworkarr : this.globalObj.student_detail
    this.globalObj.student_detail = (this.detail_filter == "latesubmit") ? this.latehomeworkarr : this.globalObj.student_detail
    this.globalObj.student_detail = (this.detail_filter == "allhome") ? this.allhomeworkarr : this.globalObj.student_detail
  }  
    
  arrayreturn(callfor) {
    let tempArray = [];
    let loopcounter = 0;
    switch (callfor) {
      case "allhome":
        tempArray = this.allhomeworkarr;
        this.allhomeworkarr = [];

        for (let key in tempArray) {
          if(tempArray[key].user_id){
            this.closeFlag[tempArray[key].user_id] = (tempArray[key].remark_date) ? 'checkmark' : 'close'
          }
          this.allhomeworkarr.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            roll_no: tempArray[key].roll_no,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].remark_date != '' ? '1' : '0',
            submit_nsubmit: tempArray[key].submitted_date != '' ? '1' : '0',
            all_done: (tempArray[key].submitted_date != '' && tempArray[key].remark_date != '') ? '1' : '0'
          });
        }
        this.allhomeworkarrfinal = this.allhomeworkarr;
        this.allhomeworkarrfinalOrig = this.allhomeworkarr;
        break;

      case "submit":
        tempArray = this.subhomeworkarr;
        this.subhomeworkarr = [];
        for (let key in tempArray) {
          this.subhomeworkarr.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            roll_no: tempArray[key].roll_no,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].remark_date != '' ? '1' : '0',
            submit_nsubmit: tempArray[key].submitted_date != '' ? '1' : '0',
            all_done: '0'
          });
        }
        this.subhomeworkarrfinal = this.subhomeworkarr;
        this.subhomeworkarrfinalOrig = this.subhomeworkarr;
        break;
      case "nsubmit":
        tempArray = this.nsubhomeworkarr;
        this.nsubhomeworkarr = [];
        for (let key in tempArray) {
          this.nsubhomeworkarr.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            roll_no: tempArray[key].roll_no,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].remark_date != '' ? '1' : '0',
            submit_nsubmit: tempArray[key].submitted_date != '' ? '1' : '0',
            all_done: (tempArray[key].submitted_date != '' && tempArray[key].remark_date != '') ? '1' : '0'
          });
        }
        this.nsubhomeworkarrfinal = this.nsubhomeworkarr;
        this.nsubhomeworkarrfinalOrig = this.nsubhomeworkarr;
        break;
      case "unchksubmit":
        tempArray = this.nchksubhomeworkarr;
        this.nchksubhomeworkarr = [];
        for (let key in tempArray) {
          this.nchksubhomeworkarr.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            roll_no: tempArray[key].roll_no,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].remark_date != '' ? '1' : '0',
            submit_nsubmit: tempArray[key].submitted_date != '' ? '1' : '0',
            all_done: '0'
          });
        }
        this.nchksubhomeworkarrfinal = this.nchksubhomeworkarr;
        this.nchksubhomeworkarrfinalOrig = this.nchksubhomeworkarr;
        break;
      case "latesubmit":
        tempArray = this.latehomeworkarr;
        this.latehomeworkarr = [];
        for (let key in tempArray) {
          this.latehomeworkarr.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            roll_no: tempArray[key].roll_no,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].remark_date != '' ? '1' : '0',
            submit_nsubmit: tempArray[key].submitted_date != '' ? '1' : '0',
            all_done: (tempArray[key].submitted_date != '' && tempArray[key].remark_date != '') ? '1' : '0'
          });
        }
        this.latehomeworkarrfinal = this.latehomeworkarr;
        this.latehomeworkarrfinalOrig = this.latehomeworkarr;
        break;
    }
  }

  changeSubmitStatus(val, user, callfromtab){
    this.submitColClick = true;
    let tempArray = [];
    let loopcounter = 0;
    val = (val == 'submit') ? '1': '0'
    
    switch (callfromtab) {
      case "allhome":
        tempArray = this.allhomeworkarrfinal;
        this.allhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.allhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].check_uncheck,
            submit_nsubmit: user == tempArray[key].user_id ? val : tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "submit":
        tempArray = this.subhomeworkarrfinal;
        this.subhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.subhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].check_uncheck,
            submit_nsubmit: user == tempArray[key].user_id ? val : tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "nsubmit":
        tempArray = this.nsubhomeworkarrfinal;
        this.nsubhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.nsubhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].check_uncheck,
            submit_nsubmit: user == tempArray[key].user_id ? val : tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "unchksubmit":
        tempArray = this.nchksubhomeworkarrfinal;
        this.nchksubhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.nchksubhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].check_uncheck,
            submit_nsubmit: user == tempArray[key].user_id ? val : tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });

        }
        break;
      case "latesubmit":
        tempArray = this.latehomeworkarrfinal;
        this.latehomeworkarrfinal = [];
        for (let key in tempArray) {
          this.latehomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: tempArray[key].check_uncheck,
            submit_nsubmit: user == tempArray[key].user_id ? val : tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      }
  }

  changeremarkstatus(event, user, callfromtab) {
    this.checkColClick = true;
    this.closeFlag[user] = (this.closeFlag[user] == 'close')? 'checkmark': 'close';
    let check_uncheck = (this.closeFlag[user] == 'close')? '0': '1';
    let tempArray = [];
    let loopcounter = 0;
    switch (callfromtab) {
      case "allhome":
        tempArray = this.allhomeworkarrfinal;
        this.allhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.allhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: (tempArray[key].user_id == user) ? check_uncheck : tempArray[key].check_uncheck,
            submit_nsubmit: tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "submit":
        tempArray = this.subhomeworkarrfinal;
        this.subhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.subhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: (tempArray[key].user_id == user) ? check_uncheck : tempArray[key].check_uncheck,
            submit_nsubmit: tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "nsubmit":
        tempArray = this.nsubhomeworkarrfinal;
        this.nsubhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.nsubhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: (tempArray[key].user_id == user) ? check_uncheck : tempArray[key].check_uncheck,
            submit_nsubmit: tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "unchksubmit":
        tempArray = this.nchksubhomeworkarrfinal;
        this.nchksubhomeworkarrfinal = [];
        for (let key in tempArray) {
          this.nchksubhomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: (tempArray[key].user_id == user) ? check_uncheck : tempArray[key].check_uncheck,
            submit_nsubmit: tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
      case "latesubmit":
        tempArray = this.latehomeworkarrfinal;
        this.latehomeworkarrfinal = [];
        for (let key in tempArray) {
          this.latehomeworkarrfinal.push({
            name: tempArray[key].name,
            user_id: tempArray[key].user_id,
            remark_date: tempArray[key].remark_date,
            submitted_date: tempArray[key].submitted_date,
            check_uncheck: (tempArray[key].user_id == user) ? check_uncheck : tempArray[key].check_uncheck,
            submit_nsubmit: tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });
        }
        break;
    }
  }

  presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  actionFunc(user_id, name){
    if(this.submitColClick)
    {
      this.submitColClick = false;
      return;
    }
    if(this.checkColClick)
    {
      this.checkColClick = false;
      return;
    }
    if(!user_id) return;
    this.navCtrl.push('HomeworkCheckPage', {name: name, user_id: user_id, homework_id: this.globalObj.data.homework_id})
  }

  submitdata(submitfor) {
    switch(submitfor) {
      case "allhome":
        if(this.allhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          
          let uncheck_length = this.allhomeworkarrfinal.filter(el => el.check_uncheck == '0').length 
        
          for (let key in this.allhomeworkarrfinal) {
            this.allhomeworkarrfinal[key].all_done = (uncheck_length > 0) ? '0': '1'
            // if (this.allhomeworkarrfinal[key].submit_nsubmit == '1' &&
            //    (this.allhomeworkarrfinal[key].check_uncheck == '0' || 
            //     this.allhomeworkarrfinal[key].check_uncheck == '1')) 
            if ((this.allhomeworkarrfinal[key].submit_nsubmit != this.allhomeworkarrfinalOrig[key].submit_nsubmit) ||
            (this.allhomeworkarrfinal[key].check_uncheck != this.allhomeworkarrfinalOrig[key].check_uncheck))
                {
              userids = userids + this.allhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.allhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if(userids) {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            
            const params = {
              "homework_id": this.globalObj.data.homework_id,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.globalObj.token
            };
            this.http.post(this.serverUrl + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              this.homeworkResponseMsg() 
            });
          }
          else {
            this.presentToast("Kindly select at least one student to submit/remark");
            return false;
          }
        }
        else {
          this.presentToast("Kindly select at least one student to submit/remark");
          return false;
        }
        break;
      case "submit":
        if (this.subhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";

          let uncheck_length = this.subhomeworkarrfinal.filter(el => el.check_uncheck == '0').length 
          for (let key in this.subhomeworkarrfinal) {
            this.subhomeworkarrfinal[key].all_done = (uncheck_length > 0) ? '0': '1'
            // if (this.subhomeworkarrfinal[key].submit_nsubmit == '1' &&
            //    (this.subhomeworkarrfinal[key].check_uncheck == '0' || 
            //    this.subhomeworkarrfinal[key].check_uncheck == '1'))
            if ((this.subhomeworkarrfinal[key].submit_nsubmit != this.subhomeworkarrfinalOrig[key].submit_nsubmit) ||
              (this.subhomeworkarrfinal[key].check_uncheck != this.subhomeworkarrfinalOrig[key].check_uncheck))
                {
              userids = userids + this.subhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.subhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.globalObj.data.homework_id,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.serverUrl + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              this.homeworkResponseMsg() 
            });
          }
          else {
            this.presentToast("Kindly select at least one student to submit/remark");
            return false;
          }
        }
        else {
          this.presentToast("Kindly select at least one student to submit/remark");
          return false;
        }
        break;
      case "nsubmit":
        if (this.nsubhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          let uncheck_length = this.nsubhomeworkarrfinal.filter(el => el.check_uncheck == '0').length
          for (let key in this.nsubhomeworkarrfinal) {
            this.nsubhomeworkarrfinal[key].all_done = (uncheck_length > 0) ? '0': '1'
            // if (this.nsubhomeworkarrfinal[key].submit_nsubmit == '1' && 
            //    (this.nsubhomeworkarrfinal[key].check_uncheck == '0' || 
            //    this.nsubhomeworkarrfinal[key].check_uncheck == '1'))
            if ((this.nsubhomeworkarrfinal[key].submit_nsubmit != this.nsubhomeworkarrfinalOrig[key].submit_nsubmit) ||
              (this.nsubhomeworkarrfinal[key].check_uncheck != this.nsubhomeworkarrfinalOrig[key].check_uncheck)) 
               {
              userids = userids + this.nsubhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.nsubhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.globalObj.data.homework_id,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.serverUrl + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              this.homeworkResponseMsg() 
            });
          }
          else {
            this.presentToast("Kindly select at least one student to submit/remark");
            return false;
          }
        }
        else {
          this.presentToast("Kindly select at least one student to submit/remark");
          return false;
        }
        break;
      case "unchksubmit":
        if (this.nchksubhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          let uncheck_length = this.nchksubhomeworkarrfinal.filter(el => el.check_uncheck == '0').length
          for (let key in this.nchksubhomeworkarrfinal) {
            this.nchksubhomeworkarrfinal[key].all_done = (uncheck_length > 0) ? '0': '1'
            // if (this.nchksubhomeworkarrfinal[key].submit_nsubmit == '1' &&
            //    (this.nchksubhomeworkarrfinal[key].check_uncheck == '0' || 
            //    this.nchksubhomeworkarrfinal[key].check_uncheck == '1'))
            if ((this.nchksubhomeworkarrfinal[key].submit_nsubmit != this.nchksubhomeworkarrfinalOrig[key].submit_nsubmit) ||
            (this.nchksubhomeworkarrfinal[key].check_uncheck != this.nchksubhomeworkarrfinalOrig[key].check_uncheck))
                {
              userids = userids + this.nchksubhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.nchksubhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.globalObj.data.homework_id,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.serverUrl + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              this.homeworkResponseMsg() 
            });
          }
          else {
            this.presentToast("Kindly select at least one student to submit/remark");
            return false;
          }
        }
        else {
          this.presentToast("Kindly select at least one student to submit/remark");
          return false;
        }
        break;
      case "latesubmit":
        if (this.latehomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          let uncheck_length = this.latehomeworkarrfinal.filter(el => el.check_uncheck == '0').length
          for (let key in this.latehomeworkarrfinal) {
            this.latehomeworkarrfinal[key].all_done = (uncheck_length > 0) ? '0': '1'
            // if (this.latehomeworkarrfinal[key].submit_nsubmit == '1' &&
            //    (this.latehomeworkarrfinal[key].check_uncheck == '0' ||
            //   this.latehomeworkarrfinal[key].check_uncheck == '1'))
            if ((this.latehomeworkarrfinal[key].submit_nsubmit != this.latehomeworkarrfinalOrig[key].submit_nsubmit) ||
            (this.latehomeworkarrfinal[key].check_uncheck != this.latehomeworkarrfinalOrig[key].check_uncheck))
               {
              userids = userids + this.latehomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.latehomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.globalObj.data.homework_id,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.serverUrl + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              this.homeworkResponseMsg() 
            });
          }
          else {
            this.presentToast("Kindly select at least one student to submit/remark");
            return false;
          }
        }
        else {
          this.presentToast("Kindly select at least one student to submit/remark");
          return false;
        }
        break;
    }
    this.homeworkList();
  }

  updatemodulenotification()
  {
    const param = {
            'user_id' : this.globalObj.loginId,
            'type': [4],
            'token': this.globalObj.token
       };
    this.http.post(this.serverUrl + 'notification/updatemodulenotification', param).subscribe(details => {
    });
  }

  openEyeModal(args){
    const eyeModal: Modal = this.modal.create('ModalPage', { data: args })
    eyeModal.present()

    eyeModal.onDidDismiss(data => {
      console.log('i have dismissed eye modal')
    })

    eyeModal.onWillDismiss( data => {
      console.log('i am about to dismiss eye modal')
    })
  }

  homeworkResponseMsg()
  {
    
              if (this.popmessage.response_status.status == '200') {
                // this.presentToast(this.popmessage.response_status.message)
                let alert = this.alertCtrl.create({
                  title: 'Success',
                  subTitle: this.popmessage.response_status.message,
                  buttons: [{
                          text: 'ok',
                          handler: () => {
                            this.navCtrl.setRoot('HomeworkPage')
                          }
  }]
              });
              alert.present();
              }else{
                let alert = this.alertCtrl.create({
                  title: 'Error',
                  subTitle: this.popmessage.response_status.message,
                  buttons: [{
                          text: 'ok',
                          handler: () => {
                            this.navCtrl.setRoot('HomeworkPage')
                          }
  }]
              });
              alert.present();
              }
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter(){
    
  }

  ionViewWillLeave(){
    
  }

  ionViewDidEnter(){

  }

  ionViewDidLeave(){

  }

}
