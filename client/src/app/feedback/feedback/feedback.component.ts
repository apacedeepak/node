import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BackendApiService } from './../../services/backend-api.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  students: any = []
  globalObj: any = {};
  classlist: any = []
  sectionid: any = ""
  classid: any = ""
  sectionlist: any = []
  identifier: number = 0;
  project_name: string = '';
  mylang:any='';
  constructor(private http: HttpClient, private myService: BackendApiService, private router: Router,private translate: TranslateService) { 
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }
  ngOnInit() {   
    this.globalObj.user_type = localStorage.getItem('user_type');
    if(this.globalObj.user_type.toLowerCase() != 'teacher') this.router.navigate(["dashboard/main"]);
    this.project_name = this.myService.constant.PROJECT_NAME
    this.globalObj.domainUrlwithoutSlash = this.myService.commonUrl1;     
    this.globalObj.user_type = localStorage.getItem('user_type');
    this.globalObj.userid = window.localStorage.getItem('user_id');
    this.globalObj.sessionid = window.localStorage.getItem('session_id'); 
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    this.globalObj.class_teacher_section_id = window.localStorage.getItem('class_teacher_section_id');
    this.getassignedclass()
  }

  getassignedclass() {
    const params = {
      "user_id": this.globalObj.userid,
      "session_id": this.globalObj.sessionid,
      "school_id": this.globalObj.school_id
    };
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {
      this.classlist = details;
      if (this.classlist.response_status.status == '200') {
        this.classlist = this.classlist.response.assigned_classes;
        let classlist_filtered = this.classlist.filter(obj => obj.section_id == this.globalObj.class_teacher_section_id)
        if(classlist_filtered && classlist_filtered.length > 0 ) this.classid = classlist_filtered[0].class_id
       
        if(!this.classid) this.classid = this.classlist[0].class_id 
      
        this.getassignedsection()
      }
    });
  }

  getassignedsection() {
        this.identifier++
        if(!this.classid) return;
        const params = {
          "user_id": this.globalObj.userid,
          "session_id": this.globalObj.sessionid,
          "class_id": this.classid
        };

        this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {
          this.sectionlist = details;
          if (this.sectionlist.response_status.status == '200') {
            this.sectionlist = this.sectionlist.response.assigned_sections;
           
            if(this.classid != "Select Class" && this.identifier == 1)
              this.sectionid = (this.globalObj.class_teacher_section_id)? this.globalObj.class_teacher_section_id: this.sectionlist[0].section_id
            else
              this.sectionid = this.translate.instant('Select Section')
            this.createStudentList()
          }else{

          }
        });
  }

  createStudentList(){
    if(this.sectionid != this.translate.instant("Select Section") && this.classid != "Select Class"){
      const params = { section_id: this.sectionid, user_type: 'Student' }
      this.studentList(params)
    }else{
      this.students = [] 
    }
  }

  setImage(user_id, image){
    if(!user_id) return;
    localStorage.setItem("student_image", image);
    this.router.navigate(['/feedback/addremark', user_id]);
  }

  studentList(params){
    if(!params) return
   
    this.http.post(this.myService.constant.apiURL + "sections/getuserbysection", params)
    .subscribe(details => {
      const data: any = details;
      if(data.response.status == "200"){ 
        let section_have_users = data.response.data.section_have_users;
        if(section_have_users && section_have_users.length > 0){
          this.students = []
          section_have_users.filter(obj => {
            this.students.push(
              { 
                user_id: obj.students.userId, 
                image: obj.students.student_photo,
                name: obj.students.name 
              })
          })
        }else{

        }
      }
      else{

      }
    })
  }

}
