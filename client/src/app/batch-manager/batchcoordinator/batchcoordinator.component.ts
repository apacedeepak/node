
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, RequiredValidator } from '@angular/forms';
import * as Rx from 'rxjs';
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: 'app-batchcoordinator',
  templateUrl: './batchcoordinator.component.html',
  styleUrls: ['./batchcoordinator.component.css']
})
export class BatchcoordinatorComponent implements OnInit {
coordinatorform:FormGroup
school_id:any;
sessionId:any
boardlistbatch:any=[];
coursetype_list_batch:any=[];
sectionlist_batch:any=[];
staffList:any=[]
public mylang: any = "";
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder,  private translate: TranslateService) {
    this.mylang = window.localStorage.getItem("language");
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang("en");
    }

   }

  ngOnInit() {
   
    this.school_id = window.localStorage.getItem('school_id');
    this.sessionId = window.localStorage.getItem('session_id');
    this.coordinatorform=new FormGroup({
      course:new FormControl(''),
      course_type:new FormControl(''),
      batch:new FormControl(''),
      staff:new FormControl('')
    })
    this.boardlistfunction()
  }
  boardlistfunction() {
    this.http.get(this.myService.constant.apiURL + "boards/getallboard").subscribe(data => {
      const boards: any = data;
      this.boardlistbatch = boards.response
    
    });
  }
  classlistfunctionbatch(boardId) {
    this.coursetype_list_batch=[];
    this.sectionlist_batch=[];
    this.staffList=[];
    this.coordinatorform.patchValue({
      course_type:""
    })
    const classparams = {
      "boardId": boardId,
      "school_id": this.school_id
    }

    this.http.post(this.myService.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const data: any = details
      this.coursetype_list_batch = data.response
    });
  }
  onclasschangebatch(classId) {
    this.sectionlist_batch=[];
    this.staffList=[]
    this.coordinatorform.patchValue({
      batch:""
    })
    const param = {
      "class_id": classId
    };

    this.http.post(this.myService.constant.apiURL + 'sections/allsectionbyclassid', param).subscribe(datas => {
      const section: any = datas;

      this.sectionlist_batch = section.response;

    })
  }
  onchangesection(sectionId){
    this.coordinatorform.patchValue({
      staff:""
    })
    this.staffList=[]
    const param={
      "schoolId":this.school_id,
      "sectionId":sectionId
    }
    this.http.post(this.myService.constant.apiURL + 'user_sections/allteachersofrequestedbatch', param).subscribe(datas => {
      const section: any = datas;

      this.staffList = section.response;
      if(this.staffList.length==0){
        alert("No Faculty has been assigned to this section")
      }

    })
    
  }
  onSubmitbatch(val){
    console.log(val)
    const param={
      "schoolId":this.school_id,
      "sectionId":val.batch,
      "userId":val.staff
    }
    this.http.post(this.myService.constant.apiURL + 'user_sections/updatebatchcoordinator', param).subscribe(datas => {
      const section: any = datas;
      if(section.response_status.status=="200"){
        alert(section.response_status.message);
        window.location.reload()
      }
      else if (section.response_status.status=="202"){
        alert(section.response_status.message);
        this.coordinatorform.patchValue({
          course:"",
          staff:"",
          course_type:"",
          batch:""
        })
      }
      else if (section.response_status.status=="201"){
        alert(section.response_status.message)
      }
    }); 
  }
}
