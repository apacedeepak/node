import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import { parse } from 'path';
import { url } from 'inspector';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptComponent implements OnInit {

  studentDetails: any;
  hostUrl: any = '';
  searchParam: any;
  student_session_id: any;
  student_section_id: any;
  student_class_section: any;
  fee_structure_id: any;
  sub: any;
  id: any;
  params: any;
  invoice_bottom: any;
  invoice_bottom1: any;
  receiptdetails: any;
  distribuitionArr = [];
  totalArr: any;
  total_taxabale_value = 0;
  total_cgst_amount = 0;
  total_sgst_amount = 0;
  total_igst_amount = 0;
  final_total_amount = 0;
  total_taxabale_value_str: any;
  total_cgst_amount_str: any;
  total_sgst_amount_str: any;
  total_igst_amount_str: any;
  final_total_amount_str: any;
  map_receipt:any;
  map_user:any;
  logo:any;
  school_name:any;
  school_address:any;
  gstin_no:any;
  invoice_no:any;
  receiptdate:any;
  city:any;
  name:any;
  address:any;
  state:any;
  contact:any;
  admission_no:any;
  @ViewChild('content') content:ElementRef;
  logopath:any;
  constructor(private route: ActivatedRoute, private http: HttpClient, private myservice: BackendApiService, private router: Router) { }

  ngOnInit() {
    this.hostUrl = this.myservice.constant.domainName;
    console.log(this.hostUrl);
    this.params = { "tag": "invoice" };
    this.invoice_bottom = {};
    var url = this.myservice.constant.apiURL + "ctpconfiguration/gethocontactdetails";

    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;
      //console.log(result.response_status);
      if (result.response_status.status == "200") {
        this.invoice_bottom = JSON.parse(result.response.value);
        //console.log(this.invoice_bottom.toll_free_no);
      }



    });
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      if (this.id) {
        this.getreceiptdetails(this.id);
        //this.studentPersonalDetails(this.id);
      }
    });













  }

  studentPersonalDetails(student_id) {

    var url = this.myservice.constant.apiURL + "users/userdetail";

    this.searchParam = { "type": "student", "user_id": student_id };
    this.http.post(url, this.searchParam).subscribe(data => {

      const result: any = data;
      if (result.response_status.status == "200") {
        this.studentDetails = result.response;
        console.log(this.studentDetails);

        if (this.studentDetails.session_id > 0
          && this.studentDetails.section_id > 0
          && this.studentDetails.fee_structure_id > 0 && student_id > 0) {

          this.student_session_id = this.studentDetails.session_id;
          this.student_section_id = this.studentDetails.section_id;
          this.student_class_section = this.studentDetails.class_section;
          this.fee_structure_id = this.studentDetails.fee_structure_id;
          // Hit API to get defaulter data...
          // This data contains due fee of the student head-term wise...

          var reqJson = {
            fee_structure_id: this.studentDetails.fee_structure_id,
            session_id: this.studentDetails.session_id,
            section_id: this.studentDetails.section_id,
            userId: student_id
          };


          var url = this.myservice.constant.apiURL + "fee_defaulters/getstudentdues";

          // this.http.post(url, reqJson).subscribe(data => {
          //   const result: any = data;
          //   console.log(result.response);
          //   this.dueslist = result.response;

          //   if (result.response_status.status == "200") {
          //     this.unpaidTermList = Array.from(new Set(result.response.map(obj => obj.term_name_id))).map(x => {
          //       return {
          //         term_name_id: x.toString(),
          //         term_name: result.response.find(obj => obj.term_name_id == x).term.term_name
          //       }

          //     }).sort((a, b) => {
          //       return parseInt(a.term_name_id) - parseInt(b.term_name_id)
          //     });
          //     //console.log(uniqueArr);
          //     //console.log();
          //   }

          // });


        }

      }

    });

  }


  getreceiptdetails(receipt_id) {


    console.log(receipt_id);

    var url = this.myservice.constant.apiURL + "receipt_details/getreceiptdetails";

    this.http.post(url, { receipt_id: receipt_id }).subscribe(data => {
      const result: any = data;
      console.log(result.response_status);
      if (result.response_status.status == "200") {
        this.receiptdetails = result.response;
        console.log(this.receiptdetails);

        this.logo = 'assets/images/loginLogo.png';//'schoolerp/upload/school_logo/loginLogo.png';
        this.logopath = './assets/images/loginLogo.png';
        this.school_name = '';
        this.school_address = '';
        this.gstin_no = '';
        this.invoice_no='';
        this.receiptdate = '';
        this.city = '';
        if(this.receiptdetails[0]){
        this.school_name = this.receiptdetails[0].map_user.user_have_schools[0].school_name;
        this.school_address = this.receiptdetails[0].map_user.user_have_schools[0].school_address;
        this.gstin_no = this.receiptdetails[0].map_user.user_have_schools[0].gstin_no;
        this.invoice_no = this.receiptdetails[0].map_receipt.feereceiptno + '/' + this.receiptdetails[0].map_receipt.id;
        this.receiptdate = this.receiptdetails[0].map_receipt.receiptdate;
        this.city = this.receiptdetails[0].map_user.user_have_schools[0].city;
        this.name = this.receiptdetails[0].map_user.students.name;
        this.admission_no = this.receiptdetails[0].map_user.students.admission_no;
        this.address = this.receiptdetails[0].map_user.students.address;
        this.state = this.receiptdetails[0].map_user.user_have_schools[0].state;
        this.contact = this.receiptdetails[0].map_user.students.student_phone;
        }
        //this.map_receipt = this.receiptdetails[0].map_receipt;

        //this.map_user = this.receiptdetails[0].map_user;

        if(this.receiptdetails[0].map_user.user_have_schools[0].school_logo){// get schoolerp logo
          this.logo = this.receiptdetails[0].map_user.user_have_schools[0].school_logo;
          this.logopath = this.hostUrl + this.logo;

        }

        this.receiptdetails.forEach((r, i) => {

          var taxabale_value = (r.amount / ((1 + ((r.cgst / 100) + (r.sgst / 100) + (r.igst / 100)))));
          var cgst_amount = (taxabale_value * r.cgst) / 100;
          var sgst_amount = (taxabale_value * r.sgst) / 100;
          var igst_amount = (taxabale_value * r.igst) / 100;
          var row_total_amount = taxabale_value + cgst_amount + sgst_amount + igst_amount;
          this.total_taxabale_value = this.total_taxabale_value + taxabale_value;
          this.total_cgst_amount = this.total_cgst_amount + cgst_amount;
          this.total_sgst_amount = this.total_sgst_amount + sgst_amount;
          this.total_igst_amount = this.total_igst_amount + igst_amount;
          this.final_total_amount = this.final_total_amount + row_total_amount;
          this.distribuitionArr[i] = {
            sac_hsn_code: r.sac_hsn_code,
            particulars: r.fee_head_name,
            taxabale_value: taxabale_value.toFixed(2),
            cgst_rate: r.cgst,
            cgst_amount: cgst_amount.toFixed(2),
            sgst_rate: r.sgst,
            sgst_amount: sgst_amount.toFixed(2),
            igst_rate: r.igst,
            igst_amount: igst_amount.toFixed(2),
            row_total_amount: row_total_amount.toFixed(2)
          };


          //this.totalArr.

        })
        ///this.total_cgst_amount = this.total_cgst_amount.toFixed(2)
        //console.log(typeof (this.total_cgst_amount));
        this.total_taxabale_value_str = this.total_taxabale_value.toFixed(2);
        this.total_cgst_amount_str = this.total_cgst_amount.toFixed(2);
        this.total_sgst_amount_str = this.total_sgst_amount.toFixed(2);
        this.total_igst_amount_str = this.total_igst_amount.toFixed(2);
        this.final_total_amount = Math.round(this.final_total_amount);
        this.numberToWords(Math.round(this.final_total_amount));


      }


    });

  }

  numberToWords(num) {
  
  var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
  var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
  
     var n=[];
      //if ((num = num.toString()).length > 9) return 'overflow';
      n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return; var str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
      
      this.final_total_amount_str = str;
  
  }

  downloadPDF(){

     alert("Test");
    // const doc = new jsPDF();
    // doc.text("i am test",10,10);
    // doc.save('testpdf.pdf');

    let doc = new jsPDF();

    let specialElementHandelers = {
      "#editor": function(element,renderer){
        return true;
      }

    };

    doc.setFontSize(3);

    let content = this.content.nativeElement;

    doc.fromHTML(content.innerHTML,1,1,{
      'width': 1,
      'elementHandlers': specialElementHandelers
    });
    doc.save('invoice.pdf');

  }

public captureScreen()
{
var data = document.getElementById('content');
html2canvas(data).then(canvas => {
// Few necessary setting options
var imgWidth = 208;
var pageHeight = 295;
var imgHeight = canvas.height * imgWidth / canvas.width;
var heightLeft = imgHeight;
 
const contentDataURL = canvas.toDataURL('image/png');
//alert(contentDataURL);
//console.log(contentDataURL)
let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
var position = 0;
pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
pdf.save('invoice_'+ this.name + '_' + this.admission_no + '.pdf'); // Generated PDF
});
}


}
