import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ExcelService } from './../../services/excel.service';
import { parse } from 'path';
import { url } from 'inspector';
import { forEach } from '@angular/router/src/utils/collection';
//import { isUndefined } from 'ngx-bootstrap/chronos/utils/type-checks';
@Component({
  selector: 'app-dailycollectionreport',
  templateUrl: './dailycollectionreport.component.html',
  styleUrls: ['./dailycollectionreport.component.css']
})
export class DailycollectionreportComponent implements OnInit {

  reportForm: FormGroup;
  successmsg: any = '';
  errormsg: any = '';
  params: any;
  searchParam: any;
  classArrayList: any = [];
  classToArrayList: any = [];
  sectionArrayList: any = [];
  class_list_object: any;
  section_list_object: any;
  frmArray: FormArray;
  feestructurelistdata: any;
  payment_mode: any;
  paymentMode: any = [];
  paymentModeJson: any;
  headlist: any = [];
  sessionlist: any = [];
  dailycollectionreport = [];
  report: any = [];
  tablehead: any = [];
  constructor(private http: HttpClient, private myservice: BackendApiService, private excelService: ExcelService) { }

  ngOnInit() {
    this.frmArray = new FormArray([]);
    this.params = { "school_id": window.localStorage.getItem('school_id') };

    var url;

    url = this.myservice.constant.apiURL + "fee_head_masters/getfeeheadlist";

    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;
      //console.log("-----"+result.response);
      if (result.response_status.status == "200") {
        this.headlist = result.response.sort((a, b) => {
          return parseInt(a.priority) - parseInt(b.priority);
        });

      }


    });


    url = this.myservice.constant.apiURL + "sessions/getallsession";

    this.http.post(url, { "schoolId": window.localStorage.getItem('school_id') }).subscribe(data => {
      const result: any = data;
      //console.log(result.response);
      if (result.response) {
        this.sessionlist = result.response;
      }
    });



    url = this.myservice.constant.apiURL + "/sections/schoolwisesectionlist";
    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;

      if (result.response) {

        this.section_list_object = result.response;
      }

      this.section_list_object.forEach(element => {
        var sectionlist = {
          'id': element.id,
          'section_name': element.section_name,
          'class_id': element.classId
        };
        this.sectionArrayList.push(sectionlist);
        this.frmArray.push(new FormControl(''));
      });
    });

    url = this.myservice.constant.apiURL + "ctpconfiguration/gethocontactdetails";

    this.http.post(url, { "tag": "payment_mode" }).subscribe(data => {
      const result: any = data;

      if (result.response_status.status == "200") {
        this.paymentMode = result.response.value;
      }

      this.paymentModeJson = JSON.parse(this.paymentMode);//console.log(this.paymentModeJson);
    });



    this.reportForm = new FormGroup({
      class_section: this.frmArray,
      payment_mode: new FormControl(''),
      from_date: new FormControl(''),
      to_date: new FormControl(''),
      fee_head_id: new FormControl(''),
      session_id: new FormControl('')

    });

  }


  onSubmit(value,exportFlag) {



    if (value.fee_head_id.length > 0) {
      var tablehead = this.headlist.filter(th => (value.fee_head_id.indexOf(th.id.toString()) >= 0));
      this.tablehead = tablehead.sort((a, b) => {
        return parseInt(a.priority) - parseInt(b.priority);
      });
    } else {
      this.tablehead = this.headlist;
    }


    // hit api to get dailycollectionreport
    var url;
    var params;
    url = this.myservice.constant.apiURL + "receipts/dailycollectionreport";

    params = { status: "Active", payment_mode: value.payment_mode, session_id: value.session_id, fee_head_id: value.fee_head_id };

    if (value.from_date) {
      var from_date_month;
      if (value.from_date.month < 10) {
        from_date_month = '0' + value.from_date.month.toString();
      } else {
        from_date_month = value.from_date.month.toString();
      }
      params.from_date = value.from_date.year.toString() + '-' + from_date_month + '-' + value.from_date.day.toString();

    }

    if (value.to_date) {
      var to_date_month;
      if (value.to_date.month < 10) {
        to_date_month = '0' + value.to_date.month.toString();
      } else {
        to_date_month = value.to_date.month.toString();
      }
      params.to_date = value.to_date.year.toString() + '-' + to_date_month + '-' + value.to_date.day.toString();

    }

    this.http.post(url, params).subscribe(data => {
      const result: any = data;

      //console.log(result.response);
      if (result.response_status.status == "200") {
        this.dailycollectionreport = result.response;

        var theadObj = this.tablehead;
        var jsonArr = [];

        this.dailycollectionreport.forEach(function (obj) {

          var tempArr = [];
          var arr = [];
          var detailArr = [];


          theadObj.forEach(function (headobj) {


            obj.receipt_detail.forEach(function (innerobj) {

              if (headobj.id == innerobj.fee_head_id) {

                if (tempArr.indexOf(innerobj.fee_head_id) >= 0) {
                  arr[innerobj.fee_head_id].amount = arr[innerobj.fee_head_id].amount + innerobj.amount;
                } else {
                  arr[innerobj.fee_head_id] = {
                    fee_head_id: innerobj.fee_head_id,
                    fee_head_name: innerobj.fee_head_name,
                    priority: innerobj.priority,
                    amount: innerobj.amount
                  }
                  tempArr.push(innerobj.fee_head_id);
                }

              }

            });
            if (arr[headobj.id] == undefined) {

              arr[headobj.id] = {
                fee_head_id: headobj.id,
                fee_head_name: headobj.fee_head_name,
                priority: headobj.priority,
                amount: 0
              }

            }



          });





          detailArr = arr.sort((a, b) => {
            return parseInt(a.priority) - parseInt(b.priority);
          }).filter(Boolean);


          jsonArr.push({
            id: obj.id,
            feereceiptid: obj.feereceiptid,
            receiptdate: obj.receiptdate,
            admission_no: obj.user.students.admission_no,
            name: obj.user.students.name,
            section_name: obj.section_name,
            feereceiptno: obj.feereceiptno,
            payment_type: obj.payment_type,
            fine_amount: obj.fine_amount,
            cheque_bounce_fine: obj.cheque_bounce_fine,
            total_amount: obj.total_amount,
            detail: detailArr
          });

          //this.report = this.dailycollectionreport.filter(obj => obj.userId >0);
          //this.report = jsonArr;

        });

        //console.log(typeof(jsonArr));
        this.report = jsonArr;
        //console.log(this.report);
        if(exportFlag && this.report.length > 0){
          this.exportExcel();
        }

      };

    });

  }

  exportExcel() {
    var exportData = this.report;
    var data = [];
    var jsonArr={};
    exportData.forEach(function(obj){
      jsonArr = {};
      jsonArr = {
        
        receiptdate: obj.receiptdate.split('T')[0],
        admission_no: obj.admission_no,
        name: obj.name,
        section_name: obj.section_name,
        feereceiptno: obj.feereceiptno,
        payment_type: obj.payment_type,
        fine_amount: obj.fine_amount,
        cheque_bounce_fine: obj.cheque_bounce_fine,
        total_amount: obj.total_amount,
      }

      if(obj.detail.length > 0){
        var key;
        obj.detail.forEach(function(detailObj){
          key = detailObj.fee_head_name;
          jsonArr[key] = detailObj.amount ;   //something like registration =500;

          
        });
        

      }else{
        // do nothing...
      }

      data.push(jsonArr);
    });
    
    this.excelService.exportAsExcelFile(data, 'daily-collection-report');
  }

}
