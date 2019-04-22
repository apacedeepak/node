import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  id: number;
  private sub: any;
  searchParam: any;
  studentDetails: any = [];
  hostUrl: any = '';
  params: any;
  paymentMode: any = [];
  paymentModeJson: any;
  unpaidTermList: any = [];
  termForm: FormGroup;
  paymentForm: FormGroup;
  dueslist: any = [];
  headwisedueslist: any = [];
  updatedheadwisedueslist: any = [];
  arr: any = [];
  cgstFormArr: FormArray;
  sgstFormArr: FormArray;
  igstFormArr: FormArray;
  hidFormArr: FormArray;
  amountFormArr: FormArray;
  originalamountFormArr: FormArray;
  feeheadnameFormArr: FormArray;
  termnameidFormArr:FormArray;
  termnameFormArr:FormArray;
  termamountFormArr:FormArray;
  termwisetotal:any;
  today: Date = new Date();
  currentDate:any;
  fin_year:any;
  successmsg:any;
  errormsg:any;
  student_session_id:any;
  student_section_id:any;
  student_section_name_id:any;
  student_class_section:any;
  payment_mode:any;
  calculationList:any = [];
  filterdDuesList = [];
  tempList = [];
  fee_structure_id:any;
  school_id:any;
  constructor(private route: ActivatedRoute, private http: HttpClient, private myservice: BackendApiService, private router: Router) { }

  ngOnInit() {
    this.getDateDetails();  // used to get Financial year wise receipt format and cutrrent receipt date
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      if (this.id) {console.log("test");
        this.studentPersonalDetails(this.id);
      }
    });
    this.hostUrl = this.myservice.constant.domainName;
    //this.id = 6;
    this.params = { "tag": "payment_mode" };


    var url = this.myservice.constant.apiURL + "ctpconfiguration/gethocontactdetails";
    this.params = { "tag": "payment_mode" };
    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;

      if (result.response_status.status == "200") {
        this.paymentMode = result.response.value;
      }

      this.paymentModeJson = JSON.parse(this.paymentMode);//console.log(this.paymentModeJson);
    });



    this.termForm = new FormGroup({
      term_ids: new FormControl(''),
    });

    this.cgstFormArr = new FormArray([]);
    this.sgstFormArr = new FormArray([]);
    this.igstFormArr = new FormArray([]);
    this.feeheadnameFormArr = new FormArray([]);
    this.termnameidFormArr = new FormArray([]);
    this.termnameFormArr = new FormArray([]);
    this.termamountFormArr = new FormArray([]);
    this.hidFormArr = new FormArray([]);
    this.amountFormArr = new FormArray([]);
    this.originalamountFormArr = new FormArray([]);

    this.paymentForm = new FormGroup({
      fee_receipt_no: new FormControl(''),
      fee_receipt_date: new FormControl(''),
      rrn_no: new FormControl(''),
      serial_no: new FormControl(''),
      order_id: new FormControl(''),
      challan_no: new FormControl('',[Validators.pattern("^[0-9]*$")]),
      cheque_no: new FormControl(''),
      dd_no: new FormControl(''),
      dd_date: new FormControl(''),
      account_no: new FormControl(''),
      transaction_id: new FormControl(''),
      transaction_date: new FormControl(''),
      card_no: new FormControl(''),
      loan_no: new FormControl(''),
      proforma_on_name_of: new FormControl(),
      name_on_proforma: new FormControl(),
      bank_name: new FormControl(''),
      bank_branch: new FormControl(''),
      remark: new FormControl(''),
      fine_amount: new FormControl(''),
      cheque_date: new FormControl('',[Validators.pattern('^[0-9]{4}[\/][0-9]{2}[\/][0-9]{2}$')]),
      challan_date: new FormControl('',[Validators.pattern('^[0-9]{4}[\/][0-9]{2}[\/][0-9]{2}$')]),
      feeheadnameArr: this.feeheadnameFormArr,
      cgstArr: this.cgstFormArr,
      sgstArr: this.sgstFormArr,
      igstArr: this.igstFormArr,
      hidArr: this.hidFormArr,
     
      termnameidArr:this.termnameidFormArr,
      termnameArr:this.termnameFormArr,
      termamountArr:this.termamountFormArr,
      amountArr: this.amountFormArr,
      originalamountArr: this.originalamountFormArr,
      termwisetotal: new FormControl(''),
      total_paid: new FormControl(''),
      balance_amount: new FormControl(''),
      payable_amount: new FormControl(''),
      payment_mode: new FormControl('CA')
    });


  }

  studentPersonalDetails(student_id) {
    
    var url = this.myservice.constant.apiURL + "users/userdetail";

    this.searchParam = { "type": "student", "user_id": student_id };
    this.http.post(url, this.searchParam).subscribe(data => {

      const result: any = data;
      if (result.response_status.status == "200") {
        this.studentDetails = result.response;
        //console.log(">>>>>>>>>")
        console.log(this.studentDetails);

        if (this.studentDetails.session_id > 0
          && this.studentDetails.section_id > 0
          && this.studentDetails.fee_structure_id > 0 && student_id > 0) {

            this.student_session_id    =  this.studentDetails.session_id;
            this.student_section_id    =  this.studentDetails.section_id;
            this.student_class_section =  this.studentDetails.class_section;
            this.fee_structure_id = this.studentDetails.fee_structure_id;
            this.school_id = this.studentDetails.school_id;
            // Hit API to get defaulter data...
            // This data contains due fee of the student head-term wise...

          var reqJson = {
            fee_structure_id: this.studentDetails.fee_structure_id,
            session_id: this.studentDetails.session_id,
            section_id: this.studentDetails.section_id,
            userId: student_id
          };


          var url = this.myservice.constant.apiURL + "fee_defaulters/getstudentdues";

          this.http.post(url, reqJson).subscribe(data => {
            const result: any = data;
            console.log(result.response);
            this.dueslist = result.response;
            
            if (result.response_status.status == "200") {
              this.unpaidTermList = Array.from(new Set(result.response.map(obj => obj.term_name_id))).map(x => {
                return {
                  term_name_id: x.toString(),
                  term_name: result.response.find(obj => obj.term_name_id == x).term.term_name
                }

              }).sort((a, b) => {
                return parseInt(a.term_name_id) - parseInt(b.term_name_id)
              });
              //console.log(uniqueArr);
              //console.log();
            }

          });


        }

      }

    });

  }





  onTermSubmit(value) {
    var invalid_term_selection = false;
    var tids = JSON.stringify(value.term_ids);

    var unpaidTermList = this.unpaidTermList;
    
    value.term_ids.forEach(function(element,index){

      
      if(unpaidTermList[index].term_name_id != element){
        invalid_term_selection = true; 
      }

    });
    if(invalid_term_selection){
      tids = '';
      this.headwisedueslist = [];
      this.termForm.patchValue({

        'term_ids':''
      });
      alert("Please select previous unpaid terms in sequesnce");
      return false;
    }

    
    var requiredPaymentDetails = this.dueslist;
    console.log('term submit...............');
    console.log(this.dueslist);

    this.filterdDuesList = [];
    let obj1 =  requiredPaymentDetails.find((o,i) => {
     
      if (tids.includes(o.term_name_id)) {
        this.filterdDuesList.push(o);
      }  
    });

    console.log(this.filterdDuesList);
    var termArr = [];
    var tempTermArr = [];
      

    var arr = [];
    var tempArr = [];
    let obj = requiredPaymentDetails.find((o, i) => {
      if (tids.includes(o.term_name_id)) {
        if (tempArr.indexOf(o.fee_head_id) == -1) {
          tempArr.push(o.fee_head_id);
          arr[o.fee_head_id] = {
            term_name_id: o.term_name_id,
            term_name: o.term.term_name,
            term_amount:o.due_amount,
            fee_head_id: o.fee_head_id,
            fee_head_name: o.dueshead.fee_head_name,
            cgst: o.cgst,
            sgst: o.sgst,
            igst: o.igst,
            total_due_amount: o.due_amount,
            priority: o.dueshead.priority
          };
        }
        else {
          var sum = parseFloat(arr[o.fee_head_id].total_due_amount) + parseFloat(o.due_amount);
          arr[o.fee_head_id].total_due_amount = sum;
          sum = 0;
          arr[o.fee_head_id].term_name_id = arr[o.fee_head_id].term_name_id + "," + o.term_name_id;
          arr[o.fee_head_id].term_name = arr[o.fee_head_id].term_name + "," + o.term.term_name;
          arr[o.fee_head_id].term_amount = arr[o.fee_head_id].term_amount + "," + o.due_amount;
        }
      }
    });
//console.log(arr);
    if (arr) {
      this.headwisedueslist = arr.sort((a, b) => {
        return parseInt(a.fee_head_id) - parseInt(b.fee_head_id);
      }).sort((a, b) => {
        return parseInt(a.priority) - parseInt(b.priority);
      }).filter(Boolean);  // boolean used to filter/remove the blank object...
      //console.log(this.headwisedueslist);
      this.termwisetotal = 0;
      for (let i = 0; i < this.headwisedueslist.length; i++) {
        this.feeheadnameFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("feeheadnameArr")).controls[i].setValue(this.headwisedueslist[i].fee_head_name);
        this.cgstFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("cgstArr")).controls[i].setValue(this.headwisedueslist[i].cgst);
        this.sgstFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("sgstArr")).controls[i].setValue(this.headwisedueslist[i].sgst);
        this.igstFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("igstArr")).controls[i].setValue(this.headwisedueslist[i].igst);
        this.hidFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("hidArr")).controls[i].setValue(this.headwisedueslist[i].fee_head_id);
        this.amountFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("amountArr")).controls[i].setValue(this.headwisedueslist[i].total_due_amount);
        this.originalamountFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("originalamountArr")).controls[i].setValue(this.headwisedueslist[i].total_due_amount);

        this.termnameidFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("termnameidArr")).controls[i].setValue(this.headwisedueslist[i].term_name_id);
        this.termnameFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("termnameArr")).controls[i].setValue(this.headwisedueslist[i].term_name);
        this.termamountFormArr.push(new FormControl(''));
        (<FormArray>this.paymentForm.get("termamountArr")).controls[i].setValue(this.headwisedueslist[i].term_amount);


        this.termwisetotal = parseFloat(this.termwisetotal) + parseFloat(this.headwisedueslist[i].total_due_amount);
        this.paymentForm.patchValue(
          {
            "termwisetotal" :this.termwisetotal,
            "fee_receipt_no" : 'FR/' + this.fin_year,
            "fee_receipt_date" : this.currentDate,
            "balance_amount" : 0,
            "payable_amount" : this.termwisetotal,
            "total_paid" : this.termwisetotal
          }
        );
      }

    }
    this.autoFeeAdjustment(this.termwisetotal);
  }

 

