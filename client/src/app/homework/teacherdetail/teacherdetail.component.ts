import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { element } from 'protractor';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-teacherdetail',
  templateUrl: './teacherdetail.component.html',
  styleUrls: ['./teacherdetail.component.css']
})
export class TeacherdetailComponent implements OnInit ,AfterContentInit {
  // http://test.etl.extramarks.com:3001/api/homework/homeworkdetail
  //"{“homework_id”:1,
  //“token”:”1234567777”}"
  public token: any;
  public homeworkId: any;
  public homeworkdetail: any;
  public allhomework: any = 0;
  public subhomework: any = 0;
  public subhomeworkstring: any;
  public nsubhomeworkstring: any;
  public chksubhomeworkstring: any;
  public nchksubhomeworkstring: any;
  public latehomeworkstring: any;


  public subhomeworkarr: Array<any> = new Array<any>();
  public subhomeworkarrfinal: Array<any> = new Array<any>()
  public nsubhomework: any = 0;
  public nsubhomeworkarr: Array<any> = new Array<any>();
  public nsubhomeworkarrfinal: Array<any> = new Array<any>();
  public chksubhomework: any = 0;
  public chksubhomeworkarr: Array<any> = new Array<any>();
  public chksubhomeworkarrfinal: Array<any> = new Array<any>();
  public nchksubhomework: any = 0;
  public nchksubhomeworkarr: Array<any> = new Array<any>();
  public nchksubhomeworkarrfinal: Array<any> = new Array<any>();
  public allhomeworkarr: Array<any> = new Array<any>();
  public allhomeworkarrfinal: Array<any> = new Array<any>();
  public latehomework: any = 0;
  public latehomeworkarr: Array<any> = new Array<any>();
  public latehomeworkarrfinal: Array<any> = new Array<any>();
  public responseMessage: boolean = false;
  public popmessage: any = '';
  public serverurl :any = '';
  public user_id :any = '';
  mylang:any=''; 
  public product_type : any = '';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
     
    this.translate.setDefaultLang( this.mylang);
    
