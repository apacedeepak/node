
import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';


const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;
@Component({
  selector: 'app-addterm',
  templateUrl: './addterm.component.html',
  styleUrls: ['./addterm.component.css']
})
export class AddtermComponent implements OnInit {
  terminfoform:FormGroup;
  termdetailform:FormGroup;
  termplannerform:FormGroup;
  public fromDateFlags: boolean = false;
  public toDateFlags: boolean = false;
  public showcalander: boolean = false;
  start:any=[];
  end:any=[];
  searchParam:any;
  feeheadlistdata:any=[];
  termlist:any=[];
  public fromDate: any;
  public toDate: any;
  fee_type_json:any
  checkhead:FormArray
  feetype:FormArray
  newstudentfee:FormArray
  newstudentfee2:FormArray
  oldstudentfee:FormArray
  oldstudentfee2:FormArray
  fee_type_object:any;
  feeheadlistcount:any;
  session_id:any;
  school_id:any;
  user_id:any;
  panddata:any=[];
  emptyform:FormArray
  info:any;
  termname:FormArray
  startdate:FormArray;
  enddate:FormArray
  arr:any=[]
  startdatearr:any=[]
  enddatearr:any=[];
  termidarr:any=[]
  fineAmount:0;
  finbasis:any=''
  finaapplicable:0
  termdetailFlag:any=false
  feestructlist:any=[];
  terminfo:any=true
  termdetail:any=false
  termplan :any=false
  termlistfiler:any=[]
  traceback:any=false;
  tracefront:any=false;
  no_of_days:any=[]
  termlist_detail:any=[]
  storeobj_array:any=[]
  startdatearray:any=[]
  enddatearray:any=[]
  errormsg=''
  successmsg=''
  disablecheck:any=[];
  disableterm:any=[];
  disabletermindexid:any=[]
  refresh = [];
  tempArr =[];
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit() {
this.session_id=window.localStorage.getItem('session_id')
this.school_id=window.localStorage.getItem('school_id')
this.user_id=window.localStorage.getItem('user_id')
    this.searchParam = {"status":"Active"};
    
    var urlfee = this.myService.constant.apiURL + "fee_structure_masters/getfeestructurelist";
    var urlfee2 = this.myService.constant.apiURL + "fee_structure_term_master/getalluniquefeestructure";
    this.http.post(urlfee,{"status":"Active","school_id":this.school_id}).subscribe(data => {
      const result: any = data;
 this.feestructlist=result.response
//  console.log(result)
 console.log(this.feestructlist)

this.http.post(urlfee2,{"status":"Active","school_id":this.school_id}).subscribe(data2 => {
  const result2: any = data2;
  console.log(result2.response)
result2.response.forEach(element => {
  let feesrtuctarr = this.feestructlist.filter(index => index.id != element.fee_structure_id);

this.feestructlist=feesrtuctarr
});
});
    }
  );
    var url = this.myService.constant.apiURL + "fee_head_masters/getfeeheadlist";
   const valobj={
    "status":"Active",
    "school_id":this.school_id
   }
    this.http.post(url, valobj).subscribe(data => {
      const result: any = data;

      if (result.response_status.status == "200") {
        this.feeheadlistdata = result.response;
        this.feeheadlistcount=this.feeheadlistdata.length;
      }
      this.checkhead= new FormArray([])
      this.feetype=new FormArray([])
      
      this.emptyform=new FormArray([])
        this.feeheadlistdata.forEach(element => {
        this.emptyform.push(new FormControl(''))
        this.feetype.push(new FormControl(''))
        this.checkhead.push(new FormControl(''))
      
      });
      
      
      this.termplannerform = new FormGroup(
        {
         emptyform:this.emptyform,
        checkedhead:this.checkhead,
        feetype:this.feetype,
        newstudentfee: new FormArray([new FormArray([new FormControl('',)])]),
      
        finecharge: new FormControl(0),
        finechargebsis: new FormControl(''),
        fineaplicableafter: new FormControl(''),
      });
    });
    const temrparam={
      'status':'Active',
      'school_id':this.school_id
    }
    this.http.post(this.myService.constant.apiURL + 'term_name/termlist', temrparam).subscribe(details => {
      const data:any=details;

 this.termlist=data.response
 this.termlist_detail=data.response
 
});
    this.terminfoform = new FormGroup(
      {
       
      feestructure: new FormControl('', Validators.required),
      no_of_terms: new FormControl('', Validators.required),
    
  });
  this.startdate=new FormArray([])
  this.termname=new FormArray([])
  
  this.enddate=new FormArray([])
  this.termdetailform = new FormGroup(
    {
     
    termname: this.termname,
    startdate: this.startdate,
    enddate: this.enddate

});

console.log(this.termdetailform)


const params = {"tag":"fee_mode"};
var url = this.myService.constant.apiURL + "ctpconfiguration/gethocontactdetails";
// hit post API to add/edit fee head
// fee_head_masters/addfeehead
this.http.post(url,params).subscribe(data => {
  const result: any = data;

  if(result.response_status.status == "200") {
      this.fee_type_json = result.response.value;
  }
  this.fee_type_object = JSON.parse(this.fee_type_json);
});
$("#info").addClass('activeNavTab');

  }

 
  oninfo(value){
    this.traceback=true;
    console.log(this.termlist)
    var noofterms=value.no_of_terms
    this.termdetailFlag=true;
    var j=0;
    for(j=0;j<this.termname.length;j++){
      (<FormArray>this.termdetailform.get("termname")).controls[j].setValue('');
      (<FormArray>this.termdetailform.get("startdate")).controls[j].setValue('');
      (<FormArray>this.termdetailform.get("enddate")).controls[j].setValue('');
      }

    this.arr=[]
  var i;
  for(i=0;i<noofterms;i++){
    this.termname.push(new FormControl(''))
    this.startdate.push(new FormControl())
    this.enddate.push(new FormControl(''));
    this.arr.push(i)
  }
  console.log(this.arr)
    this.info=value;
     i=0;
     this.terminfo=false
 this.termdetail=true;
 $("#info").removeClass('activeNavTab');
 $("#detail").addClass('activeNavTab');
 $("#planner").removeClass('activeNavTab');

  }