getDateDetails(){

var d = this.today.getDate();
var m = this.today.getMonth() + 1; //January is 0!
var yyyy = this.today.getFullYear();
var dd;
var mm;
if (d < 10){
  dd = '0' + d;
}else{
  dd = d;
}

if (m < 10) {
   mm = '0' + m;
}else{
  mm = m;
}

if(m <= 3){
  this.fin_year = (yyyy-1) + '-' + (yyyy);
}else{
  this.fin_year = yyyy + '-' + (yyyy+1);
}

this.currentDate = yyyy + '-' + mm + '-' + dd;

}


autoFeeAdjustment(value){

  if((parseFloat(value) > parseFloat(this.termwisetotal)) || value < 0 ){
    alert("Paid amount should not exceed payable amount");
    value = this.termwisetotal;
    this.paymentForm.get("total_paid").setValue(value);
    
  }
var total_paid = value;
var remainingAmount = total_paid;
var tempVal;
var termwisetotal = parseFloat('0.00');
this.updatedheadwisedueslist = [];
console.log('Adjustment start...');

console.log(this.filterdDuesList);

this.tempList = this.filterdDuesList;

for(let i in this.tempList){

  if(this.tempList[i].due_amount >= remainingAmount){
    this.tempList[i].going_to_pay = remainingAmount
    remainingAmount = 0;
  }else{
    this.tempList[i].going_to_pay = this.tempList[i].due_amount;
    remainingAmount = remainingAmount - this.tempList[i].due_amount;
  }
 
}
console.log(this.tempList);
console.log('Adjustment ends here...');

    var arr = [];
    var tempArr = [];
    var requiredDataForHeadSumUp = this.tempList;
    let obj2 = requiredDataForHeadSumUp.forEach(function(o){

      if (tempArr.indexOf(o.fee_head_id) == -1) {
        tempArr.push(o.fee_head_id);
        arr[o.fee_head_id] = {
          term_name_id: o.term_name_id,
          term_name: o.term.term_name,
          term_amount:o.due_amount,
          fee_head_id: o.fee_head_id,
          fee_head_name: o.dueshead.fee_head_name,
          cgst: o.cgst,
          sgst: o.sgst,
          igst: o.igst,
          total_due_amount: o.due_amount,
          priority: o.dueshead.priority,
          going_to_pay: o.going_to_pay
        };
      }
      else {
        var sum = parseFloat(arr[o.fee_head_id].going_to_pay) + parseFloat(o.going_to_pay);
        arr[o.fee_head_id].going_to_pay = sum;
        sum = 0;
        arr[o.fee_head_id].term_name_id = arr[o.fee_head_id].term_name_id + "," + o.term_name_id;// not in use
        arr[o.fee_head_id].term_name = arr[o.fee_head_id].term_name + "," + o.term.term_name;// not in use
        arr[o.fee_head_id].term_amount = arr[o.fee_head_id].term_amount + "," + o.due_amount;// not in use
      }
       // return true;
    });
    




this.updatedheadwisedueslist = arr.sort((a, b) => {
  return parseInt(a.priority) - parseInt(b.priority);
});

console.log(this.updatedheadwisedueslist);
termwisetotal =0;
for(let i in  this.updatedheadwisedueslist){
  
  if(this.updatedheadwisedueslist[i].going_to_pay){
    (<FormArray>this.paymentForm.get("amountArr")).controls[i].setValue(this.updatedheadwisedueslist[i].going_to_pay); 
    termwisetotal = termwisetotal + parseFloat(this.updatedheadwisedueslist[i].going_to_pay);
  }else{
    (<FormArray>this.paymentForm.get("amountArr")).controls[i].setValue('0');
  }
  }
  this.paymentForm.get("termwisetotal").setValue(termwisetotal);

  var balance_amount = (this.termwisetotal - value);

  this.paymentForm.get("balance_amount").setValue(balance_amount);
}



