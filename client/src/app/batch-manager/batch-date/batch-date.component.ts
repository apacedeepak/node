import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-batch-date',
  templateUrl: './batch-date.component.html',
  styleUrls: ['./batch-date.component.css']
})

export class BatchDateComponent implements OnInit {
  batchDateForm: FormGroup;
  public dp: any = '';
  public currentDate: any;
  public minDate: any;
  public maxDate: any;
  public userId: any;
  public globalObj: any = {};
  public academicSessionId: any;
  public batchData: any;
  public params: any;
  public batchparams: any;
  public id: any = 0;
  page: number = 1;

  constructor(private myService: BackendApiService, private http: HttpClient) {
    let today = new Date();
    this.currentDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  }

  ngOnInit() {
    this.userId = window.localStorage.getItem('user_id');
    this.batchDateForm = new FormGroup({
      id: new FormControl(''),
      acad_session_id: new FormControl('', Validators.required),
      batch_start_date: new FormControl('', Validators.required)
    });

    this.getSessionList().then((response) => {
      this.globalObj.academicSsessionList = response;
    }).catch((err) => {
      // /console.log(err);
      this.globalObj.academicSsessionList = '';
    });
    this.getBatchList();
  }

  setMinMaxStartDate(sessionId) {

    if (sessionId > 0) {
      const sessionInfoUrl = this.myService.constant.apiURL + 'academic_session_masters/getsessionrow?id=' + sessionId;
      this.http.get(sessionInfoUrl).subscribe(sessionInfoData => {
        const sessionInfoResult: any = sessionInfoData;
        let sessionInfo = sessionInfoResult.response;

        if (sessionInfo.id > 0) {
          var fromdate = new Date(sessionInfo.start_date);
          this.minDate = { year: fromdate.getFullYear(), month: fromdate.getMonth() + 1, day: fromdate.getDate() };

          var enddate = new Date(sessionInfo.end_date);
          this.maxDate = { year: enddate.getFullYear(), month: enddate.getMonth() + 1, day: enddate.getDate() };

        } else {
          alert('Please select a session value');
        }
      });
    } else {
      alert('Please select a session value');
    }
  }

  getSessionList() {
    return new Promise((resolve, reject) => {
      let inputData = {};
      let listUrl = this.myService.constant.apiURL + 'academic_session_masters/list';
      this.http.post(listUrl, inputData).subscribe(resdata => {
        const result: any = resdata;
        if (result.response.data) {
          resolve(result.response.data);
        } else {
          reject(result.response);
        }
      });
    });
  }

  onSubmitDetail(formValue) {
    // console.log(formValue);
    let batchId = (formValue.id) ? formValue.id : 0;
    let acad_session_id = formValue.acad_session_id;


    let batchStartYear = formValue.batch_start_date.year;
    let batchStartMonth = formValue.batch_start_date.month;
    if (batchStartMonth < 10) {
      batchStartMonth = '0' + batchStartMonth;
    }
    let batchStartDay = formValue.batch_start_date.day;
    if (batchStartDay < 10) {
      batchStartDay = '0' + batchStartDay;
    }
    let toDayYear = this.currentDate.year;
    let toDayMonth = this.currentDate.month;
    if (toDayMonth < 10) {
      toDayMonth = '0' + toDayMonth;
    }
    let toDayDay = this.currentDate.day;
    if (toDayDay < 10) {
      toDayDay = '0' + toDayDay;
    }

    let current_date = toDayYear + '-' + toDayMonth + '-' + toDayDay
    let start_date = batchStartYear + '-' + batchStartMonth + '-' + batchStartDay;
    let batch_name = "batch";

    if (formValue.id > 0) {
      start_date = (batchStartYear) ? start_date : formValue.batch_start_date;
    }



    let batchExistData = {
      "session_id": acad_session_id,
      "batch_start_date": start_date
    };

    let existUrl = this.myService.constant.apiURL + "batch_date_masters/getbatchdata";
    this.http.post(existUrl, batchExistData).subscribe(details => {
      const getdata: any = details;
      console.log(getdata.response);
      if (getdata.response.status == '200') {
        this.globalObj.errorMessage = "Batch start date is already exist in this session";
        setTimeout(() => { this.globalObj.errorMessage = ''; }, 5000);

      } else {

        this.batchparams = {
          'batch_name': batch_name,
          'session_id': acad_session_id,
          'batch_start_date': start_date,
          'added_date': current_date,
          'added_by': this.userId,
          'status': 1
        };

        if (batchId > 0) {
          this.batchparams = {
            'session_id': acad_session_id,
            'batch_start_date': start_date,
            'id': batchId
          };
        }

        let saveBatchDetailUrl = this.myService.constant.apiURL + "batch_date_masters/save";

        this.http.post(saveBatchDetailUrl, this.batchparams).subscribe(savedetails => {
          const data: any = savedetails;
          console.log(data.response);
          if (data.response.status === '200') {
            if (batchId > 0) {
              this.globalObj.message = "Batch start date updated succesfully.";
            } else {
              this.globalObj.message = "Batch start date added succesfully.";
            }
            this.id = 0;
            this.batchDateForm.get('id').setValue('');
            this.batchDateForm.get('acad_session_id').setValue('');
            this.batchDateForm.get('batch_start_date').setValue('');
            this.getBatchList();
          } else {
            this.globalObj.errorMessage = 'Something went wrong Please try again later';
          }
          setTimeout(() => { this.globalObj.message = ''; }, 3000);
        });
      }
    });



  }

