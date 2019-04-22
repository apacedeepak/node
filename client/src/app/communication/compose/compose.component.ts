import { falseIfMissing } from 'protractor/built/util';
import { OnChange } from 'ngx-bootstrap';
import { Component, OnInit, OnChanges, AfterContentInit } from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import {NgForm} from '@angular/forms';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.css'],
  host: {
    "(document:keyup)": "changeOccur($event)",
    "(document:change)": "changeOccur($event)"
  }
})

export class ComposeComponent implements OnInit ,AfterContentInit {




  form: FormGroup;
  public globalObj: any = {};
  public admindata: any;
  public sectionlist: any;
  public sectionlists: any;
  public studentlists: any = [];
  public teacherList: any = [];
  public student_list: any = [];
   public classTeacherList: any = [];
  public staffList: any;
  public replyReceipent: any;
  public studentlist: any = [];
  public studentname: any = [];
  public parentArr: any = [];
  public subjectlist: any = [];
  public group_list: any = [];
  public user_list: any = [];
  public subFlag: boolean = false;
  public groupFlag: boolean = false;
  public isImage: boolean = false;
  public groupUserFlag: boolean = false;
  public emailFormArray: any = '';
  public filelist : Array<any> = new Array<any>();
  public fileimage : Array<any> = new Array<any>();
  public inputFileModel: Array<any> = new Array<any>();
  public htmlContent : any = '';
  public responseMessage : boolean = false;
  public fileName : any = [];
  public fileNameOnly : any = [];
  public fileNameIcon : any = [];
  public showMessage : any = '';
  public userid : any = '';
  public groupid : any ='';
  public token : any = '';
  public selectedsubject : any  = '';
  public grpdetail : any = '';
  public selectedgroupname : any = '';
  public selectedsection : any = '';
  public selectedstudent : any = '';
  public otherMode : any = [];
  public studentUserId : any = [];
  mylang:any=''; 
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }

  constructor(private myService: BackendApiService, private http: HttpClient,private route: ActivatedRoute,
     private fb: FormBuilder, private activatedRoute: ActivatedRoute,private translate: TranslateService) {
          this.activatedRoute.queryParams.subscribe(params => {
              this.globalObj.flag = params['flag'];
              this.globalObj.msgId = params['mesgeId'];
              this.globalObj.place = params['place'];
              this.globalObj.groupid = params['groupid'];
              this.globalObj.classRecordUserId = params['id'];
          });
          this.globalObj.domainName = this.myService.constant.domainName;
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
    this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
    this.globalObj.sessionId = window.localStorage.getItem('session_id');
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    const productType = window.localStorage.getItem('product_type');
    this.globalObj.product_type = productType.toLowerCase();
   this.token = window.localStorage.getItem('token');
   
    this.globalObj.numberOfAttach = 5;

    this.form = this.fb.group({
      popupparentsection: [[''], Validators.required],
      popupparentstudent: [[''], Validators.required],
      popupparentuserid: [[''], Validators.required],
      popupparentstudsection: [[''], Validators.required],
      htmlContent: new FormControl(),
      loadimage: new FormControl([]),
      subject: new FormControl(),
      subjectradiobutton: new FormControl(),
      sectionradiobutton: new FormControl(),
      admincheck: this.fb.array([]),
      admincheckBox: this.fb.array([]),
      othercheckBox: this.fb.array([]),
      staffcheck: this.fb.array([]),
      groupusercheck: this.fb.array([]),
      otherusercheck: this.fb.array([]),
      staffcheckBox: this.fb.array([]),
      groupuserschechbox: this.fb.array([]),
      groupnamecheckbox: this.fb.array([]),
      isStudentCheck: false,
      techcheck: this.fb.array([]),
      classtechcheck: this.fb.array([]),
      classteachercheckBox: this.fb.array([]),
      teachercheckBox: this.fb.array([]),
    
    })

    this.globalObj.firstCallFlag = true;
    this.globalObj.grouplistflag = 0;

      let params = {
        user_id: this.globalObj.user_id,
        user_type: this.globalObj.user_type,
        school_id:this.globalObj.school_id,
        token: this.token,
        session_id: this.globalObj.sessionId
      };
    	if(this.globalObj.user_type == "Parent"){
    		params.user_id = this.globalObj.student_user_id;
    		params.user_type = "Student";
    	}else{
    		params.user_id = this.globalObj.user_id;
    		params.user_type = this.globalObj.user_type;
            }
            
            let paramer = {
                user_type : "Other"
            };
            
            this.http.post(this.myService.constant.apiURL+"users/userswhoseroleother", paramer).subscribe(data => {
                 const details: any = data;
                 this.otherMode = details.response;
                 for(let key in this.otherMode){
                     const controlOther = new FormControl(false);
                     (<FormArray>this.form.get('othercheckBox')).push(controlOther);
                 }
            });

    this.http.post(this.myService.constant.apiURL+"communication/getcomposepopdata", params).subscribe(data => {
        const details: any = data;
        this.admindata = details.response[0].admin;
        this.sectionlist = details.response[0].assignClass;
        this.sectionlists = details.response[0].assignClass;
        const teacherList = details.response[0].assignteachers;


  if(this.globalObj.groupid != '' && this.globalObj.groupid  != null && this.globalObj.groupid != undefined){
        this.activestatus("Group");
          const params = {
                "user_id": this.globalObj.user_id,
              "token": this.token,
              "group_id":this.globalObj.groupid ,
              "user_type":"student"
            };
   this.http.post(this.myService.constant.apiURL + "groups/groupidbydetail", params).subscribe(details => {
    this.grpdetail = details;
      this.selectedsubject = this.grpdetail.response.belgons_to_subject;
      this.selectedgroupname = this.grpdetail.response.groupdata;
      this.selectedsection = this.grpdetail.response.belgons_to_section;
      this.selectedstudent = this.grpdetail.response.data;
      this.getAssignSubject(this.selectedsection.id,'')
   });
}



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

         this.http.post(this.myService.constant.apiURL+"staffs/stafflistbyschoolid", params).subscribe(data => {
           const details: any = data;
           this.staffList = details.response;
            for(let key in this.staffList){
             const control1 = new FormControl(false);
             (<FormArray>this.form.get('staffcheckBox')).push(control1);
            }
            
            if(this.globalObj.flag == 'classrecord'){ 
                for(let ind in this.sectionlist){
                    for(let index in this.sectionlist[ind].assignStudent){
                      if(this.globalObj.classRecordUserId == this.sectionlist[ind].assignStudent[index].user_id){
                          this.studentname.push({
                            name: this.sectionlist[ind].assignStudent[index].student_name+ ' (P)',
                            user_id: this.sectionlist[ind].assignStudent[index].parent_userId,
                            flag: "parent",
                          });
                          this.studentUserId.push(this.sectionlist[ind].assignStudent[index].user_id);
//                          (<FormArray>this.form.get("popupparentstudent")).controls[ind].setValue(this.globalObj.classRecordUserId);
                      }
                    }
                  }
            }


        if(this.globalObj.flag == 'reply' || this.globalObj.flag == 'draft'){


            const param = {
              user_id: this.globalObj.user_id,
              user_type: this.globalObj.user_type,
              place: this.globalObj.place,
              message_id: this.globalObj.msgId,
              token: this.token,
              search_id: [],
              student_user_id: this.globalObj.student_user_id
            };


          this.http.post(this.myService.constant.apiURL+"communication/communication", param).subscribe(data => {
                const details: any = data;
                let showdata:any;
                if(this.globalObj.place.toLowerCase() == "inbox"){
                  showdata = details.response.inbox[0];
                }else if(this.globalObj.place.toLowerCase() == "sent"){
                  showdata = details.response.sent[0];
                }else if(this.globalObj.place.toLowerCase() == "draft"){
                  showdata = details.response.draft[0];
                }else if(this.globalObj.place.toLowerCase() == "archived"){
                  showdata = details.response.archived[0];
                }



                if(this.globalObj.flag == 'reply') {
             
                   this.replyReceipent = showdata.display_id;
                   
                }else if(this.globalObj.flag == 'draft'){
                  let listattc = [];
                  this.form.patchValue({htmlContent: showdata.message_body, subject: showdata.message_subject});
                  
                    if(showdata.attachments.length > 0){
                        this.globalObj.numberOfAttach = 5 - showdata.attachments.length;
                    this.isImage = true;
                  let attachmentArray = [];
                  for(let img in showdata.attachments){
                    this.fileName.push(showdata.attachments[img])
                   // this.fileNameIcon
                   const fileExten = showdata.attachments[img].split(".");
                   const onlyFileName = showdata.attachments[img].split("~");
                   this.fileNameOnly.push(onlyFileName[1]);
                   let tempObj = {preview:this.globalObj.domainName+showdata.attachments[img]};
                   attachmentArray.push(tempObj);
                                     
                    const fileExtindex = fileExten.length - 1;
                    if(fileExten[fileExtindex].toLowerCase() == 'pdf'){

                      this.fileNameIcon.push('assets/images/pdf-type.png');

                    }else if(fileExten[fileExtindex].toLowerCase() == 'doc' ||
                        fileExten[fileExtindex].toLowerCase() == 'docx'){

                      this.fileNameIcon.push('assets/images/doc-type.png');

                    }else if(fileExten[fileExtindex].toLowerCase() == 'xls' ||
                              fileExten[fileExtindex].toLowerCase() == 'xlsx'){

                        this.fileNameIcon.push('assets/images/excel-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'ppt' ||
                            fileExten[fileExtindex].toLowerCase() == 'pptx'){

                        this.fileNameIcon.push('assets/images/ppt-type.png');

                      }else{

                      this.fileNameIcon.push('assets/images/image-type.png');

                    }
                  }
                  this.form.patchValue({loadimage:attachmentArray});
                  }




                  if(showdata.display_id != undefined && showdata.display_id != null && showdata.display_id != ''){
                    this.studentname = [];
                    this.replyReceipent = showdata.display_id.split(",");
               
                    for(let key in this.replyReceipent){ 
                        if(this.globalObj.user_type.toLowerCase() == 'student' || this.globalObj.user_type.toLowerCase() == 'parent'){
                                    for(let ind in this.teacherList){

                                if(this.replyReceipent[key] == this.teacherList[ind].user_id){

                                    this.studentname.push({
                                      name: this.teacherList[ind].name,
                                      user_id: this.replyReceipent[key]
                                    });
                                   (<FormArray>this.form.get("teachercheckBox")).controls[ind].setValue(true);
                                }
                              }


                               for(let ind in this.classTeacherList){

                                if(this.replyReceipent[key] == this.classTeacherList[ind].user_id){

                                    this.studentname.push({
                                      name: this.classTeacherList[ind].name,
                                      user_id: this.replyReceipent[key]
                                    });
                                   (<FormArray>this.form.get("classteachercheckBox")).controls[ind].setValue(true);
                                }
                              }
                        }else{
                            for(let ind in this.sectionlist){
                              for(let index in this.sectionlist[ind].assignStudent){
                                if(this.replyReceipent[key] == this.sectionlist[ind].assignStudent[index].user_id){
                                    this.studentname.push({
                                      name: this.sectionlist[ind].assignStudent[index].student_name,
                                      user_id: this.replyReceipent[key],
                                      flag: 'student'
                                    });
                                    this.studentUserId.push('');
//         
                                }else if(this.replyReceipent[key] == this.sectionlist[ind].assignStudent[index].parent_userId){
                                    this.studentname.push({
                                      name: this.sectionlist[ind].assignStudent[index].student_name + " (P)",
                                      user_id: this.replyReceipent[key],
                                      flag: 'parent'
                                    });
                                       this.studentUserId.push(this.sectionlist[ind].assignStudent[index].user_id);
                                }
                              }
                            }
                            
                            for(let ind in this.staffList){

                                    if(this.replyReceipent[key] == this.staffList[ind].userId){

                                        this.studentname.push({
                                          name: this.staffList[ind].name,
                                          user_id: this.replyReceipent[key],
                                          flag: 'staff'
                                        });
                                        this.studentUserId.push('');
                                       (<FormArray>this.form.get("staffcheckBox")).controls[ind].setValue(true);
                                    }
                                  }
                        }
                        
                      
                      
                      

                      for(let ind in this.admindata){
                         if(this.replyReceipent[key] == this.admindata[ind].user_id){

                            this.studentname.push({
                              name: this.admindata[ind].name,
                              user_id: this.replyReceipent[key],
                              flag: 'admin'
                            });
                            this.studentUserId.push('');
                           (<FormArray>this.form.get("admincheckBox")).controls[ind].setValue(true);
                        }
                      }


                        
                            
                        }
                  }
                  //this.form.patchValue({htmlContent: showdata.message_body, subject: showdata.message_subject});
                }
                this.globalObj.displayname = showdata.display_name;


                const str = "<br><br>----------------------------------------------------------------------<br>"+
                  "from "+showdata.display_name.toString()+'<br>'+
             "Send on  "+showdata.message_date+'<br>'+
                    // "To "+showdata.display_name.toString()+'<br>'+
                    showdata.message_body;

               if(this.globalObj.flag == 'reply'){
                    if(showdata.student_user_id && showdata.student_user_id != 0){
                            this.studentUserId.push(showdata.student_user_id);
                    }
                   
                   
                  this.form.patchValue({htmlContent: str, subject: "Re: "+showdata.message_subject});
              }


          });
        }


    });
  });



  }

  getparentpopsec(type){
    this.studentlist = [];
    this.studentlists = [];
    if(type == 'student'){ 
        
        this.form.patchValue({popupparentstudsection: []});
        this.form.patchValue({popupparentuserid: []});
       
      let selectSecArr = this.form.get('popupparentsection').value;
      for(let key in selectSecArr){
        for(let ind in this.sectionlists){
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
    }else if(type == 'parent'){
    this.form.patchValue({popupparentsection: []});
    this.form.patchValue({popupparentstudent: []});
        let selectSecArrs = this.form.get('popupparentstudsection').value;
        
      for(let key in selectSecArrs){
        for(let ind in this.sectionlist){
          if(selectSecArrs[key] == this.sectionlist[ind].section_id){
            for(let ky in this.sectionlist[ind].assignStudent){
                this.studentlists.push({
                  user_id: this.sectionlist[ind].assignStudent[ky].user_id,
                  name: this.sectionlist[ind].assignStudent[ky].student_name,
                  admission_no: this.sectionlist[ind].assignStudent[ky].admission_no,
                  parent_userId: this.sectionlist[ind].assignStudent[ky].parent_userId
                });
            }
          }
        }
      }
    }

  }

  activestatus(getflag){
    console.log(getflag)
    this.globalObj.popupFlag = getflag;
  }

  getsectioid(getSecId){
  }

  adminchange(admin:string, isChecked: boolean, type, index){ 
    this.emailFormArray = '';
    if(type == 'Admin'){
        this.emailFormArray = <FormArray>this.form.controls.admincheck;
    }else if(type == 'Staff'){
      this.emailFormArray = <FormArray>this.form.controls.staffcheck;
    }else if(type == 'Group'){
      this.emailFormArray = <FormArray>this.form.controls.groupusercheck;
    }else if(type == 'Other'){
      this.emailFormArray = <FormArray>this.form.controls.otherusercheck;
    }

      if(isChecked) {
        this.emailFormArray.push(new FormControl(admin));
      } else {
        let index = this.emailFormArray.controls.findIndex(x => x.value == admin)
        this.emailFormArray.removeAt(index);
      }

  }

  removeAllFile(type){
    this.filelist = [];
    this.fileName = [];
    this.fileimage = [];
    this.fileNameIcon = [];
    this.inputFileModel = [];
    this.fileNameOnly = [];
    this.globalObj.numberOfAttach = 5;        
   if(type == true){
      this.isImage =  false;
    }else{
       this.isImage = true;
    }
  }

  onAccept(file: any) {
      
      if(this.fileNameOnly.indexOf(file.file.name) >= 0){
          return false;
      }
      
  let checkflag = false;
  this.isImage = true;
 // this.fileimage = [];
  if(this.filelist.length >= 0)
    {
          

    for (var i in this.filelist) {
              if(this.filelist[i].file.name==file.file.name)
                {
                  checkflag = true;
                  break;
                }
            }
              if(!checkflag)
                {
                   this.filelist.push(file);
                   
          
                   const fileExten = file.file.name.split(".");
                    const fileExtindex = fileExten.length - 1;
                    if(fileExten[fileExtindex].toLowerCase() == 'pdf'){

                        this.fileimage.push('assets/images/pdf-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'doc' ||
                          fileExten[fileExtindex].toLowerCase() == 'docx'){

                        this.fileimage.push('assets/images/doc-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'xls' ||
                              fileExten[fileExtindex].toLowerCase() == 'xlsx'){

                        this.fileimage.push('assets/images/excel-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'ppt'||
                           fileExten[fileExtindex].toLowerCase() == 'pptx'){

                        this.fileimage.push('assets/images/ppt-type.png');

                      }else{

                        this.fileimage.push('assets/images/image-type.png');

                      }

                }
    }

}

removeFile(index, type){
  if(type == 'draft'){
    this.fileName.splice(index,1);
    this.fileNameIcon.splice(index,1);
    this.globalObj.numberOfAttach = this.globalObj.numberOfAttach + 1;
    this.fileNameOnly.splice(index,1);
  }else{
    this.filelist.splice(index,1);
    this.fileimage.splice(index,1);
    this.inputFileModel.splice(index,1);
  }
  if(this.fileName.length == 0 && this.filelist.length == 0){
      this.isImage = false;
  }

}

onRemove(file: any): void {

    let counter = 0;;

  if(this.filelist.length>0)
    {
    for (var i in this.filelist) { 
              if(this.filelist[i].file.name==file.file.name)
                {
                  this.filelist.splice(counter,1);
                  this.fileimage.splice(counter,1);

                }
                counter++;
            }

    }



}


getAssignSubject(sectionId,index){ 
      this.subFlag = false;
      this.groupFlag = false;
      this.groupUserFlag = false;
      
         for(let key in this.user_list){
                      this.user_list[key]='';
                        this.studentname.push="";
            }
      this.form.controls['groupuserschechbox'] = new FormArray([]);
      
     const params = {
      "user_id": this.globalObj.user_id,
      "session_id": this.globalObj.sessionId,
      "section_id":sectionId,
      "token": this.token

    };

    this.form.get('sectionradiobutton').setValue(sectionId);


    this.globalObj.groupsection = sectionId;

    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

      const subjectlist: any = details;

      if (subjectlist.response_status.status == '200') {
        this.subjectlist = subjectlist.response.assigned_subjects;
        this.subFlag = true;
        this.getAssignGroup(this.selectedsubject.id);
        this.globalObj.grouplistflag = 0;
       }
    });
  //});
  }

  getAssignGroup(subjectId){ 
    this.user_list = [];
     this.groupFlag = false;
      this.groupUserFlag = false;
        let blankGroupName = this.form.get('groupnamecheckbox').value;
        let blankUserName = this.form.get('groupuserschechbox').value;
        
        for(let key in blankGroupName){
          (<FormArray>this.form.get('groupnamecheckbox')).removeAt(0);
        }
        for(let key in blankUserName){
          (<FormArray>this.form.get('groupuserschechbox')).removeAt(0);
          (<FormArray>this.form.get('groupusercheck')).removeAt(0);
        }
        
            for(let key in this.user_list){
                      this.user_list[key]='';
                        this.studentname.push="";
                      // this.studentname = '';
            }

       const params = {

      "session_id": this.globalObj.sessionId,
      "section_id":this.globalObj.groupsection,
      "subject_id":subjectId,
      "user_id":this.globalObj.user_id,
      "token": this.token

    };
  this.form.get('subjectradiobutton').setValue(subjectId);

    this.globalObj.groupsubjectId = subjectId;

      this.http.post(this.myService.constant.apiURL + "groups/assignedgroups", params).subscribe(details => {

       const group_list: any = details;
      if (group_list.response.status == '200') {
        this.group_list = group_list.response.data;
        if(this.group_list.length == 0){
            this.globalObj.grouplistflag = 1;
            setTimeout(()=>{
              this.globalObj.grouplistflag = 0;
            },2000);
        }else{
            this.globalObj.grouplistflag = 0;
        }
         if(this.globalObj.groupid != '' && this.globalObj.groupid  != null && this.globalObj.groupid != undefined && this.globalObj.firstCallFlag == true){
          
          for(let key1 in this.group_list){
             if(this.group_list[key1].id == this.selectedgroupname.groupid){
              if(this.globalObj.firstCallFlag){
                this.getAssignStudToGroup(this.group_list[key1].id,undefined, undefined);
                
              }
            const control4 = new FormControl(true);
              (<FormArray>this.form.get('groupnamecheckbox')).push(control4);
               this.groupFlag = true;
                }else{
                  const control4 = new FormControl(false);
                  (<FormArray>this.form.get('groupnamecheckbox')).push(control4);
                }
            }
          
            }else{
              if(this.globalObj.groupid){
                  this.selectedgroupname.groupid = '';
              }
              for(let key in this.group_list){
                    const control4 = new FormControl(false);
                    (<FormArray>this.form.get('groupnamecheckbox')).push(control4);
                  }
            }
        this.groupFlag = true;
      }
    });
  }

  getAssignStudToGroup(groupId, index, event){ 
    
      const params = {
      "group_id": groupId,
      "user_type": 'Student',
      "token": this.token
    };

      this.http.post(this.myService.constant.apiURL + "groups/assignedgroupbyid", params).subscribe(details => {
       const user_list: any = details;
       const getUserList = user_list.response;
       this.groupUserFlag = true;

   if(this.globalObj.groupid != '' && this.globalObj.groupid  != null && this.globalObj.groupid != undefined  && this.globalObj.firstCallFlag == true){ 
       
       
         this.globalObj.firstCallFlag = false;
    if(this.subFlag && this.groupFlag){ 
              for(let key in this.selectedstudent){
                if(this.selectedstudent[key].chkflag != undefined && this.selectedstudent[key].chkflag == true){ 
                  this.user_list.push({
                    userName: this.selectedstudent[key].student_name,
                    userId: this.selectedstudent[key].user_id,
                    groupId: this.globalObj.groupid,
                    });
                  this.adminchange(this.selectedstudent[key].user_id,true,'Group','');
                  const control3 = new FormControl(true);
                (<FormArray>this.form.get('groupuserschechbox')).push(control3);
                this.studentname.push({
                  name: this.selectedstudent[key].student_name,
                  user_id: this.selectedstudent[key].user_id
                });
                }
              }
             }
            }else{
       if(this.subFlag && this.groupFlag){
           
          if((<FormArray>this.form.get('groupnamecheckbox')).controls[index].value == true){ 

              
            for(let key in getUserList){
              this.user_list.push({
                userName: getUserList[key].userName,
                userId: getUserList[key].userId,
                groupId: groupId
              });
              
            const control3 = new FormControl(true);
            (<FormArray>this.form.get('groupuserschechbox')).push(control3);
            this.adminchange(getUserList[key].userId, true, "Group", key);
            }
          }else{
          
            let arrLen = this.user_list.length;
            for(let key in this.user_list){
                  if(this.user_list[key].groupId == groupId){
                      this.user_list[key]='';
                  }
            }

          }

       }
      }


    });
  }


okfun(){
      if(this.globalObj.flag != 'draft'){
          this.studentname = [];
          if(this.globalObj.flag != 'classrecord'){
                this.studentUserId = [];
          }
      }

      const staffChek = this.form.get('staffcheck').value;
      const adminChek = this.form.get('admincheck').value;
      const studentSelect = this.form.get('popupparentstudent').value;
      const parentSelect = this.form.get('popupparentuserid').value;
      const groupSelect = this.form.get('groupusercheck').value;
      const otherSelect = this.form.get('otherusercheck').value;
 
      
      for(let key in otherSelect){
          for(let ind in this.otherMode){
              if(otherSelect[key] == this.otherMode[ind].id){
                  this.studentname.push({
                        name: this.otherMode[ind].other_user_registration.name,
                        user_id: otherSelect[key],
                        flag: "other",
                  });
                  this.studentUserId.push(otherSelect[key]);
              }
          }
      }
      console.log(this.user_list)
      for(let key in groupSelect){
        for(let ind in this.user_list){
          if(groupSelect[key] == this.user_list[ind].userId){
            this.studentname.push({
                name: this.user_list[ind].userName,
                user_id: this.user_list[ind].userId,
                flag: "group",
            });
            this.studentUserId.push(this.user_list[ind].userId);
          }
        }
      }

      for(let key in staffChek){
        for(let ind in this.staffList){
          if(staffChek[key] == this.staffList[ind].userId){

              this.studentname.push({
                name: this.staffList[ind].name,
                user_id: staffChek[key],
                flag: "staff",
              });
              this.studentUserId.push(staffChek[key]);
          }
        }
      }

      for(let key in adminChek){
        for(let ind in this.admindata){
          if(adminChek[key] == this.admindata[ind].user_id){

              this.studentname.push({
                name: this.admindata[ind].name,
                user_id: adminChek[key],
                flag: "admin",
              });
              this.studentUserId.push(adminChek[key]);
          }
        }
      }

      for(let key in studentSelect){
        for(let ind in this.sectionlist){
          for(let index in this.sectionlist[ind].assignStudent){
            if(studentSelect[key] == this.sectionlist[ind].assignStudent[index].user_id){
                var result = this.studentname.map(a => a.user_id);
                if(result.indexOf(studentSelect[key]) == -1){
                    this.studentname.push({
                      name: this.sectionlist[ind].assignStudent[index].student_name,
                      user_id: studentSelect[key],
                      flag: "student",
                    });
                    this.studentUserId.push(studentSelect[key]);
                }
            }
          }
        }
      }


      for(let key in parentSelect){
        for(let ind in this.sectionlist){
          for(let index in this.sectionlist[ind].assignStudent){

            if(parentSelect[key] == this.sectionlist[ind].assignStudent[index].user_id){
                var result = this.studentname.map(a => a.user_id);
                if(result.indexOf(studentSelect[key]) == -1){
                    this.studentname.push({
                      name: this.sectionlist[ind].assignStudent[index].student_name + " (P)",
                      user_id: this.sectionlist[ind].assignStudent[index].parent_userId,
                      flag: "parent",
                    });
                    this.studentUserId.push(this.sectionlist[ind].assignStudent[index].user_id);
                }
            }
          }
        }
      }


  }

  removefun(userId){
      for(let key in this.studentname){
            if(this.studentname[key].user_id == userId){
                this.studentname.splice(key, 1);
                this.studentUserId.splice(key, 1);
            }
      }


      for(let ind in this.admindata){
          if(userId == this.admindata[ind].user_id){
                (<FormArray>this.form.get("admincheckBox")).controls[ind].setValue(false);
                let index = (<FormArray>this.form.get('admincheck')).controls.findIndex(x => x.value == userId);
               (<FormArray>this.form.get('admincheck')).removeAt(index);
          }
        }
        
      for(let ind in this.otherMode){
          if(userId == this.otherMode[ind].id){
                (<FormArray>this.form.get("othercheckBox")).controls[ind].setValue(false);
                let index = (<FormArray>this.form.get('otherusercheck')).controls.findIndex(x => x.value == userId);
               (<FormArray>this.form.get('otherusercheck')).removeAt(index);
          }
        }

        for(let ind in this.staffList){
          if(userId == this.staffList[ind].userId){
                (<FormArray>this.form.get("staffcheckBox")).controls[ind].setValue(false);
              let index = (<FormArray>this.form.get('staffcheck')).controls.findIndex(x => x.value == userId);
               (<FormArray>this.form.get('staffcheck')).removeAt(index);

          }
        }
        for(let ind in this.user_list){
          if(userId == this.user_list[ind].userId){
              (<FormArray>this.form.get("groupuserschechbox")).controls[ind].setValue(false);
              let index = (<FormArray>this.form.get('groupusercheck')).controls.findIndex(x => x.value == userId);
               (<FormArray>this.form.get('groupusercheck')).removeAt(index);
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

        let dele = this.form.get('popupparentstudent').value.indexOf(userId);
        this.form.get('popupparentstudent').value.splice(dele, 1);

        let delet = this.form.get('popupparentuserid').value.indexOf(userId);
        this.form.get('popupparentuserid').value.splice(delet, 1);
  }

  onSubmit(value, flag){
     
    let messageId = '';
    if(this.globalObj.draftId != '' && this.globalObj.draftId != undefined){
        messageId = this.globalObj.draftId;
    }
    var formData = new FormData();
    for (var i in this.filelist) {
          formData.append(i, this.filelist[i].file);
     }
    const recipientArr = [];

    if(this.globalObj.flag == 'reply'){
      recipientArr.push(this.replyReceipent);
    }

    for(let key in this.studentname){
        recipientArr.push(this.studentname[key].user_id);
    }

    if(value.isStudentCheck == true){
      for(let key in value.popupparentuserid){
         recipientArr.push(value.popupparentuserid[key]);
         }
    }

    const recipient = recipientArr.join(",");
    let types = 'message';
    messageId = this.globalObj.msgId;
   let  draftId = "";
    if(flag == 'draft'){
      types = 'draft';
      if(this.globalObj.msgId){
      draftId = this.globalObj.msgId;
      }
      
      if(!value.subject && !value.htmlContent && this.filelist.length == 0 && this.fileName == 0){
        this.showMessage = this.translate.instant("Nothing to save");
        this.responseMessage = true;
        return false;
      }
      var docDesc = '';
      
      if(value.htmlContent != null){
       docDesc = value.htmlContent.replace(/[<]br[^>]*[>]/gi,"");
      }
       
      if(!value.subject && !docDesc && this.filelist.length == 0 && this.fileName == 0){
        this.showMessage = this.translate.instant("Nothing to save");
        this.responseMessage = true;
        return false;
      }
    }


   if(messageId == undefined){
      messageId = '';
    }
    let draftFile = [];
    let draftFiles = "";

    if(this.fileName.length > 0){
        for(let key in this.fileName){
        const dfile = this.fileName[key].split("schoolerp/");
          draftFile.push(dfile[1]);
        }
        if(draftFile.length > 0){
          draftFiles = draftFile.join();
        }
    }
    
   
    for(let key in this.studentname){
            if(this.studentname[key].flag != 'parent'){
                this.studentUserId.splice(key, 1, '');
            }
      }
    
    
    
      if(value.subject == '' || value.subject == null){
        value.subject = ''
      }

     if(value.htmlContent == '' || value.htmlContent == null){
        value.htmlContent = ''
      }

      if(this.globalObj.flag == 'reply'){
        messageId = ''
      }
      if(this.globalObj.flag == 'reply' && flag == 'draft'){
        messageId = '';
        draftId = '';
      }
      
      if(recipientArr.length == 0 && flag == 'message' ){
          return false;
      }
      
      if(this.globalObj.user_type.toLowerCase() == 'parent'){
          this.studentUserId = [];
          this.studentUserId.push(this.globalObj.student_user_id);
      }
      
      
      
    formData.append("content", value.htmlContent);
    formData.append("receipient_id", recipient);
    formData.append("subject", value.subject);
    formData.append("message_type", types);
    formData.append("draft_id", draftId);
    formData.append("channel_name", "classsection"); //group,classsection
    formData.append("channel_id", "");
    formData.append("message_id", messageId);
    formData.append("user_id", this.globalObj.user_id);
    formData.append("school_id", this.globalObj.school_id);
    formData.append("file_list", draftFiles);
    formData.append("user_type", this.globalObj.user_type);
    formData.append("student_check", 'false');
    formData.append("token", this.token);
    formData.append("receipient_type", "admin");
    formData.append("student_user_id_flag", this.studentUserId);
    formData.append("post_by", "web");


      this.http.post(this.myService.constant.apiURL+"communication/compose", formData).subscribe(data => {
        const details: any = data;
         this.globalObj.draftId = '';
         if(details.status == '200'){
            if(flag == 'draft'){
              this.showMessage = this.translate.instant("Message draft successfully");
            }else{
              this.showMessage = this.translate.instant("Message sent successfully");
            }
            this.responseMessage = true;
        }

      });
  }

    changeOccur(){
        
    }


}
