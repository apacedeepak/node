import { Component, OnInit} from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';

import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {

  public sessionid: any;
  public userid: any;
  public token: any;
  public studentdata: any;
  public schoolId: any;
  public classlist: any;
  public sectionlist: any;
  public sendtolist: any;
  public subject_id: any;
  public section_id: any;
  public class_id: any;
  public subjectlist: any;
  public attpath: any='';
  public createplandata: any = '';
  public sectiondata : any ='';
  public isImage: boolean = false;
  public uploadimg : boolean = false;
  public fetchresult : boolean = false;
  public attachelist : boolean = false;
  public fileName: any = [];
  public fileNameIcon: any = [];
  public filelist: Array<any> = new Array<any>();
  public fileimage: Array<any> = new Array<any>();
  public inputFileModel: Array<any> = new Array<any>();
  public editInputFileModel: Array<any> = new Array<any>();
  public planlist: any;
  public renderTimetable : any = [];
  public subjectname : any;
  public nameofimage : any;
   public serverurl :any = '';
   public substudy : any = '';
   public tablelists : any = '';
   public Timetablecond: boolean = false;
public globalObj: any = {};
public flag:boolean=false;
mylang:any='';
  //  public serverurl1 :any = '';

  constructor(private http: HttpClient, private myService: BackendApiService,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.schoolId = window.localStorage.getItem('school_id');
    this.serverurl = this.myService.commonUrl;
    
    this.globalObj.record = false;
    
    this.getassignedclass();
  }
  //  @ViewChild('form') form;
   reset() { 
    $("#classslist").val("");
     this.class_id='';
         this.section_id = '';
   this.schoolId = '';
   this.subject_id = '';
  }
  getassignedclass() {
    this.studentdata = [];
    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id": this.schoolId,
      "token": this.token
    };
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {
      this.classlist = details;
      if (this.classlist.response_status.status == '200') {
        this.classlist = this.classlist.response.assigned_classes;
      }

    });
  }

  getassignedsection(val) { 
      this.globalObj.classId = val;
    if (val == '') {
      this.studentdata = [];
      this.subject_id = '';
      this.section_id = '';
      this.sectionlist = [];
      this.subjectlist = [];
    }
    this.studentdata = [];
    if (val != '') {
        
      const params = {
        "user_id": this.userid,
        "session_id": this.sessionid,
        "class_id": val,
        "token": this.token
      };
      this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {
        this.sectiondata = details;
        if (this.sectiondata.response_status.status == '200') {
          this.sectionlist = this.sectiondata.response.assigned_sections;
         
        }
      });
    }
  }
  

  getassignedsubject(val, labelval) {
    this.subject_id = '';
    this.section_id = val;
    if(!val){
        this.subjectlist = [];
    }
    
    if (val != '') {
      if (labelval != undefined) {

        const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "section_id": val,
          "token": this.token
        };
        this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

          this.subjectlist = details;
          if (this.subjectlist.response_status.status == '200') {
            this.subjectlist = this.subjectlist.response.assigned_subjects;
          }
        });
      }
    }
  }
  
  resest(){
//     this.subjectlist = [];
//  this.classlist=[];
// this.sectionlist=[];

// $("#classslist").val($("#classslist").find('option[selected]').val());

this.getassignedsection("");
this.getassignedclasssecandgroup("");
this.getassignedsubject("","")

// console.log(this.classlist);
// console.log(this.)
  }
  getassignedclasssecandgroup(val) {
    this.subject_id = val;
  }
  onAccept(file: any, flag) {
      
   
    
    const fileExten = file.file.name.split(".");
    const fileExtindex = fileExten.length - 1;
    if (fileExten[fileExtindex].toLowerCase() == 'pdf') {

      this.fileimage.push('assets/images/pdf-type.png');
      this.filelist.push(file);

    }else {
        alert(this.translate.instant('please_upload_only_pdf_file'))
        this.filelist = [];
        this.fileimage = [];
        this.inputFileModel=[];
        this.isImage = false;
        return false;
    }
    if (this.filelist.length >= 0 && flag == 'add') {
        this.isImage = true;
        this.filelist.push(file);
    }else if(flag == 'edit'){
        this.filelist = [];
        const fileName = file.file.name;
        this.nameofimage = fileName;
        this.filelist.push(file);
    }
    
  }

  removeFile(index, type) {
    this.filelist = [];
    this.fileimage = [];
    this.inputFileModel=[];
    this.editInputFileModel=[];
    this.isImage = false;
  }
  
  removeAllFile(flag) {
    this.filelist = [];
    this.fileimage = [];
    this.inputFileModel=[];
    this.editInputFileModel=[];
    this.isImage = false;
  }
  
  
  
  onRemove(file: any): void {
      
    this.filelist = [];
    this.fileimage = [];
    this.inputFileModel=[];
    this.editInputFileModel=[];
    this.isImage = false;
  }

  uploadpdf() { 
this.flag=true;
    var formData = new FormData();
    if(!this.globalObj.classId && this.filelist.length==0){
        alert( this.translate.instant('please_select_class_section_subject_attachment')); 
        return false;
    }
    if(this.globalObj.classId && !this.section_id && this.filelist.length==0){
        alert(this.translate.instant('please_select_section_subject_attachment')); 
        return false;
    }
    if(this.globalObj.classId && this.section_id && !this.subject_id && this.filelist.length==0){
        alert(this.translate.instant('Please select subject and attachment')); 
        return false;
    }
    if(!this.globalObj.classId){
        alert(this.translate.instant('please_select_class_section_subject')); 
        return false;
    }
    if(this.globalObj.classId && !this.section_id){
        alert(this.translate.instant('please_select_section_subject')); 
        return false;
    }
    if(this.globalObj.classId && this.section_id && !this.subject_id){
        alert( this.translate.instant('please_select_subject')); 
        return false;
    }
    if(this.globalObj.classId && this.section_id && this.subject_id && this.filelist.length==0){
        alert( this.translate.instant('attachment_not_found'))
        return false;
    }
    
    
    if(this.filelist.length == 0){
    alert(this.translate.instant('attachment_not_found'))
    return false;
    }else{
      this.attachelist = true;
    }
    for (var i in this.filelist) {
      formData.append(i, this.filelist[i].file);
    }
    formData.append("id", '');
    formData.append('section_id', this.section_id)
    formData.append("user_id", this.userid);
    formData.append("schoolId", this.schoolId);
    formData.append("subject_id", this.subject_id);
    formData.append("session_id", this.sessionid);
    formData.append("token", this.token);
    formData.append("class_id", this.globalObj.classId);

    this.http.post(this.myService.constant.apiURL + "studyplans/createstudyplan", formData).subscribe(details => {
      this.createplandata = details;
       this.attpath = this.createplandata.attachments;
      if (this.createplandata.status == '200') {
        this.uploadimg = true;
        this.createplandata = this.createplandata.message;
      }
    });
  }


    seeresult(){
      this.renderTimetable = [];
    this.fetchresult = true;
      const params = {
              "user_id": this.userid,
              "session_id": this.sessionid,
              "section_id": this.section_id,
              "token": this.token,
              "subject_id": this.subject_id,
              "class_id": this.globalObj.classId
      }
      this.http.post(this.myService.constant.apiURL+"studyplans/getstudyplanlist",params).subscribe(details => {
          this.planlist = details;
          if(this.planlist.response.data.length > 0){
              var renderTimetable = this.planlist.response.data;
              this.Timetablecond = true;
              let checkIndex = [];
              renderTimetable.forEach((element,key) => {
                for(let i in element){
                    for(let k in element[i]){
                      this.renderTimetable.push(element[i][k])
                    }
                }
              });
              if(this.renderTimetable.length==0){
                  this.globalObj.record = false;
              }
            }
        });
    }
    
    removefiles(id){  
        $("#uploadfile"+id).hide();
        this.filelist = [];
        this.fileimage = [];
        this.editInputFileModel=[];
        this.nameofimage = "";
    }

    showfilediv(id){ 
        $("#uploadfile"+id).show();
    }

