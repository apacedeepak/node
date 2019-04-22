import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-teachermarkentry',
  templateUrl: './teachermarkentry.component.html',
  styleUrls: ['./teachermarkentry.component.css']
})
export class TeachermarkentryComponent implements OnInit {
    
    public globalObj: any = {};
    
     constructor(){}

     ngOnInit() {
         const isClassTeacher = window.localStorage.getItem('isClassTeacher');
         
         if(isClassTeacher && isClassTeacher != "No"){
             this.globalObj.isClassTeacher = true;
         }else{
             this.globalObj.isClassTeacher = false;
         }
         this.globalObj.subjectStud = true; 
     }
     
     subjectStud(flag){
         if(flag == 'subject'){
             this.globalObj.subjectStud = true; 
         }else{
             this.globalObj.subjectStud = false; 
         }
     }
}
