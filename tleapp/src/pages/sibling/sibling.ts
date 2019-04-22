import { Component,Input ,OnInit, Output, EventEmitter} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';


/**
 * Generated class for the SiblingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sibling',
  templateUrl: 'sibling.html',
})
export class SiblingPage implements OnInit{
  @Input() callFrom: string;
  globalObj : any ={};
  @Output() siblingChange: EventEmitter<number> =   new EventEmitter();

  constructor(public navCtrl: NavController, public navParams: NavParams,private http: HttpClient,
    private myProvider: CommonProvider) {
    this.globalObj.siblingData = JSON.parse(window.localStorage.getItem('siblingData'));
    this.globalObj.ProfileImage = window.localStorage.getItem('ProfileImage');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.domainUrl = this.myProvider.globalObj.constant.domainUrl
    this.globalObj.siblingDataFlag = false;
    this.globalObj.siblingDataList = false;

     // console.log(`ankit ${this.globalObj.siblingData}`);
     if(this.globalObj.siblingData && this.globalObj.siblingData.length>1)
     {
      this.globalObj.siblingDataFlag = true;
      
     }
    
  }
  ngOnInit()
  {
    
   // alert(this.callFrom);
    
  }
  changeUser(userId)
  {
    this.globalObj.siblingDataList = false;
    let obj = this.globalObj.siblingData.find(o => o.user_id == userId);

    window.localStorage.setItem('studentUserId', obj.user_id);
    window.localStorage.setItem('studentSectionId', obj.section_id);
                        
    let params = {"user_id":obj.user_id,
    "session_id":window.localStorage.getItem("sessionId"),
    "type":"Student",
    "school_id":window.localStorage.getItem("schoolId")};
    this.updateLocalStorageData(params)
  
  }
  updateLocalStorageData(param)
  {
    this.http.post(this.globalObj.serverUrl+"users/userdetail", param).subscribe(data => {
      var userdetail: any  = data;
      if(userdetail.response_status.status=='200')
      {
          let classTeacher = userdetail.response.classTeacher_name?userdetail.response.classTeacher_name:'NA';
       window.localStorage.setItem('classTeacherName', classTeacher);
      }
      let admissionNo = userdetail.response.admission_no;
      window.localStorage.setItem('admissionNo', admissionNo);
      window.localStorage.setItem('loginName', userdetail.response.name);
       let profileImage = userdetail.response.student_photo?this.globalObj.domainUrl+"/"+userdetail.response.student_photo:"assets/imgs/profile_img.jpg";
       window.localStorage.setItem('ProfileImage', profileImage);
       this.globalObj.ProfileImage = profileImage;
       this.siblingChange.emit();
      
      
  })
  }
  showStudentList(){
    this.globalObj.siblingDataList = true;
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SiblingPage');
  }

}