updatefiles(id){ 
  //  this.attachelist = true;
   var formData = new FormData();
   console.log(this.filelist)
   for (var i in this.filelist) {
      formData.append(i, this.filelist[i].file);

    }
     formData.append("token", this.token);
     formData.append("id", id);

    this.http.post(this.myService.constant.apiURL + "studyplans/createstudyplan", formData).subscribe(details => {
      this.subjectlist = details;
      if (this.subjectlist.status == '200') {
        console.log("success");
        this.uploadimg = true;
        this.subjectlist = this.subjectlist.message;
        
        this.filelist = [];
        this.fileimage = [];
        this.editInputFileModel=[];
        this.nameofimage = "";
        window.location.reload();
        
      }
    });
  }

  refresh(): void { 
    this.resest();
    window.location.reload();
}


removestudyfun(studyplan_id){ 
 var r = confirm(this.translate.instant("Are you sure, you want to delete"));
        if(r == false){
            return false;
        }else{
             const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "token": this.token,
          "id":studyplan_id
           }
          this.http.post(this.myService.constant.apiURL+"studyplans/deletestudyplan",params).subscribe(details => {
              this.planlist = details;
              if(this.planlist.successMessage.status == '200'){ 
              let resp = this.planlist.successMessage.message;
              this.seeresult();
              }
            });
        }
  }
}

