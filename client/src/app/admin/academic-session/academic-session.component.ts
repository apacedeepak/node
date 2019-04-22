import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-academic-session',
  templateUrl: './academic-session.component.html',
  styleUrls: ['./academic-session.component.css']

})

export class AcademicSessionComponent implements OnInit {
  academicSessionForm: FormGroup;
  public id: any;
  public dp: any = '';
  public dpe: any = '';
  public minDate: any;
  public minDateEnd: any = '';
  public userId: any;
  public globalObj: any = {};
  public mylang: any = '';
  public params: any = {};
  public editOrUpadte: any = '';
  public sessionData: any = '';
  public p: number = 1;
  public collection: any = [];
  page: number = 1;
  
  constructor(private myService: BackendApiService, private http: HttpClient, private translate: TranslateService) {
    this.mylang = window.localStorage.getItem('language');

    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang('en');
    }

    var today = new Date();
    this.minDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };

  }

  ngOnInit() {
    this.userId = window.localStorage.getItem('user_id');
    this.getFormSet();
    this.getAcademicSessionList();
  }

  getFormSet() {
    this.academicSessionForm = new FormGroup({
      id: new FormControl(''),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required)
    });
  }

  getAcademicSessionList() {
    let inputdata = {order: 'id DESC'};
    let listUrl = this.myService.constant.apiURL + 'academic_session_masters/list';

    this.http.post(listUrl, inputdata).subscribe(resdata => {
      const result: any = resdata;
      this.globalObj.status = result.response.status;
      if (result.response.status == '200') {
        this.globalObj.sessionData = result.response.data;
        this.globalObj.totalRows = result.response.data.length;
      } else {
        this.globalObj.listmessage = result.response.message;
        this.globalObj.sessionData = [];
        this.globalObj.totalRows = 0;
      }
    });
  }


  onSubmitDetail(formValue) {


    var fromYear = formValue.startDate.year;

    let fromMonth = formValue.startDate.month;
    if (fromMonth < 10) {
      fromMonth = '0' + fromMonth;
    }
    let fromDay = formValue.startDate.day;
    if (fromDay < 10) {
      fromDay = '0' + fromDay;
    }

    var endYear = formValue.endDate.year;
    let endMonth = formValue.endDate.month;
    if (endMonth < 10) {
      endMonth = '0' + endMonth;
    }
    let endDay = formValue.endDate.day;
    if (endDay < 10) {
      endDay = '0' + endDay;
    }

    let toDayYear = this.minDate.year;
    let toDayMonth = this.minDate.month;
    if (toDayMonth < 10) {
      toDayMonth = '0' + toDayMonth;
    }
    let toDayDay = this.minDate.day;
    if (toDayDay < 10) {
      toDayDay = '0' + toDayDay;
    }

    let currentDate = toDayYear + '-' + toDayMonth + '-' + toDayDay
    var start_date = fromYear + '-' + fromMonth + '-' + fromDay;
    var end_date = endYear + '-' + endMonth + '-' + endDay;

    if (formValue.id > 0) {
      start_date = (fromYear) ? start_date : formValue.startDate;
      end_date = (endYear) ? end_date : formValue.endDate;
      let editFromDate = new Date(start_date);
      let editEndDate = new Date(end_date);
      fromYear = editFromDate.getFullYear();
      endYear = editEndDate.getFullYear();
    }

    let sessionName = fromYear + '-' + endYear;
    if (start_date != '' && end_date != '' && (start_date < end_date)) {
      this.params = {
        'session_name': sessionName,
        'start_date': start_date,
        'end_date': end_date,
        'added_date': currentDate,
        'added_by': this.userId,
        'status': 2
      };

      if (formValue.id > 0) {
        this.params = {
          'session_name': sessionName,
          'start_date': start_date,
          'end_date': end_date,
          'id': formValue.id
        };
      }
      this.saveAcademicSession(this.params);
    } else {
      this.globalObj.errorMessage = 'Please enter valid date range';
      setTimeout(() => { this.globalObj.errorMessage = ''; }, 3000);
      return false;
    }
  }



  saveAcademicSession(inputs) {

    let getUrl = this.myService.constant.apiURL + 'academic_session_masters/getsessiondata';
    this.http.post(getUrl, inputs).subscribe(acdSesDetails => {
      const acdSesdata: any = acdSesDetails;
      if (acdSesdata.response.status == '200' && inputs.id==0) {
        this.globalObj.errorMessage = 'This Academic Session is already exist';
        setTimeout(() => { this.globalObj.errorMessage = ''; }, 3000);

      } else {
        this.http.post(this.myService.constant.apiURL + 'academic_session_masters/addnewsession', inputs).subscribe(details => {
          const data: any = details;
          this.globalObj.message = data.response.message;
          if (data.response.status === '200') {
            if (inputs.id > 0) {
              this.globalObj.message = 'Academic Session Updated succesfully.';
              this.id = 0;
            } else {
              this.academicSessionForm.get('startDate').setValue('');
              this.academicSessionForm.get('endDate').setValue('');
              this.academicSessionForm.get('id').setValue('');
            }
          }
          this.getFormSet();
          this.getAcademicSessionList();
          setTimeout(() => { this.globalObj.message = ''; }, 3000);
        });
      }
    });
  }

  academicSessionStatusUpdate(sessionId, statusFlag, SessionName) {

    let vstatus = '';
    if (statusFlag === 1) {
      vstatus = 'active';
    } else {
      vstatus = 'inactive';
    }

    if (confirm('Are you sure to ' + vstatus + ' ' + SessionName + '. All other session will be Inactive')) {
      if (sessionId !== '') {
        this.params = { id: sessionId, status: statusFlag };
        this.http.post(this.myService.constant.apiURL + "academic_session_masters/updatesession", this.params).subscribe(details => {
          const data: any = details;
          console.log(data);
          if (data.response_status.status == "200") {
            if(vstatus=='active'){ vstatus = 'activated';}
            this.globalObj.message = "Session " + vstatus + " successfully";
            this.getAcademicSessionList();
            setTimeout(() => { this.globalObj.message = ''; }, 3000);
          }
          if (data.response_status.status != "200") {
            alert("Error Occured")
          }
        });

      }
    }
  }


  sessionEdit(sessionId) {
    this.sessionData = [];
    this.dp = '';
    this.dpe = '';
    if (sessionId) {
      this.http.get(this.myService.constant.apiURL + 'academic_session_masters/getsessionrow?id=' + sessionId).subscribe(detail => {
        const data: any = detail;
        this.sessionData = data.response;
        console.log(this.sessionData);

        let sDate = new Date(this.sessionData.start_date);
        var sYear = sDate.getFullYear();
        var sMonth = sDate.getMonth() + 1;
        var sMonthStr = (sMonth > 9) ? sMonth : '0' + sMonth;
        var sDay = sDate.getDate();
        var sDayStr = (sDay > 9) ? sDay : '0' + sDay;

        let eDate = new Date(this.sessionData.end_date);
        var eYear = eDate.getFullYear();
        var eMonth = eDate.getMonth() + 1;
        var eMonthStr = (eMonth > 9) ? eMonth : '0' + eMonth;
        var eDay = eDate.getDate();
        var eDayStr = (eDay > 9) ? eDay : '0' + eDay;

        this.dp = sYear + '-' + sMonthStr + '-' + sDayStr;
        this.dpe = eYear + '-' + eMonthStr + '-' + eDayStr;
        this.id = this.sessionData.id;

        this.academicSessionForm.patchValue({
          id: this.sessionData.id,
          startDate: this.dp,
          endDate: this.dpe
        });
      });
    }

  }

  saveSchoolSessionMapping(acdSessionData) {

    let schoolUrl = this.myService.constant.apiURL + "schools/getallschoollist"
    let schoolInput = {};
    this.http.post(schoolUrl, schoolInput).subscribe(schDetails => {
      let schoolResult: any = schDetails;
      var sessionMapData: any;

      if (schoolResult.response) {
        schoolResult.response.forEach((key, value) => {
          sessionMapData = {
            schoolId: key.school_id,
            session_id: acdSessionData.id,
            session_name: acdSessionData.session_name,
            start_date: acdSessionData.start_date,
            end_date: acdSessionData.end_date,
            status: 'Active'
          };

          const sessionUlr = this.myService.constant.apiURL + "sessions/createsession";
          this.http.post(sessionUlr, sessionMapData).subscribe(sessDetails => {
            let sessResult: any = sessDetails;
          });
        });
      }
    });
  }

  clearForm() {
    this.academicSessionForm.patchValue(
      {
        id: 0,
        academic_session_id: '',
        startDate: '',
        endDate: '',
      });
    this.dp = '';
    this.dpe = '';
    this.id = 0;
  }

}