  ondetail(value){
    this.termlistfiler=[]
    console.log(value)
        this.tracefront=true
    this.startdatearr=value.startdate
    this.enddatearr=value.enddate
    this.termidarr=value.termname
    this.errormsg=''
    var j;
    for(j=0;j<this.startdatearr.length;j++){
      if(this.startdatearr[j]>this.enddatearr[j]){
        var termArr = this.termlist.find(term => term.id == this.termidarr[j]);
 this.errormsg=termArr.term_name+ "  start date cant be greater than end date"
 this.tracefront=false
 
        return false
      }
      if(this.enddatearr[j-1]>=this.startdatearr[j]){
        var termArr = this.termlist.find(term => term.id == this.termidarr[j]);
        var termval = this.termlist.find(term => term.id == this.termidarr[j-1]);
        console.log(termArr)
        console.log(termval)
        this.tracefront=false
       this.errormsg= termArr.term_name+ "  start date cant be smaller or equals to  "+termval.term_name+" end date"
        return false
      }
    }
    this.termdetail=false;
    this.termplan=true
    $("#info").removeClass('activeNavTab');
    $("#detail").removeClass('activeNavTab');
    $("#planner").addClass('activeNavTab');

 var j;
 var i;
 var temparr:any=[]
 for(i=0;i<this.termidarr.length;i++){
  temparr[i]=parseInt(this.termidarr[i])
 }



 for(j=0;j<this.termlist.length;j++){
   if(temparr.indexOf(this.termlist[j].id)!= -1){
     this.termlistfiler.push(this.termlist[j])

     
   }
 }
 var x

for(x=0;x<28;x++){
  this.no_of_days[x]=x+1;
}
  }
  onplanner(value){
    var check=value.checkedhead;
   


    console.log(value)
 var i;
 var activefeehead:any=[];
 var feetype:any=[];
 var fee_type_object:any={}

 for(i=0;i<check.length;i++){
   if(check[i]==true){
    activefeehead.push(this.feeheadlistdata[i].id);

fee_type_object={
  'head':this.feeheadlistdata[i].id,
  'type':value.feetype[i]
}
feetype.push(fee_type_object);
   }

 }
 var amountarr:any=[];
var arraycheck= this.panddata.map(obj=>{
if(activefeehead.indexOf(obj.headId)!= -1){
obj.feetype=feetype[activefeehead.indexOf(obj.headId)].type;
obj.sessionId=this.session_id;
obj.schoolId=this.school_id;
obj.addedby=this.user_id;
obj.fee_struct_id=this.info.feestructure
  amountarr.push(obj);
  return activefeehead.indexOf(obj.headId)
}
})

const dataparms={
  "finecharge":this.fineAmount,
  "finebasis":this.finbasis,
  "fineapplicable":this.finaapplicable,
  "session_id":this.session_id,
  "school_id":this.school_id,
  "fee_struct_id":this.info.feestructure,
  "added_by":this.user_id,
  "term_id":this.termidarr,
  "start":this.startdatearr,
  "end":this.enddatearr,
  'data':amountarr
  
}
console.log(dataparms)

  
  this.http.post(this.myService.constant.apiURL + 'fee_structure_term_master/termaster', dataparms).subscribe(details => {
    const data:any=details;
    if(data.response_status.status=="200"){
        alert("data submitted successfully")
        window.location.reload();
      }
      



  });
  }
  doSomething(termid,headid,amount){
var obj={
  "termId":termid,
  "headId":headid,
  "amount":amount
}

var i;
var count=0;

var tidArr = [];


var index =  headid+'##'+termid;



if(this.tempArr.indexOf(index) == -1){

  this.tempArr.push(index);
this.refresh[index] = obj;
}else{
  this.refresh[index].amount = obj.amount;
}
 var arr = [];
 var finaldata = [];
 finaldata = Object.values(this.refresh);
 console.log(this.refresh)
finaldata.forEach(function(ele,ind){
  console.log(ind)
arr.push(ele);
});




this.panddata = arr;
console.log(this.panddata)

// if(this.refresh[headid][termid] == undefined){
//   // push 
// this.panddata.push(obj);
// this.refresh[headid][termid] = amount;
// }else{
//   // replace 
//   this.refresh[headid][termid] = amount;
// }

}
// for(i=0;i<this.panddata.length;i++){

//   if(headid==this.panddata[i].headId && termid==this.panddata[i].termiId){
//     this.panddata[i].amount=amount;
//     count=1;
//   }
 
//   }
//   if(count==0){
//     console.log(count)
//     this.panddata.push(obj);
//   }
  

displaycal() {
  this.showcalander = true;
this.fromDateFlags=true;
this.toDateFlags=false;
}
displaycal2() {
  this.showcalander = true;
this.toDateFlags=true;
this.fromDateFlags=false;
}
onDateChange(date: NgbDateStruct, type,val) {
  console.log(val)
  this.showcalander = false;
  if(type == 'from'){
    this.fromDate = date;
    let f_year = this.fromDate.year;
    let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
    let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
    this.start[val] = f_day + "-" + f_month + "-" +  f_year;

  
  }
  if(type == 'to'){ 
    this.toDate = date;
    let t_year = this.toDate.year;
    let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
    let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
    this.end[val] = t_day + "-" + t_month + "-" +  t_year;


  }

this.startdate[val].patchValue(   this.start[val] )
this.enddate[val].patchValue(   this.end[val] ) 

}
fineamount(val){
  console.log(val)
  this.fineAmount=val;
}
finebasis(val){
  this.finbasis=val
}
fineapply(val){
this.finaapplicable=val
}
activeterminfo(){
  this.terminfo=true;
  this.termdetail=false;
  this.termplan=false;
  $("#info").addClass('activeNavTab');
    $("#detail").removeClass('activeNavTab');
    $("#planner").removeClass('activeNavTab');
}
activetermdetail(){
  console.log(this.traceback)
  if( this.traceback==true)
 { this.terminfo=false;
  this.termdetail=true;
  this.termplan=false;
  $("#info").removeClass('activeNavTab');
  $("#detail").addClass('activeNavTab');
  $("#planner").removeClass('activeNavTab');
 }
}
activeplanner(){
  if(this.traceback==true && this.tracefront==true){
    this.terminfo=false;
  this.termdetail=false;
  this.termplan=true;
  $("#info").removeClass('activeNavTab');
  $("#detail").removeClass('activeNavTab');
  $("#planner").addClass('activeNavTab');
  }
}
termselectfunc(value,id){
value=parseInt(value)
id=parseInt(id)

var i=0;
var count=0
for(i=0;i<this.disabletermindexid.length;i++){
 
if(this.disabletermindexid[i]==id){

this.disableterm[i]=value;
count++
}}
if(count==0){
  this.disabletermindexid.push(id)
  this.disableterm.push(value)
}
}
datechange(id,valuedate,type){

}
disablechange(value,index){

if (value==true){
  this.disablecheck.push(index)
  
  }
  if(value==false){
   var  indexes =  this.disablecheck.indexOf(index);
if (indexes > -1) {
  this.disablecheck.splice(indexes, 1);
}
  }

}
isNumber(evt) {
  evt = (evt) ? evt : window.event;
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
  }
  return true;
}
}
