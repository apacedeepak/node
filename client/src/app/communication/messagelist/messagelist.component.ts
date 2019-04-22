import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import {ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  selector: 'app-messagelist',
  templateUrl: './messagelist.component.html',
  styleUrls: ['./messagelist.component.css']
})
export class MessagelistComponent implements OnInit {
   @Input() listdata;
   @Input()  flag;
   @Input()  parentGlobal;
  @Output() countChanged: EventEmitter<number> =   new EventEmitter();
  @Output() search: EventEmitter<any> =   new EventEmitter();
  @Output() dateSearch: EventEmitter<any> =   new EventEmitter();

    form: FormGroup;
    public globalObj: any = {};
    public data;
    public callfrom:any = '';
    public fromDate : any;
    public toDate : any;
    public hoveredDate : any;
    public showcalander : boolean = false;
    public showdaterange : boolean = false;
    public fromrange : any = '';
    public torange : any = '';
    public emailFormArray: any = '';
    public admindata : any;
    public staffList : any;
    public sectionlist: any;
    public studentlist: any;
    public username: any = [];
    public classTeacherList: any = [];
    public teacherList: any = [];
    public draft: any = "";
    public searchData: any = {};
    public dateFilter: any = [];
    mylang:any=''; 



  constructor(private myService: BackendApiService, private http: HttpClient,
              private router: Router, private fb: FormBuilder,private translate: TranslateService) {
            this.globalObj.user_id = window.localStorage.getItem('user_id');
            this.globalObj.user_type = window.localStorage.getItem('user_type');
            this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
            this.globalObj.token = window.localStorage.getItem('token');
            this.globalObj.school_id = window.localStorage.getItem('school_id');
            this.mylang= window.localStorage.getItem('language');
   
            if(this.mylang){
             translate.setDefaultLang( this.mylang);}
             else{
               translate.setDefaultLang( 'en');
             }
        }

  ngOnInit() {
      this.globalObj.sessionId = window.localStorage.getItem('session_id');
    this.draft = "Draft";
    this.globalObj.userwise = true;
    ;

       this.callfrom = window.localStorage.getItem('callfrom');


      this.form = this.fb.group({
        popupparentsection: [[''], Validators.required],
        popupstudent: [[''], Validators.required],
        popupparent: [[''], Validators.required],
        subjectradiobutton: new FormControl(),
        sectionradiobutton: new FormControl(),
        admincheck: this.fb.array([]),
        admincheckBox: this.fb.array([]),
        staffcheck: this.fb.array([]),
        groupusercheck: this.fb.array([]),
        staffcheckBox: this.fb.array([]),
        groupuserschechbox: this.fb.array([]),
        groupnamecheckbox: this.fb.array([]),
        classteachercheckBox: this.fb.array([]),
        teachercheckBox: this.fb.array([]),
        isStudentCheck: false,
        techcheck: this.fb.array([]),
        classtechcheck: this.fb.array([])
      })

            localStorage.removeItem('callfrom');

            if(this.callfrom=='dashboard')
             this.callfrom = true;
            else
              this.callfrom = false;

      let params = {
        user_id: '',
        user_type: '',
        school_id:this.globalObj.school_id,
        token:this.globalObj.token,
        session_id:this.globalObj.sessionId
      };
    	if(this.globalObj.user_type == "Parent"){
    		params.user_id = this.globalObj.student_user_id;
    		params.user_type = "Student";
    	}else{
    		params.user_id = this.globalObj.user_id;
    		params.user_type = this.globalObj.user_type;
            }

      this.http.post(this.myService.constant.apiURL+"communication/getcomposepopdata", params).subscribe(data => {
        const details: any = data;
        this.admindata = details.response[0].admin;
        this.sectionlist = details.response[0].assignClass;
        const teacherList = details.response[0].assignteachers;
        for(let key in teacherList){
            if(teacherList[key].class_teacher == 'No'){
              const control5 = new FormControl(false);
          (<FormArray>this.form.get('teachercheckBox')).push(control5);
                  this.teacherList.push({
                    name: teacherList[key].name,
                    user_id: teacherList[key].user_id
                  });
            }else{
              const control6 = new FormControl(false);
          (<FormArray>this.form.get('classteachercheckBox')).push(control6);
                this.classTeacherList.push({
                    name: teacherList[key].name,
                    user_id: teacherList[key].user_id
                  });
            }
        }
        for(let key in this.admindata){
          const control = new FormControl(false);
          (<FormArray>this.form.get('admincheckBox')).push(control);
        }
      });

      this.http.post(this.myService.constant.apiURL+"staffs/stafflistbyschoolid", params).subscribe(data => {
           const details: any = data;
           this.staffList = details.response;
            for(let key in this.staffList){
             const control1 = new FormControl(false);
             (<FormArray>this.form.get('staffcheckBox')).push(control1);
            }
      });


  }