  getBatchList() {
    let conditions = {
      order: 'id DESC',
      include: {
        relation: 'session_data',
        scope: {
          fields: ['session_name', 'start_date', 'end_date']
        }
      }
    };

    let batchListUrl = this.myService.constant.apiURL + "batch_date_masters/list";
    this.http.post(batchListUrl, conditions).subscribe(details => {
      const data: any = details;
      this.globalObj.status = data.response.status;

      if (data.response.status === '200') {
        this.globalObj.batchDateDetails = data.response.data;
        //console.log(data.response.data);
      } else {
        this.globalObj.listmessage = data.response.message;
        this.globalObj.batchDateDetails = '';
      }
    });
  }

  batchStartDateStatusUpdate(batchStartId, statusFlag, batchStartDate) {
    //alert("I am here " + batchStartId);

    let vstatus = '';
    if (statusFlag === 1) {
      vstatus = 'active';
    } else {
      vstatus = 'inactive';
    }
    var startDate = batchStartDate.split('T')[0];
    var confirmMessage = 'Are you sure to ' + vstatus + ' batch start date (' + startDate + ')';
    if (confirm(confirmMessage)) {

      if (batchStartId > 0) {
        let statusUpdate = { id: batchStartId, status: statusFlag };
        this.http.post(this.myService.constant.apiURL + 'batch_date_masters/save', statusUpdate).subscribe(details => {
          const data: any = details;

          this.globalObj.message = 'Batch start date ' + vstatus + 'd  successfully';
          this.getBatchList();
          setTimeout(() => { this.globalObj.message = ''; }, 3000);
        });

      } else {
        this.globalObj.message = 'Something went wrong';
        setTimeout(() => { this.globalObj.message = ''; }, 3000);
      }

    }
  }

  batchDateEdit(batchStartId = 0) {
    //alert(batchStartId);
    if (batchStartId > 0) {
      this.dp = '';
      this.id = batchStartId;
      //alert(this.id);
      this.batchDateForm.patchValue({ id: 0, acad_session_id: '', batch_start_date: '' });

      this.http.get(this.myService.constant.apiURL + 'batch_date_masters/getbatchstartrow?id=' + batchStartId).subscribe(detail => {
        const data: any = detail;
        this.batchData = data.response;
        // console.log(this.batchData);
        if (this.batchData.id > 0) {
          let sDate = new Date(this.batchData.batch_start_date);
          var sYear = sDate.getFullYear();
          var sMonth = sDate.getMonth() + 1;
          var ssMonth = (sMonth > 9) ? sMonth : '0' + sMonth;
          var sDay = sDate.getDate();
          var ssDay = (sDay > 9) ? sDay : '0' + sDay;

          this.dp = sYear + '-' + ssMonth + '-' + ssDay;
          this.id = this.batchData.id;
          this.setMinMaxStartDate(this.batchData.session_id);
          this.batchDateForm.patchValue({
            id: this.batchData.id,
            acad_session_id: this.batchData.session_id,
            batch_start_date: this.dp
          });

        } else {
          this.globalObj.message = 'Something went wrong.';
          setTimeout(() => { this.globalObj.message = ''; }, 3000);
        }
      });
    }

  }

  clearForm() {
    this.batchDateForm.patchValue(
      {
        id: 0,
        acad_session_id: '',
        batch_start_date: '',
      });
    this.dp = '';
    this.id = 0;
  }
}