    this.translate.use(this.mylang);
  }
  constructor(private http: HttpClient, private myService: BackendApiService, private activatedRoute: ActivatedRoute,private translate: TranslateService) {

    this.activatedRoute.params.subscribe((params: Params) => {
      this.homeworkId = params['id'];
      //console.log(this.homeworkId);
    });
    this.token = window.localStorage.getItem('token');
    this.product_type = window.localStorage.getItem('product_type');
    this.user_id = window.localStorage.getItem('user_id');
    this.serverurl = this.myService.commonUrl;
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
    this.updatemodulenotification();

    const params = {
      "homework_id": this.homeworkId,
      "token": this.token

    };
    this.http.post(this.myService.constant.apiURL + "homework/homeworkdetail", params).subscribe(data => {
      const details: any = data;
      this.homeworkdetail = details.response;
      this.allhomework =  "("+this.homeworkdetail.student_detail.length+")";
      let submitcount = 0;
      let ntsubmitcount = 0;
      let unchksubcount = 0;
      let chksubcount = 0;
      let latsubcount = 0;


      let count = this.homeworkdetail.student_detail.length;

      this.homeworkdetail.student_detail.forEach((element, key) => {

        let tempflag = false;

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
      this.subhomeworkstring =  "("+submitcount+")";
      this.nsubhomework = ntsubmitcount;
      this.nsubhomeworkstring = "("+ntsubmitcount+")";
      this.chksubhomework = chksubcount;
      this.chksubhomeworkstring = "("+chksubcount+")";
      this.nchksubhomework = unchksubcount;
      this.nchksubhomeworkstring = "("+unchksubcount+")";
      this.latehomework = latsubcount;
      this.latehomeworkstring = "("+latsubcount+")";


    })
  }

  arrayreturn(callfor) {

    let tempArray = [];
    let loopcounter = 0;
    switch (callfor) {
      case "allhome":
        tempArray = this.allhomeworkarr;
        this.allhomeworkarr = [];

        for (let key in tempArray) {
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
        break;
    }

  }

  changesubmitstatus(event, user, callfromtab) {
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
            check_uncheck: tempArray[key].check_uncheck,
            submit_nsubmit: user == tempArray[key].user_id ? event.target.value : tempArray[key].submit_nsubmit,
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
            submit_nsubmit: user == tempArray[key].user_id ? event.target.value : tempArray[key].submit_nsubmit,
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
            submit_nsubmit: user == tempArray[key].user_id ? event.target.value : tempArray[key].submit_nsubmit,
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
            submit_nsubmit: user == tempArray[key].user_id ? event.target.value : tempArray[key].submit_nsubmit,
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
            submit_nsubmit: user == tempArray[key].user_id ? event.target.value : tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });

        }
        break;
    }
  }

  changeremarkstatus(event, user, callfromtab) {
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
            check_uncheck: user == tempArray[key].user_id ? event.target.value : tempArray[key].check_uncheck,
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
            check_uncheck: user == tempArray[key].user_id ? event.target.value : tempArray[key].check_uncheck,
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
            check_uncheck: user == tempArray[key].user_id ? event.target.value : tempArray[key].check_uncheck,
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
            check_uncheck: user == tempArray[key].user_id ? event.target.value : tempArray[key].check_uncheck,
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
            check_uncheck: user == tempArray[key].user_id ? event.target.value : tempArray[key].check_uncheck,
            submit_nsubmit: tempArray[key].submit_nsubmit,
            all_done: tempArray[key].all_done
          });

        }
        break;
    }
  }
  submitdata(submitfor) {
    switch (submitfor) {
      case "allhome":
        if (this.allhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          for (let key in this.allhomeworkarrfinal) {
            if (this.allhomeworkarrfinal[key].all_done == '0' && this.allhomeworkarrfinal[key].submit_nsubmit == '1' && (this.allhomeworkarrfinal[key].check_uncheck == '0' || this.allhomeworkarrfinal[key].check_uncheck == '1')) {
              userids = userids + this.allhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.allhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.homeworkId,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.myService.constant.apiURL + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              if (this.popmessage.response_status.status == '200') {

                this.responseMessage = true;

                this.popmessage = this.translate.instant(this.popmessage.response_status.message);




              }
            });
          }
          else {
            alert(this.translate.instant("Kindly select at least one student to submit/remark"));
            return false;
          }
        }
        else {
          alert(this.translate.instant("Kindly select at least one student to submit/remark"));
          return false;
        }
        break;
      case "submit":
        if (this.subhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          for (let key in this.subhomeworkarrfinal) {
            if (this.subhomeworkarrfinal[key].all_done == '0' && this.subhomeworkarrfinal[key].submit_nsubmit == '1' && (this.subhomeworkarrfinal[key].check_uncheck == '0' || this.subhomeworkarrfinal[key].check_uncheck == '1')) {
              userids = userids + this.subhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.subhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.homeworkId,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.myService.constant.apiURL + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              if (this.popmessage.response_status.status == '200') {

                this.responseMessage = true;
                
                this.popmessage = this.translate.instant(this.popmessage.response_status.message);




              }
            });
          }
          else {
            alert(this.translate.instant("Kindly select at least one student to submit/remark"));
            return false;
          }
        }
        else {
          alert(this.translate.instant("Kindly select at least one student to submit/remark"));
          return false;
        }
        break;
      case "nsubmit":
        if (this.nsubhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          for (let key in this.nsubhomeworkarrfinal) {
            if (this.nsubhomeworkarrfinal[key].all_done == '0' && this.nsubhomeworkarrfinal[key].submit_nsubmit == '1' && (this.nsubhomeworkarrfinal[key].check_uncheck == '0' || this.nsubhomeworkarrfinal[key].check_uncheck == '1')) {
              userids = userids + this.nsubhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.nsubhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.homeworkId,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.myService.constant.apiURL + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              if (this.popmessage.response_status.status == '200') {

                this.responseMessage = true;

                this.popmessage = this.translate.instant(this.popmessage.response_status.message);




              }
            });
          }
          else {
            alert(this.translate.instant("Kindly select at least one student to submit/remark"));
            return false;
          }
        }
        else {
          alert(this.translate.instant("Kindly select at least one student to submit/remark"));
          return false;
        }
        break;
      case "unchksubmit":
        if (this.nchksubhomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          for (let key in this.nchksubhomeworkarrfinal) {
            if (this.nchksubhomeworkarrfinal[key].all_done == '0' && this.nchksubhomeworkarrfinal[key].submit_nsubmit == '1' && (this.nchksubhomeworkarrfinal[key].check_uncheck == '0' || this.nchksubhomeworkarrfinal[key].check_uncheck == '1')) {
              userids = userids + this.nchksubhomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.nchksubhomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.homeworkId,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.myService.constant.apiURL + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              if (this.popmessage.response_status.status == '200') {

                this.responseMessage = true;

                this.popmessage = this.translate.instant(this.popmessage.response_status.message);




              }
            });
          }
          else {
            alert(this.translate.instant("Kindly select at least one student to submit/remark"));
            return false;
          }
        }
        else {
          alert(this.translate.instant("Kindly select at least one student to submit/remark"));
          return false;
        }
        break;
      case "latesubmit":
        if (this.latehomeworkarrfinal.length > 0) {
          let userids = "", chkunchstatus = "";
          for (let key in this.latehomeworkarrfinal) {
            if (this.latehomeworkarrfinal[key].all_done == '0' && this.latehomeworkarrfinal[key].submit_nsubmit == '1' && (this.latehomeworkarrfinal[key].check_uncheck == '0' || this.latehomeworkarrfinal[key].check_uncheck == '1')) {
              userids = userids + this.latehomeworkarrfinal[key].user_id + ",";
              chkunchstatus = chkunchstatus + this.latehomeworkarrfinal[key].check_uncheck + ",";
            }
          }
          if (userids != "") {
            userids = userids.substring(0, userids.length - 1);
            chkunchstatus = chkunchstatus.substring(0, chkunchstatus.length - 1);
            const params = {
              "homework_id": this.homeworkId,
              "user_id": userids,
              "check_uncheck": chkunchstatus,
              "remark": "",
              "token": this.token
            };
            this.http.post(this.myService.constant.apiURL + "homework/homeworksubmitandcheck", params).subscribe(details => {
              this.popmessage = details;
              if (this.popmessage.response_status.status == '200') {

                this.responseMessage = true;

                this.popmessage = this.translate.instant(this.popmessage.response_status.message);




              }
            });
          }
          else {
            alert(this.translate.instant("Kindly select at least one student to submit/remark"));
            return false;
          }
        }
        else {
          alert(this.translate.instant("Kindly select at least one student to submit/remark"));
          return false;
        }
        break;
    }
  }
  updatemodulenotification()
  {
    const param = {
            'user_id' : this.user_id,
            'type': [4],
            'token': this.token
       };
    this.http.post(this.myService.constant.apiURL + 'notification/updatemodulenotification', param).subscribe(details => {
    });
  }
}
