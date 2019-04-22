import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {
    
    public globalObj: any = {};
    public studentData: any= [];
    end_date: any;
    start_date: any;
    total: any;
    holidays: any;
    mylang:any='';
    
  constructor(private myService: BackendApiService, private http: HttpClient,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
        this.globalObj.user_id = window.localStorage.getItem('user_id');
        this.globalObj.user_type = window.localStorage.getItem('user_type');
        this.globalObj.school_id = window.localStorage.getItem('school_id');
        this.globalObj.session_id = window.localStorage.getItem('session_id');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.classname = '';
        this.globalObj.section = '';
        this.globalObj.basepath = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME+'/';
        
        this.searchData(null);
  }
  
  searchData(flag){
      this.studentData = [];
      if(!flag){
          const params = {
            user_id: this.globalObj.user_id,
            user_type: this.globalObj.user_type,
            school_id: this.globalObj.school_id,
            session_id: this.globalObj.session_id,
            token: this.globalObj.token
        };
        
        this.http.post(this.myService.constant.apiURL+"dashboards/classteacherdashboard", params).subscribe(details => {
            const data:any = details;
            const studentData = data.response.dashboardData;
            this.globalObj.classname = data.response.classSection.className;
            this.globalObj.section = data.response.classSection.section;
            this.studentData = [];
            for(let key in studentData){
            this.studentData.push({
                    'name': studentData[key].name,
                    'student_photo': studentData[key].student_photo,
                    'admission_no': studentData[key].admission_no,
                    'userId': studentData[key].userId,
                    "indiscipline": studentData[key].indiscipline,
                    "presentAttendance": studentData[key].totalPresent,
                    "totalAttendance": studentData[key].totalAttendenceCount,
                    "fee": studentData[key].fee,
                    "roll_no": studentData[key].roll_no
                });
            }
        });
      }else{ 
     
      
      const params = {
            user_id: this.globalObj.user_id,
            user_type: this.globalObj.user_type,
            school_id: this.globalObj.school_id,
            session_id: this.globalObj.session_id,
            token: this.globalObj.token
        };
        
        this.http.post(this.myService.constant.apiURL+"dashboards/classteacherdashboard", params).subscribe(details => {
            const data:any = details;
            const studentData = data.response.dashboardData;
            this.globalObj.classname = data.response.classSection.className;
            this.globalObj.section = data.response.classSection.section;
            this.studentData = [];
            for(let key in studentData){
                var adm = studentData[key].admission_no.split("_");
            var str = studentData[key].name;
            str = str.toLowerCase();
            var small = flag.toLowerCase();
            var nameFlag = str.search(small);
            

            //if(nameFlag >= 0 || flag == adm[1]){ 
            if(nameFlag >= 0){ 
                    this.studentData.push({
                            'name': studentData[key].name,
                            'student_photo': studentData[key].student_photo,
                            'admission_no': studentData[key].admission_no,
                            'userId': studentData[key].userId,
                            "indiscipline": studentData[key].indiscipline,
                            "presentAttendance": studentData[key].totalPresent,
                            "totalAttendance": studentData[key].totalAttendenceCount,
                            "fee": studentData[key].fee,
                            "roll_no": studentData[key].roll_no
                    });
                }
            }
        });
      
      }
  }
  
  checkIsBlank(flag){
      if(!flag){
        this.searchData(null);
      }
  }

}