onPaymentSubmit(value){
  console.log("Payment hit...");
  //console.log(this.tempList);return 0;
var req = value;
req.userId = this.id;
req.section_name = this.student_class_section;
req.section_id = this.student_section_id;
req.session_id = this.student_session_id;
req.fee_structure_id = this.fee_structure_id;
req.school_id = this.school_id;

req.created_by = localStorage.getItem('user_id');

req.detail_req = this.tempList;

if(value.cheque_no){
  req.cheque_dd_no = value.cheque_no;
}

if(value.dd_no){
  req.cheque_dd_no = value.dd_no
}

if(value.challan_date){
  var challan_month;
  if(value.challan_date.month < 10){
      challan_month  = '0' + value.challan_date.month.toString();
  }else{
      challan_month  = value.challan_date.month.toString();
  }
  req.challan_date = value.challan_date.year.toString() + '-' + challan_month + '-' + value.challan_date.day.toString();
  
}

if(value.cheque_date){
  var cheque_month;
  if(value.cheque_date.month < 10){
      cheque_month  = '0' + value.cheque_date.month.toString();
  }else{
      var cheque_month  = value.cheque_date.month.toString();
  }
  req.cheque_date = value.cheque_date.year.toString() + '-' + cheque_month + '-' + value.cheque_date.day.toString();
   
}




if(value.dd_date){
  var dd_month;
  if(value.dd_date.month < 10){
    dd_month  = '0' + value.dd_month.month.toString();
  }else{
    dd_month  = value.dd_month.month.toString();
  }
  req.dd_date = value.dd_date.year.toString() + '-' + dd_month + '-' + value.dd_date.day.toString();
  
}

if(value.transaction_date){
  var transaction_month;
  if(value.transaction_date.month < 10){
    transaction_month  = '0' + value.transaction_date.month.toString();
  }else{
    transaction_month  = value.transaction_date.month.toString();
  }
  req.transaction_date = value.transaction_date.year.toString() + '-' + transaction_month + '-' + value.transaction_date.day.toString();
  
}




//console.log(req);return false;
var url = this.myservice.constant.apiURL + "receipts/addfee";

    console.log(req);
    this.http.post(url, req).subscribe(data => {

      const result: any = data;console.log(result.response_status);
      if (result.response_status.status == "200") {
        alert("Payment has been done successfully...");
        var id = result.response_status.id;
        this.router.navigate(["/fee/receipt",id]);
        //this.successmsg = "Payment details saved successfully";
      }else{
        //this.errormsg = "Something went wrong...";
      }


    });

}

setPaymentModeAttributes(value){

  this.payment_mode = value;

  if(this.payment_mode == ''){

  }
}

}
