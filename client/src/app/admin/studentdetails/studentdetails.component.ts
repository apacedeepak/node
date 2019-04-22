import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { create } from 'domain';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-studentdetails',
  templateUrl: './studentdetails.component.html',
  styleUrls: ['./studentdetails.component.css']
})
export class StudentdetailsComponent implements OnInit {
  fromDate:any;
  dateA:any;
  search_from:FormGroup
  toDate:any;
  today:any;
  fromDateFlag:any=false;
  toDateFlag:any=false
  boardlist:any=[]
  school_id:any;
  coursetype_list:any=[];
  center_list:any=[]

  public showcalander: boolean = false;
  constructor(private myService: BackendApiService, private http: HttpClient) { }

  ngOnInit() {
    this.http.post(this.myService.constant.apiURL+"schools/schoollist", "").subscribe(data => {
      const datas: any = data;
      this.center_list=datas.response
    })
    this.school_id=window.localStorage.getItem('school_id')
    this.search_from=new FormGroup({
      from_date:new FormControl(''),
      to_date:new FormControl(''),
      course:new FormControl(''),
      course_type:new FormControl(''),
      center:new FormControl(''),
      adm_no:new FormControl('')
    })
    this.boardlistfunction();
  }
  displaycal() {
    this.showcalander = true;
  this.fromDateFlag=true;
  this.toDateFlag=false;
  }
  displaycal2() {
    this.showcalander = true;
  this.toDateFlag=true;
  this.fromDateFlag=false;
  }
  
  onDateChange(date: NgbDateStruct, type) {
    this.showcalander = false;
    if(type == 'from'){
      this.fromDate = date;
      let f_year = this.fromDate.year;
      let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
      let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
      this.dateA = f_year + "-" + f_month + "-" + f_day;
      if(this.toDate && this.dateA > this.today){
        // alert(this.translate.instant("from_to_date_alert"));
       // this.dateA = this.toDate;
        return false;
      } 
      this.search_from.patchValue({
        from_date:this.dateA
      })
    }
    if(type == 'to'){ 
      this.toDate = date;
      let t_year = this.toDate.year;
      let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
      let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
      this.today = t_year + "-" + t_month + "-" + t_day;
   
      if(this.dateA > this.today){
        alert("to date can't be less than from date");
        //this.toDate = this.dateA;
        this.today=''
        this.search_from.patchValue({
          to_date:""
        })
        return false;
      }
      this.search_from.patchValue({
        to_date:this.today
      })
      
    }
 
  }
  boardlistfunction() {
    this.http.get(this.myService.constant.apiURL + "boards/getallboard").subscribe(data => {
      const boards: any = data;
      this.boardlist = boards.response
     
    });
  }
  classlist(boardId){
    const classparams = {
      "boardId": boardId,
      "school_id": this.school_id
    }
    this.http.post(this.myService.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const data: any = details
      this.coursetype_list= data.response


    });
  }

  onSubmit(val){
    console.log(val);
    const param={
      "adm_no":val.adm_no,
      "from_date":val.from_date,
      "to_date":val.to_date,
      "schoolId":val.center,
      "boardId":val.course,
      "classId":val.course_type
    }
  }
}
