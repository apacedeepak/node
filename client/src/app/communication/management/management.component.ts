import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {
  public globalObj: any = {}; 
  userfilter: any = '';
  type: string = '';
  flag: string = '';
  viewProfileFlag: boolean  = false;
  profileinfo: any = [];
  profileinfofirst: any = [];
  profileinfosecond: any = [];
  mylang:any=''; 

  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient, private myService: BackendApiService, private router: Router,private translate: TranslateService) {

    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.showcalander = false;
    this.globalObj.showdaterange = false;
    this.globalObj.serverurl = this.myService.commonUrl;
    this.globalObj.hoveredDate = null;
    this.globalObj.fromDate = null;
    this.globalObj.toDate = null;
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.type = params['type'];
      this.flag = params['flag'];
    });
//  this.route.params.subscribe(params => {
//       this.id = +params['id']; // (+) converts string 'id' to a number
//       if (this.id) {console.log("test");
//         this.studentPersonalDetails(this.id);
//       }
//     });
    this.getAllCommunication(); 
  }

  viewProfile(type, user_id){
    (<any>$('#viewProfileModal')).modal('show'); 
    this.viewProfileFlag = true;
    let school_id = window.localStorage.getItem("school_id");
    const params = {
                    token:this.globalObj.token,
                    user_type: type,
                    user_id: user_id,
                    school_id: school_id
                  };
    
    this.http.post(this.myService.constant.apiURL + "communication/viewprofile", params).subscribe(details => {
      const detail: any  = details;
      if(detail.response_status.status == "200"){
        this.profileinfo = detail.response[0]
        this.profileinfofirst = this.profileinfo.first;
        this.profileinfosecond = this.profileinfo.second;
      }
    });
  }

  getisoDate(dateobj){
        
    var dd = dateobj.getDate();
    var mm = dateobj.getMonth()+1; 
    var yyyy = dateobj.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    return yyyy + '-' + mm + '-' + dd;
  }

  messagetabfunc(type){
    $("#message").hide();
    $("#circular").hide();
    $("#notice").hide();
    $("#"+type).show();
  }

  getAllCommunication()
  { this.globalObj.messagecount = true;
    this.globalObj.noticecount = true;
    this.globalObj.circularcount = true;

    if(this.flag == 'today'){
      this.globalObj.fromrange = this.getisoDate(new Date()); 
      this.globalObj.torange = this.getisoDate(new Date());
    }
    else if(this.flag == 'lastmonth'){
      var myDate = new Date();
      var date = new Date(myDate);
      date = new Date(date.setMonth(date.getMonth() - 1));
      this.globalObj.fromrange = this.getisoDate(new Date(date.getFullYear(), date.getMonth(), 1));
      this.globalObj.torange = this.getisoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    }
    else if(this.flag == 'tilldate'){
      this.globalObj.torange = this.getisoDate(new Date());
    }
    else if(this.flag == 'range'){
      this.globalObj.fromrange = this.getisoDate(new Date(window.localStorage.getItem('fromDateGraph')));
      this.globalObj.torange = this.getisoDate(new Date(window.localStorage.getItem('toDateGraph')));
    }

    if(this.type == 'notice'){
      $("#noticetab").trigger('click');
      $("#message").hide();
      $("#circular").hide();
      $("#notice").show();
    }
    else if(this.type == 'msg'){
      $("#messagetab").trigger('click');
      $("#circular").hide();
      $("#notice").hide();
      $("#message").show();
    }
    else if(this.type == 'circular'){
      $("#circulartab").trigger('click');
      $("#notice").hide();
      $("#message").hide();
      $("#circular").show();
    }

    const params = {token:this.globalObj.token,from_date:this.globalObj.fromrange,to_date:this.globalObj.torange,message_id:this.globalObj.messageid};
    
    this.http.post(this.myService.constant.apiURL + "communication/communicationall", params).subscribe(details => {
      this.globalObj.responseData = details;
      if(this.globalObj.responseData.response_status.status=="200")
        {
          this.globalObj.messagearr = this.globalObj.responseData.response.message;
          if(this.globalObj.responseData.response.message.length==0)
          this.globalObj.messagecount = false;
          if(this.globalObj.responseData.response.notice.length==0)
            this.globalObj.noticecount = false;
          if(this.globalObj.responseData.response.circular.length==0)
            this.globalObj.circularcount = false;
          this.globalObj.noticearr = this.globalObj.responseData.response.notice;
          this.globalObj.circulararr = this.globalObj.responseData.response.circular;
          
        }
      
    })

  }

  userFilterFunc(type){
    this.userfilter = type;
    this.globalObj.filterFlag = true;

    if(type == ''){
      this.globalObj.filterFlag = false;
    }
    for(let k in this.globalObj.messagearr){
      if(this.globalObj.messagearr[k].senderType.toLowerCase() == type.toLowerCase()){
        this.globalObj.filterFlag = false;
      }
    }
  }

   displaycal() {
    this.globalObj.showcalander = true;
  }
  onDateChange(date: NgbDateStruct) {
    if (!this.globalObj.fromDate && !this.globalObj.toDate) {
      this.globalObj.fromDate = date;
    }  else if (this.globalObj.fromDate && !this.globalObj.toDate && equals(date, this.globalObj.fromDate)) {
      this.globalObj.toDate = this.globalObj.fromDate;
    }
    else if (this.globalObj.fromDate && !this.globalObj.toDate && after(date, this.globalObj.fromDate)) {
      this.globalObj.toDate = date;
    } else {
      this.globalObj.toDate = null;
      this.globalObj.fromDate = date;
    }
    if (this.globalObj.fromDate != null && this.globalObj.fromDate != null != undefined && this.globalObj.toDate != null && this.globalObj.toDate != undefined) {
      this.globalObj.showdaterange = true;
      this.globalObj.showcalander = false;
      let f_year = this.globalObj.fromDate.year;
      let f_month = this.globalObj.fromDate.month < 10 ? '0' + this.globalObj.fromDate.month : this.globalObj.fromDate.month;
      let f_day = this.globalObj.fromDate.day < 10 ? '0' + this.globalObj.fromDate.day : this.globalObj.fromDate.day;
      this.globalObj.fromrange = f_year + "-" + f_month + "-" + f_day;
      let t_year = this.globalObj.toDate.year;
      let t_month = this.globalObj.toDate.month < 10 ? '0' + this.globalObj.toDate.month : this.globalObj.toDate.month;
      let t_day = this.globalObj.toDate.day < 10 ? '0' + this.globalObj.toDate.day : this.globalObj.toDate.day;
      this.globalObj.torange = t_year + "-" + t_month + "-" + t_day;
      this.getAllCommunication();

    }

  }

  removerange() {
    this.globalObj.toDate = null;
    this.globalObj.fromDate = null;
    this.globalObj.showdaterange = false;
    this.globalObj.fromrange = '';
    this.globalObj.torange = '';
    this.getAllCommunication();
  }

  showmessage(type,uniqueid)
  {
    
    //if(type=='message')
     // {
         this.globalObj.commid = uniqueid;
         this.globalObj.type = type;
        this.communicationdetail();
     // }
  }
    cleardetail()
    {
       this.globalObj.sendernames = null;
      this.globalObj.description = null;
      this.globalObj.attachment = [];
    }
    communicationdetail()
    {
      const params = {id:this.globalObj.commid,type:this.globalObj.type=='message'?this.globalObj.type:'announcement'}
      this.http.post(this.myService.constant.apiURL + "communication/communicationdetail", params).subscribe(details => {
        this.globalObj.responsedetail = details;
        this.globalObj.attachment = [];
        this.globalObj.sendernames = null;
        this.globalObj.description = null;
        if(this.globalObj.responsedetail.response_status.status=="200")
          {
        if(this.globalObj.type=='message')
          {
            let allname = this.globalObj.responsedetail.response.display_name;
            let sendernames = '';
            for (let key in allname)
              {
                sendernames = sendernames + allname[key] + ",";
              }
              sendernames = sendernames.substring(0,sendernames.length-1);
              this.globalObj.sendernames = sendernames;
              this.globalObj.description = this.globalObj.responsedetail.response.message_body;
              this.globalObj.attachment = this.globalObj.responsedetail.response.attachments;
              this.globalObj.title = this.globalObj.responsedetail.response.message_subject;
              
          }
            if(this.globalObj.type=='notice' || this.globalObj.type=='circular')
          {
            
              this.globalObj.title = this.globalObj.responsedetail.response.subject;
              this.globalObj.description = this.globalObj.responsedetail.response.message;
              if(this.globalObj.responsedetail.response.attachment)
              this.globalObj.attachment.push(this.globalObj.responsedetail.response.attachment);
              
              
          }
          }
      })
    }
  isHovered = date => this.globalObj.fromDate && !this.globalObj.toDate && this.globalObj.hoveredDate && after(date, this.globalObj.fromDate) && before(date, this.globalObj.hoveredDate);
  isInside = date => after(date, this.globalObj.fromDate) && before(date, this.globalObj.toDate);
  isFrom = date => equals(date, this.globalObj.fromDate);
  isTo = date => equals(date, this.globalObj.toDate);

}
