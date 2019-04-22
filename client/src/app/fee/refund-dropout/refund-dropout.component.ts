import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-refund-dropout',
  templateUrl: './refund-dropout.component.html',
  styleUrls: ['./refund-dropout.component.css']
})
export class RefundDropoutComponent implements OnInit {

  refundForm: FormGroup;

  successmsg: any = '';
  errormsg: any = '';
  params: any;
  searchParam: any;
  studentlistdata: any = [];
  hostUrl: any;
  studentDetails: any = [];
  showStudentDetails: any = false;
  requestForm: any;
  action: any;
  refundAmount: FormArray;
  refundArr: FormArray;
  refundrequest: any;
  totalRefundableFee:any;
  isRefundMode:any;
  refundConfiguration:any=[];
  constructor(private http: HttpClient, private myservice: BackendApiService, private router: Router) { }

  ngOnInit() {


    var url = this.myservice.constant.apiURL + "refund_configurations/getrefundconfiguration";
    this.http.post(url, {status:"Active"}).subscribe(data => {
      const result: any = data;
      // console.log(result);
      if (result.response.length > 0) {
      this.refundConfiguration = result.response;
      console.log(this.refundConfiguration);
      }
    });  
    this.hostUrl = this.myservice.constant.domainName;
    this.isRefundMode = "Cheque";
    this.refundForm = new FormGroup({
    
      admission_number: new FormControl(''),
      action: new FormControl('refund')
    });

    this.refundArr = new FormArray([]);
  
    this.requestForm = new FormGroup({
      remark: new FormControl(''),
      total_refundable_fee: new FormControl(''),
      mode_of_refund: new FormControl('Cheque'),
      refundable_amount: this.refundArr,
      cheque_to_be_name_of: new FormControl(''),
      beneficiary_name: new FormControl(''),
      account_number: new FormControl(''),
      ifsc: new FormControl(''),
      bank_name: new FormControl('')
    });

  }

  onSubmit(value) {

    this.studentDetails = [];

    this.totalRefundableFee =0.00;
    if (value.action) {
      this.action = value.action;
    } else {
      this.action = "";
    }

    // reset form...

    






    // hit API to get section list
    var url = this.myservice.constant.apiURL + "students/getstudentdetailbyadmno";
    this.http.post(url, { admission_no: value.admission_number, status: "Active", school_id: window.localStorage.getItem('school_id') }).subscribe(data => {
      const result: any = data;
      // console.log(result);
      if (result.response.length > 0) {
        var detail = result.response[0];
        this.studentDetails = {
          name: detail.name,
          class_section: detail.students.user_have_sections[0].section_name,
          section_id: detail.students.user_have_sections[0].id,
          session_id: detail.students.user_have_sections[0].session_id,
          school_id: window.localStorage.getItem('school_id'),
          father_name: detail.studentbelongtoparent.father_name,
          student_photo: "schoolerp/" + detail.student_photo,
          admission_no: detail.admission_no,
          dateofadmission : detail.dateofadmission,
          student_primary_key_id_in_student: detail.id,
          student_foreign_key_id_in_student: detail.userId,
          student_primary_key_id_in_user: detail.students.id,

          parent_primary_key_id_in_parent: detail.studentbelongtoparent.id,
          parent_foreign_key_id_in_parent: detail.studentbelongtoparent.userId,
          parent_primary_key_id_in_user: detail.studentbelongtoparent.userId
        };


        // get fee details...


        this.http.post(this.myservice.constant.apiURL + "student_fees/studentrefundfeedetails",
          {
            session_id: window.localStorage.getItem('session_id'),
            section_id: this.studentDetails.section_id,
            admission_no: this.studentDetails.admission_no,
            dateofadmission: this.studentDetails.dateofadmission,
            userId: this.studentDetails.student_foreign_key_id_in_student,
            is_refundable:1
          }).subscribe(feedata => {
            const feeresult: any = feedata;
            console.log(result);
            if (feeresult.response_status.status == 200) {

              this.refundrequest = feeresult.response;

              var refundrequestdetails = this.refundrequest;

              refundrequestdetails.forEach(element => {

                var r = element.refund_amount;  // refundable amount based on calculation
                this.totalRefundableFee = this.totalRefundableFee + r;
                this.refundArr.push(new FormControl(r));
              });

              this.requestForm.patchValue({
                total_refundable_fee : parseFloat(this.totalRefundableFee)
              });

              


            }
          });

        this.showStudentDetails = true;
      } else {
        this.errormsg = "Student not found";
        this.successmsg = "";
        this.msgRemoval();
        this.showStudentDetails = false;
      }


    });

  }

  msgRemoval() {

    setTimeout(() => {
      this.successmsg = "";
      this.errormsg = "";
    }, 3000);
  }


  onRequestSubmit(value) {

    if (this.action == "dropout") {
      var jsonForDropout = {
        type: "student",
        user_id: this.studentDetails.student_primary_key_id_in_user,
        school_id: window.localStorage.getItem('school_id'),
        session_id : window.localStorage.getItem('session_id'),
        remark: value.remark
      };
      var url = this.myservice.constant.apiURL + "users/userdropout";
      this.http.post(url, jsonForDropout).subscribe(data => {
        const result: any = data;
        // console.log(result);
        if (result.response_status.responseCode == 200) {
          alert("Student dropout successfully");
          location.reload();
          //this.router.navigate(["/fee/refund-dropout"]);
        }
      });
    }
    else if (this.action == "refund") {
      // start refund process...

      //console.log(this.totalRefundableFee);
      var jsonForRefund = {
        student_id:this.studentDetails.student_primary_key_id_in_student,
        user_id: this.studentDetails.student_primary_key_id_in_user,
        school_id:this.studentDetails.school_id,
        session_id:this.studentDetails.session_id,
        total_refundable_amount: this.totalRefundableFee,
        mode_of_refund: value.mode_of_refund,
        cheque_to_be_name_of: value.cheque_to_be_name_of,
        beneficiary_name:value.beneficiary_name,
        account_number:value.account_number,
        ifsc:value.ifsc,
        bank_name	:value.bank_name	,
        refund_status: "Requested",
        requested_by : window.localStorage.getItem('user_id'),
        status:"Active",
        remarks	: value.remark,
        refund_request_details:this.refundrequest
      };
      var url = this.myservice.constant.apiURL + "fee_refund_request_masters/refundrequest";
      this.http.post(url, jsonForRefund).subscribe(data => {
        const result: any = data;
        //console.log(result);
        if (result.response_status.status == 200) {
          alert("Refund request raised successfully");
          this.router.navigate(["/fee/refund-request-list"]);
        }else if (result.response_status.status == 202) {
          alert("Refund request already raised");
          this.router.navigate(["/fee/refund-request-list"]);
        }else{
          alert("Something went wrong");
        }
      });
    }
    else {
      alert("Invalid action");
      return false;
    }


  }

  setRefundMode(refundmode){ 

    
    this.isRefundMode = refundmode;
    
  }




}
