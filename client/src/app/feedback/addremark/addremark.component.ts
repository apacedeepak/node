import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-addremark',
  templateUrl: './addremark.component.html',
  styleUrls: ['./addremark.component.css']
})

export class AddremarkComponent implements OnInit, OnDestroy {
  userid: number = 0;
  route$: any;
  disabledbtn: boolean = true
  globalObj: any = {}
  negativeArr: any = []
  positiveArr: any = []
  remarkId: any = []
  remark: string = ''
  responseMessage: boolean = false;
  popmessage: string = '';
  tempArr: any = []
  remarkArr: any = []
  statusArr: any = []
  student_image: string = ''
  flagHeight: boolean = false;
  trueid: any = []
  project_name: string = ''
  positiveHeight: boolean = false;
  negativeHeight: boolean = false;
  isAdmin: any = [];
  mylang:any='';
  constructor(private router: Router, private http: HttpClient, private route : ActivatedRoute, private myService: BackendApiService,private translate: TranslateService) {
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
    this.student_image = localStorage.getItem("student_image");
    
    this.globalObj.userid = window.localStorage.getItem('user_id');
    this.globalObj.sessionid = window.localStorage.getItem('session_id'); 
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    
    this.route$ = this.route.params
      .subscribe(
        params => {
           this.userid = +params["id"]; 
           this.studentFeedback()
        }
     );
  }

  studentFeedback(){
    const url: string = this.myService.constant.apiURL + "student_feedback_remarks/studentFeedback"
    this.http.post(url, {user_id: this.userid, school_id: this.globalObj.school_id, added_by: this.globalObj.userid }).subscribe(details => {
      const data: any = details;
      
      if(data.response_type.status == "200"){
        this.positiveArr = data.response.positive
        this.negativeArr = data.response.negative
        this.positiveHeight = (this.positiveArr.filter(obj => obj.value == 1).length > 0)? true: false 
        this.negativeHeight = (this.negativeArr.filter(obj => obj.value == 1).length > 0)? true: false 
      }else{
      }
    }, error => console.log(error));
    
  }

  onChangeRemark(event, obj: Remark){  
    if(obj.value) this.trueid.push(obj.id)
    else this.trueid.splice(this.trueid.indexOf(obj.id), 1)
    
    this.flagHeight = (this.trueid.length > 0)? true: false
    
    if(obj.value && this.remarkId.indexOf(obj.id) == -1)
      this.tempArr.push({ remark_id: obj.id, remark: obj.remark, status: obj.value, isAdmin: obj.isAdmin })
    else {
      let index = this.remarkId.indexOf(obj.id); 
      if(this.tempArr[index].remark_id == obj.id) this.tempArr[index].status = obj.value
      this.remarkId.splice(index, 1)
      this.remarkArr.splice(index, 1)
      this.statusArr.splice(index, 1)
      this.isAdmin.splice(index, 1)
    }

    this.setRemarkArr()  
    this.disableBtn()
  }

  onChangeComment(event, obj: Remark){ 
    this.tempArr.map(objct => {
      if(objct.remark_id == obj.id){
        objct.remark = obj.remark 
      }
    })
    this.setRemarkArr() 
  }

  setRemarkArr(){
    this.remarkArr = [], this.statusArr = [], this.remarkId = [], this.isAdmin = []
    this.tempArr.map(elem => {
      this.remarkArr.push(elem.remark)
      this.remarkId.push(elem.remark_id)
      this.statusArr.push(elem.status)
      this.isAdmin.push(elem.isAdmin)
    }) 
  }

  disableBtn(){ 
    this.disabledbtn = (this.trueid.length == 0)? true: false
  }

  closeme(){
    this.responseMessage = false 
  }

  addFeedback(event, type){ 
    event.preventDefault(); 
    if(!this.userid && this.remarkId.length == 0) return
    const params: Feedback = { 
      remark_id: this.remarkId, 
      user_id: this.userid, 
      addedBy: this.globalObj.userid, 
      remark: this.remarkArr, 
      status: this.statusArr,
      remarks_category: type,
      isAdmin: this.isAdmin
    }

    const url = this.myService.constant.apiURL + "student_feedback_remarks/addStudentFeedback"  
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details
      this.responseMessage = true
      this.popmessage = this.translate.instant(data.response_type.message);
      this.flagHeight = false
      
      if(type.toLowerCase() == "positive"){
        this.positiveHeight = false
        this.positiveArr.forEach(val => {
          val.value = ""
          val.remark = ""
        })
      }
      else if(type.toLowerCase() == "negative"){
        this.negativeHeight = false
        this.negativeArr.forEach(val =>{
          val.value = ""
          val.remark = ""
        })
      }
      this.disabledbtn = true;
      this.remarkId.length = 0
      this.remarkArr.length = 0 
      this.statusArr.length = 0
      this.isAdmin.length = 0
      this.tempArr.length = 0

    }, error => console.log(error))
    
  }

  addremovebehaviour(){
    this.router.navigate(["feedback/addremovebehaviour"]);
  }

  ngOnDestroy(){
    if(this.route$) this.route$.unsubscribe();
  }

}

interface Feedback {
  remark_id: number, 
  user_id: number, 
  addedBy: number,
  status: number,
  remark: string,
  remarks_category: string,
  isAdmin: any
}

interface Remark {
  id: number, 
  icon: string, 
  name: string,
  value: boolean,
  remark: string,
  isAdmin: number
}