  markasimp(mesgId, important){
    let param = {
      user_id: this.globalObj.user_id,
      message_id: mesgId,
      isImportant: 'Yes',
      token:this.globalObj.token
    };

    if(important == 'Yes'){
      param.isImportant = 'No';
    }
     this.http.post(this.myService.constant.apiURL+"message_recipients/markasimportant", param).subscribe(data => {
          const details: any = data;
          this.flag = 1;
          this.countChanged.emit(this.flag);
     });
  }

  movetoarchive(mesgId){
      let param = {
      user_id: this.globalObj.user_id,
      message_id: mesgId,
      token:this.globalObj.token
    };
     this.http.post(this.myService.constant.apiURL+"message_recipients/movetoarchived", param).subscribe(data => {
          const details: any = data;
          this.flag = 1;
          this.countChanged.emit(this.flag);

     });
  }


  userordata(type){
    if(type == 'user'){
      this.globalObj.userwise = true;
      this.globalObj.datewise = false;
      $('#userwise').addClass('active');
      $('#datewise').removeClass('active');
    }else if(type == 'date'){
        this.globalObj.userwise = false;
      this.globalObj.datewise = true;
      $('#userwise').removeClass('active');
      $('#datewise').addClass('active');
    }
  }

  fromtodate(type){
     if(type == 'from'){
      this.globalObj.fromdate = true;
      this.globalObj.todate = false;
      $('#fromdate').addClass('active');
      $('#todate').removeClass('active');
    }else if(type == 'to'){
        this.globalObj.fromdate = false;
      this.globalObj.todate = true;
      $('#fromdate').removeClass('active');
      $('#todate').addClass('active');
    }
  }

  onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if(this.fromDate!=null && this.fromDate!=undefined)
      {
         this.showdaterange = true;
         this.showcalander = false;
         let f_year = this.fromDate.year;
         let f_month = this.fromDate.month<10?'0'+this.fromDate.month:this.fromDate.month;
         let f_day = this.fromDate.day<10?'0'+this.fromDate.day:this.fromDate.day;
         this.fromrange = f_year+"-"+f_month+"-"+f_day;
         let t_year = this.toDate.year;
         let t_month = this.toDate.month<10?'0'+this.toDate.month:this.toDate.month;
         let t_day = this.toDate.day<10?'0'+this.toDate.day:this.toDate.day;
         this.torange = t_year+"-"+t_month+"-"+t_day;

      }

  }

    isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

   removerange(type, userId){
     if(type == 'date'){
        this.toDate = null;
        this.fromDate = null;
        this.showdaterange = false;
        this.fromrange = '';
        this.torange = '';
        this.dateFilter = [];
        this.searchData['name'] = this.username;
        this.searchData['date'] = this.dateFilter;


       this.search.emit(this.searchData);
     }else {


          for(let ind in this.staffList){
              if(userId == this.staffList[ind].userId){
                  (<FormArray>this.form.get("staffcheckBox")).controls[ind].setValue(false);
              }
          }
          
          for(let ind in this.sectionlist){
              for(let index in this.sectionlist[ind].assignStudent){
                  if(this.sectionlist[ind].assignStudent[index].user_id == userId || this.sectionlist[ind].assignStudent[index].parent_userId == userId){
                      const userIdArrayList = (<FormArray>this.form.get('popupstudent')).value;
                      var arrayIndex = Object.keys(userIdArrayList).find(key => userIdArrayList[key] === userId);
                    console.log(arrayIndex)
                    delete (<FormArray>this.form.get('popupstudent')).value[arrayIndex];
                    
                  }
              }

          }
          
          for(let ind in this.sectionlist){
              for(let index in this.sectionlist[ind].assignStudent){
                  if(this.sectionlist[ind].assignStudent[index].parent_userId == userId){
                      const userIdArrayList = (<FormArray>this.form.get('popupparent')).value;
                      var arrayIndex = Object.keys(userIdArrayList).find(key => userIdArrayList[key] === userId);
                    console.log(arrayIndex)
                    delete (<FormArray>this.form.get('popupparent')).value[arrayIndex];
                    
                  }
              }

          }
         

          for(let ind in this.admindata){
              if(userId == this.admindata[ind].user_id){
                  (<FormArray>this.form.get("admincheckBox")).controls[ind].setValue(false);
              }
          }

          for(let ind in this.teacherList){
              if(userId == this.teacherList[ind].user_id){
                  (<FormArray>this.form.get("teachercheckBox")).controls[ind].setValue(false);
              }
          }

          for(let ind in this.classTeacherList){
              if(userId == this.classTeacherList[ind].user_id){
                  (<FormArray>this.form.get("classteachercheckBox")).controls[ind].setValue(false);
              }
          }
            for(let ind in this.username){
               if(this.username[ind].user_id == userId){
                   this.username.splice(ind,1);
               }
            }

       this.searchData['name'] = this.username;
       this.searchData['date'] = this.dateFilter;


       this.search.emit(this.searchData);



     }
  }

  okfun(){

    this.username = [];
     // if(this.globalObj.popupFlag == 'Staff'){
       // this.username = [];
        const staffChek = this.form.get('staffcheckBox').value;
        for(let key in staffChek){
        if(staffChek[key] == true){
           this.username.push({
                name: this.staffList[key].name,
                user_id: this.staffList[key].userId
              });
        }
      }
    //   this.search.emit(this.username);
   // }

   // if(this.globalObj.popupFlag == 'Admin'){
        //this.username = [];
        const adminChek = this.form.get('admincheckBox').value;
        for(let key in adminChek){
        if(adminChek[key] == true){
           this.username.push({
                name: this.admindata[key].name,
                user_id: this.admindata[key].user_id
              });
        }
      }
     //  this.search.emit(this.username);
  //  }

    if(this.globalObj.popupFlag == 'Student'){
     // this.username = [];
      const studentSelect = this.form.get('popupstudent').value;
     for(let key in studentSelect){
        for(let ind in this.sectionlist){
          for(let index in this.sectionlist[ind].assignStudent){
            if(studentSelect[key] == this.sectionlist[ind].assignStudent[index].user_id){
                this.username.push({
                  name: this.sectionlist[ind].assignStudent[index].student_name,
                  user_id: studentSelect[key]
                });
            }
          }
        }
      }
    //  this.search.emit(this.username);
    }

    if(this.globalObj.popupFlag == 'Parent'){
    //  this.username = [];
      const studentSelect = this.form.get('popupparent').value;

     for(let key in studentSelect){
        for(let ind in this.sectionlist){
          for(let index in this.sectionlist[ind].assignStudent){
            if(studentSelect[key] == this.sectionlist[ind].assignStudent[index].user_id){
                this.username.push({
                  name: this.sectionlist[ind].assignStudent[index].student_name+ "( P)",
                  user_id: this.sectionlist[ind].assignStudent[index].parent_userId
                });
            }
          }
        }
      }
     
    }


        const teacherChek = this.form.get('teachercheckBox').value;
        for(let key in teacherChek){
        if(teacherChek[key] == true){
           this.username.push({
                name: this.teacherList[key].name,
                user_id: this.teacherList[key].user_id
              });
        }
      }

        const classteacherChek = this.form.get('classteachercheckBox').value;
        for(let key in classteacherChek){
        if(classteacherChek[key] == true){
           this.username.push({
                name: this.classTeacherList[key].name,
                user_id: this.classTeacherList[key].user_id
              });
        }
      }





      if(this.torange == null || this.torange == undefined || this.torange== ''){

          this.torange = this.fromrange;


       }



       if(this.fromrange){
           this.dateFilter.push({
                fromdate: this.fromrange,
                todate: this.torange,
                flag:"date"
              });


       }
       this.searchData['name'] = this.username;
       this.searchData['date'] = this.dateFilter;


       this.search.emit(this.searchData);

  }

  activestatus(getflag){

    this.globalObj.popupFlag = getflag;
    
    if(getflag == 'Parent'){
          this.form.patchValue({popupstudent:[]});
    }else if(getflag == 'Student'){
        this.form.patchValue({popupparent:[]});
    }

  }

  adminchange(admin:string, isChecked: boolean, type, index){
    this.emailFormArray = '';
    if(type == 'Admin'){
        this.emailFormArray = <FormArray>this.form.controls.admincheck;
    }else if(type == 'Staff'){
      this.emailFormArray = <FormArray>this.form.controls.staffcheck;
    }else if(type == 'Group'){
      this.emailFormArray = <FormArray>this.form.controls.groupusercheck;
    }else if(type == 'classteacher'){
      this.emailFormArray = <FormArray>this.form.controls.classtechcheck;
    }else if(type == 'teacher'){
      this.emailFormArray = <FormArray>this.form.controls.techcheck;
    }

      if(isChecked) {
        this.emailFormArray.push(new FormControl(admin));
      } else {
        let index = this.emailFormArray.controls.findIndex(x => x.value == admin)
        this.emailFormArray.removeAt(index);
      }

  }

onSubmit(t,k){

}

getparentpopsec(){
    this.studentlist = [];
      let selectSecArr = this.form.get('popupparentsection').value;
      for(let key in selectSecArr){
        for(let ind in this.sectionlist){
          if(selectSecArr[key] == this.sectionlist[ind].section_id){
            for(let ky in this.sectionlist[ind].assignStudent){
                this.studentlist.push({
                  user_id: this.sectionlist[ind].assignStudent[ky].user_id,
                  name: this.sectionlist[ind].assignStudent[ky].student_name,
                  admission_no: this.sectionlist[ind].assignStudent[ky].admission_no
                });
            }
          }
        }
      }

  }
  
  closeSearch(){
      this.fromrange= '';
      this.torange= '';
      this.fromDate='';
      this.toDate='';
  }

}
