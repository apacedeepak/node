import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm, FormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-createhomework',
  templateUrl: './createhomework.component.html',
  styleUrls: ['./createhomework.component.css']
})
export class CreatehomeworkComponent implements OnInit,AfterContentInit  {

  form: FormGroup;
  public sessionid: any;
  public userid: any;
  public token: any;
  public homeworklist: any;
  public classlist: any;
  public sectionlist: any;
  public subjectlist: any;
  public homeworkDetail: any;
  public subject_id: any;
  public class_id: any;
  public homework_class_name: any;
  public section_id: any;
  public target_date: any;
  public title: any;
  public class_sec_list: any;
  public group_list: any;
  public sendtolist: Array<any> = new Array<any>();
  public ishomeworkexist: any;
  public filelist: Array<any> = new Array<any>();
  public inputFileModel: Array<any> = new Array<any>();
  public inputFileMinimalModel: Array<any> = new Array<any>();
  public htmlContent: any;
  public subjectlabel: any;
  public isImage: boolean = false;
  public responseMessage: boolean = false;
  public popmessage: any = '';
  public targetdate: any;
  public minDate: any;
  public homework_class_id: any;
  public homework_section_id: any;
  public homework_subject_id: any;
  public homework_section_name: any;
  public fileimage: Array<any> = new Array<any>();
  public groupid: any = '';
  public schoolid: any = '';
  public selectedsubject: any = '';
  public grpdetail: any = '';
  public selectedgroupname: any = '';
  public selectedsection: any = '';
  public selectedstudent: any = '';
  public responseobj:any = '';
  public product_type : any = '';
  public class_name : any = '';
  public place : any = 'homework';
  mylang:any='';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }


  constructor(private http: HttpClient, private myService: BackendApiService, private fb: FormBuilder, private route: ActivatedRoute,private activatedRoute: ActivatedRoute,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
    if(this.mylang){
      translate.setDefaultLang( this.mylang);}
      else{
       translate.setDefaultLang( 'en');
      }
    var today = new Date();
    this.minDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  

      this.activatedRoute.queryParams.subscribe(params => {
              this.groupid = params['groupid'];
          });
  }

  ngOnInit() {
    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.homework_class_id = window.localStorage.getItem('homework_class_id');
    this.homework_class_name = window.localStorage.getItem('homework_class_name');
    this.homework_section_id = window.localStorage.getItem('homework_section_id');
    this.homework_subject_id = window.localStorage.getItem('homework_subject_id');
    this.homework_section_name = window.localStorage.getItem('homework_section_name');
    this.schoolid = window.localStorage.getItem('school_id');
     this.product_type = window.localStorage.getItem('product_type');

    this.ishomeworkexist = false;
    this.form = this.fb.group({

      groupscheckBox: this.fb.array([]),
      classseccheckBox: this.fb.array([]),
      htmlContent: new FormControl(),
      title: new FormControl(),
      targetdate: new FormControl(),

    })
    if (this.homework_class_id != null && this.homework_section_id == null && this.homework_subject_id == null && this.groupid == undefined) {


      this.setalldropdown(this.homework_class_id, undefined, undefined);
     
    }
    else if (this.homework_class_id != null && this.homework_section_id != null && this.homework_subject_id == null && this.groupid == undefined) {
      this.setalldropdown(this.homework_class_id, this.homework_section_id, undefined);
     

    }
    else if (this.homework_class_id != null && this.homework_section_id != null && this.homework_subject_id != null && this.groupid == undefined) {
      this.setalldropdown(this.homework_class_id, this.homework_section_id, this.homework_subject_id);
 
    }
    else if(this.groupid == undefined){
      this.getassignedclass();

    }

this.setgroupalldropdown();
  }

  getassignedclass() {


    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolid,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {

      this.classlist = details;
      if (this.classlist.response_status.status == '200') {
        this.classlist = this.classlist.response.assigned_classes;
      }


    });
    //});
  }
  getassignedsection(val) {
    this.subjectlabel = '';
    this.sendtolist = [];
    this.class_sec_list = [];
    this.group_list = [];
    this.class_id = val;
    if (val != '') {
      const params = {
        "user_id": this.userid,
        "session_id": this.sessionid,
        "class_id": val,
        "token": this.token

      };
       for(let key in this.classlist)
          {
            if(this.classlist[key].class_id==val)
              {
                this.class_name = this.classlist[key].class_name;
                window.localStorage.setItem('homework_class_name',this.class_name);
              }
          }
      window.localStorage.setItem('homework_class_id', val);
      window.localStorage.removeItem('homework_section_id');
      window.localStorage.removeItem('homework_section_name');
      window.localStorage.removeItem('homework_subject_id');
      //this.myService.checkToken().then((token) =>{
      this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

        this.sectionlist = details;
        if (this.sectionlist.response_status.status == '200') {

          this.sectionlist = this.sectionlist.response.assigned_sections;

          this.subjectlist = [];

        }



      });
      //});
    }
    else {
      window.localStorage.removeItem('homework_class_id');
      window.localStorage.removeItem('homework_section_id');
      window.localStorage.removeItem('homework_section_name');
      window.localStorage.removeItem('homework_subject_id');

      this.sectionlist = [];
      this.subjectlist = [];
      this.section_id = '';
      this.subject_id = '';

    }
  }

  getassignedsubject(val, labelval) {
    this.sendtolist = [];
    this.section_id = val;
    this.class_sec_list = [];
    this.subject_id = '';
    if (val != '') {

      if (labelval != undefined) {
        this.subjectlabel = labelval[labelval.selectedIndex].label;
        window.localStorage.setItem('homework_section_name', this.subjectlabel);

      }
      //    else if(labelval==undefined && this.homework_section_name!=null  && this.homework_section_name!='')
      //   {
      // window.localStorage.setItem('homework_section_name', this.homework_section_name);
      // this.subjectlabel = this.homework_section_name;
      //   }
      const params = {
        "user_id": this.userid,
        "session_id": this.sessionid,
        "section_id": val,
        "token": this.token

      };
      window.localStorage.setItem('homework_section_id', val);
      window.localStorage.removeItem('homework_subject_id');
      //this.myService.checkToken().then((token) =>{
      this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

        this.subjectlist = details;
        if (this.subjectlist.response_status.status == '200') {

          this.subjectlist = this.subjectlist.response.assigned_subjects;



        }



      });
      //});
    }
    else {
      window.localStorage.removeItem('homework_section_id');
      window.localStorage.removeItem('homework_section_name');
      window.localStorage.removeItem('homework_subject_id');
      this.subjectlist = [];
      this.class_sec_list = [];
      this.group_list = [];
      this.subjectlabel = '';
      this.subject_id = '';

    }
  }

  getassignedclasssecandgroup(val) {
    this.subject_id = val;
    this.sendtolist = [];
    if (val != '') {
      if(this.groupid == undefined){
      window.localStorage.setItem('homework_subject_id', val);
      }
      const param = {
        "session_id": this.sessionid,
        "section_id": this.section_id,
        "user_type": 'student',
        "subject_id": this.subject_id,
        "token": this.token
      };
      this.http.post(this.myService.constant.apiURL + "user_subjects/subjectwiseusers", param).subscribe(details => {
        this.responseobj = details;
        
        if (this.responseobj.response.length == 0) {
          this.sendtolist = [];
         
          alert(this.translate.instant('no_student_assign_class_section_subject'));
          return false;
        }
        else {
          const params = {
            "user_id": this.userid,
            "session_id": this.sessionid,
            "class_id": this.class_id,
            "subject_id": val,
            "token": this.token

          };

          this.sendtolist.push({ 'type': 'classsec', 'unique_id': this.section_id, 'value': this.class_name + '-' + this.subjectlabel });

          //this.myService.checkToken().then((token) =>{
          this.http.post(this.myService.constant.apiURL + "user_subjects/subjectwisesections", params).subscribe(details => {


            this.class_sec_list = details;
            if (this.class_sec_list.response_status.status == '200') {

              this.class_sec_list = this.class_sec_list.response;




              for(let key in this.class_sec_list) {
                const control1 = new FormControl(false);
                (<FormArray>this.form.get('classseccheckBox')).push(control1);
                if(this.section_id==this.class_sec_list[key].section_id)
                 (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(true);

              }
             


            }
            const params = {
              "user_id":this.userid,
              "session_id": this.sessionid,
              "section_id": this.section_id,
              "subject_id": val,
              "token": this.token

            };
            this.http.post(this.myService.constant.apiURL + "groups/assignedgroups", params).subscribe(details => {

              this.group_list = details;
              if (this.group_list.response.status == '200') {

                this.group_list = this.group_list.response.data;
                 let key = 0;
                this.group_list.forEach(element => {
                  const control1 = new FormControl(false);
                  (<FormArray>this.form.get('groupscheckBox')).push(control1);
                  (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(false);
                  key++;

                });





              }
            });
          });
        }
      });

      //});
    }
    else {
      window.localStorage.removeItem('homework_subject_id');
      this.class_sec_list = [];
      this.group_list = [];
      this.sendtolist = [];
    }
  }


  onAccept(file: any): void {
    let checkflag = false;
    this.isImage = true;
    if (this.filelist.length > 0) {
      for (var i in this.filelist) {
        if (this.filelist[i].file.name == file.file.name) {
          checkflag = true;
          break;
        }
      }
      if (!checkflag) {
        this.filelist.push(file);
        const fileExten = file.file.name.split(".");
        const fileExtindex = fileExten.length - 1;
        //console.log(fileExten[fileExtindex]);
        if (fileExten[fileExtindex].toLowerCase() == 'pdf') {

          this.fileimage.push('assets/images/pdf-type.png');

        } else if (fileExten[fileExtindex].toLowerCase() == 'doc' ||
          fileExten[fileExtindex].toLowerCase() == 'docx') {

          this.fileimage.push('assets/images/doc-type.png');

        } else if (fileExten[fileExtindex].toLowerCase() == 'xls' ||
          fileExten[fileExtindex].toLowerCase() == 'xlsx') {

          this.fileimage.push('assets/images/excel-type.png');

        } else if (fileExten[fileExtindex].toLowerCase() == 'ppt' ||
          fileExten[fileExtindex].toLowerCase() == 'pptx') {

          this.fileimage.push('assets/images/ppt-type.png');

        } else {

          this.fileimage.push('assets/images/image-type.png');

        }
      }
    }
    else {
      this.filelist.push(file);
      const fileExten = file.file.name.split(".");
      const fileExtindex = fileExten.length - 1;
      //console.log(fileExten[fileExtindex]);
      if (fileExten[fileExtindex].toLowerCase() == 'pdf') {

        this.fileimage.push('assets/images/pdf-type.png');

      } else if (fileExten[fileExtindex].toLowerCase() == 'doc' ||
        fileExten[fileExtindex].toLowerCase() == 'docx') {

        this.fileimage.push('assets/images/doc-type.png');

      } else if (fileExten[fileExtindex].toLowerCase() == 'xls' ||
        fileExten[fileExtindex].toLowerCase() == 'xlsx') {

        this.fileimage.push('assets/images/excel-type.png');

      } else if (fileExten[fileExtindex].toLowerCase() == 'ppt' ||
        fileExten[fileExtindex].toLowerCase() == 'pptx') {

        this.fileimage.push('assets/images/ppt-type.png');

      } else {

        this.fileimage.push('assets/images/image-type.png');

      }
    }


  }

  onRemove(file: any): void {

    let counter = 0;;

    if (this.filelist.length > 0) {
      for (var i in this.filelist) {
        if (this.filelist[i].file.name == file.file.name) {
          this.filelist.splice(counter, 1);
          this.fileimage.splice(counter, 1);
        }
        counter++;
      }

    }
    if (this.filelist.length == 0) {
      this.isImage = false;
    }


  }
  removeattachment(index) {

    this.filelist.splice(index, 1);
    this.fileimage.splice(index, 1);
    this.inputFileModel.splice(index, 1);

    if (this.filelist.length == 0) {
      this.isImage = false;
    }

  }
  removeattachmentall(type) {


    this.filelist = [];
    this.fileimage = [];
    this.inputFileModel = [];

    if (type == true) {
      this.isImage = false;
    } else {
      this.isImage = true;
    }

  }

  createhomework(type) {

    if (this.class_id == undefined || this.class_id == '') {
      if(this.product_type=='emscc'){
        alert(this.translate.instant('please_select_course_type'));
      }
      else{
      alert(this.translate.instant('please_select_class'));}
      return false;
    }
    if (this.section_id == undefined || this.section_id == '') {
if(this.product_type=='emscc'){
  alert(this.translate.instant('please_select_batch'));
}
  else{    alert(this.translate.instant('please_select_section'));}
      return false;
    }
    if (this.subject_id == undefined || this.subject_id == '') {
 
      alert(this.translate.instant('please_select_subject'));
      return false;
    }
    if (this.form.get('targetdate').value == undefined) {
    
      alert(this.translate.instant('please_select_target_date'));
      return false;
    }

    if (this.form.get('title').value == undefined || this.form.get('title').value == '') {
    
      alert(this.translate.instant('please_select_assignment_title'));
      return false;
    }
    if (this.sendtolist.length == 0) {
      alert("Kindly select at least one group or class");
     
      return false;
    }
    let channel = '';
    let assignto = '';
    let classsec_ids = '';
    let group_ids = '';
    let alllist = '';
    let t_year = this.form.get('targetdate').value.year;
    let t_month = this.form.get('targetdate').value.month < 10 ? '0' + this.form.get('targetdate').value.month : this.form.get('targetdate').value.month;
    let t_day = this.form.get('targetdate').value.day < 10 ? '0' + this.form.get('targetdate').value.day : this.form.get('targetdate').value.day;
    let target_date = t_year + "-" + t_month + "-" + t_day;

    this.sendtolist.forEach(function (values) {
      alllist = alllist + values.unique_id + ',';
    })
    alllist = alllist.substring(0, alllist.length - 1);
    if (this.sendtolist[0].type == 'classsec') {
      channel = 'class-section';
      assignto = 'class';
      classsec_ids = alllist;
    }
    else {
      channel = 'group';
      assignto = 'group';
      group_ids = alllist;
    }
    const formData = new FormData();
    for (var i in this.filelist) {
      formData.append(i, this.filelist[i].file);
      //console.log(this.inputFileModel[i].file);

    }
    var contentval = this.form.get('htmlContent').value;
    if (this.form.get('htmlContent').value == null || this.form.get('htmlContent').value == '' || this.form.get('htmlContent').value == undefined) {
      contentval = ' ';
    }
    formData.append("user_id", this.userid);
    formData.append("session_id", this.sessionid);
    formData.append("class_id", this.class_id);
    formData.append("section_id", this.section_id);
    formData.append("subject_id", this.subject_id);
    formData.append("title", this.form.get('title').value);
    formData.append("content", contentval);
    formData.append("channel", channel);
    formData.append("origin", 'web');
    formData.append("type", type);
    formData.append("homework_id", '');
    formData.append("file_list", '');
    formData.append("target_date", target_date);
    formData.append("classsec_ids", classsec_ids);
    formData.append("group_ids", group_ids);
    formData.append("assign_to", assignto);
    formData.append("token", this.token);
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "homework/createhomework", formData).subscribe(details => {


      this.popmessage = details;
      if (this.popmessage.response_status.status == '200' || this.popmessage.response_status.status == '201') {

        this.responseMessage = true;
        this.place = type.toLowerCase()=='homework'?'homework':'draft';
        this.popmessage = this.translate.instant(this.popmessage.response_status.message);




      }



    });
    //});
  }
  addtosendlist(id, name, callfrom, event,i,studentcount) {
    if (this.sendtolist.length > 0) {
      if (this.sendtolist[0].type != callfrom) {
        if (callfrom == 'classsec') {
          // for (let key in this.class_sec_list) {
          //   (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(false);
          // }
          for (let key in this.group_list) {
            (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(false);
          }
        }
        if (callfrom == 'group') {
           for (let key in this.class_sec_list) {
            (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(false);
          }
          // for (let key in this.group_list) {
          //   (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(false);
          // }

        }
        this.sendtolist = [];
        if (event.target.checked) {
          if (callfrom == 'classsec')
            this.sendtolist.push({ 'type': callfrom, 'unique_id': id, 'value': name });
          else
            this.sendtolist.push({ 'type': callfrom, 'unique_id': id, 'value': name });
        }
      }
      else {
        if (event.target.checked) { 
          let existflag = false;
          this.sendtolist.forEach(function (dataval) {
            if (dataval.unique_id == id) {
              existflag = true;
            }
          })
          if (!existflag) {
            if (callfrom == 'classsec')
              { if(studentcount==0)
                { alert("No Student assigned to this class, section, subject");
                  (<FormArray>this.form.get('classseccheckBox')).controls[i].setValue(false);
                  return false;
                }
               
              this.sendtolist.push({ 'type': callfrom, 'unique_id': id, 'value': name });
              }
            else
              this.sendtolist.push({ 'type': callfrom, 'unique_id': id, 'value': name });
          }
        }
        else {
          let counter = 0;
          let existposition = 0;
          let existflag = false;
          this.sendtolist.forEach(function (dataval) {
            if (dataval.unique_id == id && dataval.type == callfrom) {
              existflag = true;
              existposition = counter;

            }
            counter++;

          })
          if (existflag) {
            this.sendtolist.splice(existposition, 1);
          }
        }
      }
    }
    else {
      if (callfrom == 'classsec')
        {
          if(studentcount==0)
            { alert("No Student assigned to this class, section, subject");
              (<FormArray>this.form.get('classseccheckBox')).controls[i].setValue(false);
              return false;
            }
        this.sendtolist.push({ 'type': callfrom, 'unique_id': id, 'value': name });
        }
      else
        this.sendtolist.push({ 'type': callfrom, 'unique_id': id, 'value': name });
    }

  }
  removelist(type, id) {

    let counter = 0;
    let existposition = 0;
    let existflag = false;
    this.sendtolist.forEach(function (dataval) {
      if (dataval.unique_id == id && dataval.type == type) {
        existflag = true;
        existposition = counter;

      }
      counter++;

    })
    if (existflag) {
      this.sendtolist.splice(existposition, 1);
      if (type == 'classsec') {
        this.class_sec_list.forEach((element, key) => {
          if (element.section_id == id) {
            (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(false);
          }

        });



      }
      if (type == 'group') {
        this.group_list.forEach((element, key) => {
          if (element.id == id) {
            (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(false);
          }

        });



      }

    }



  }

  setalldropdown(classid, sectionid, subjectid) {

    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolid,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {

      this.responseobj = details;
      if (this.responseobj.response_status.status == '200') {
        this.class_id = classid;
        this.class_name = this.homework_class_name;
        this.classlist = this.responseobj.response.assigned_classes;
          if(classid)
           {
        const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "class_id": this.class_id,
          "token": this.token

        };
        this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

          this.responseobj = details;
          if (this.responseobj.response_status.status == '200') {

            if (sectionid) {
              this.section_id = sectionid;
              window.localStorage.setItem('homework_section_name', this.homework_section_name);
              this.subjectlabel = this.homework_section_name;
            }
            this.sectionlist = this.responseobj.response.assigned_sections;

            if(sectionid)
               {
            const params = {
              "user_id": this.userid,
              "session_id": this.sessionid,
              "section_id": this.section_id,
              "token": this.token
            };

            this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

              this.subjectlist = details;
              if (this.subjectlist.response_status.status == '200') {

                this.subjectlist = this.subjectlist.response.assigned_subjects;
                if (subjectid) {
                  this.subject_id = subjectid;
                  window.localStorage.setItem('homework_section_name', this.homework_section_name);
                  this.subjectlabel = this.homework_section_name;
                  this.getassignedclasssecandgroup(subjectid);
                }
              }
            });

             }

          }
        });


        }

      }
    });
  }

  
   setgroupalldropdown() {

  
        if (this.groupid != '' && this.groupid != null && this.groupid != undefined) { 
          const params = {
            "user_id": this.userid,
            "token": this.token,
            "group_id": this.groupid,
            "user_type": "student"
          };
          this.http.post(this.myService.constant.apiURL + "groups/groupidbydetail", params).subscribe(details => {
            this.grpdetail = details;
            this.selectedsubject = this.grpdetail.response.belgons_to_subject;
            this.selectedgroupname = this.grpdetail.response.groupdata;
            this.selectedsection = this.grpdetail.response.belgons_to_section;
            
            this.selectedstudent = this.grpdetail.response.data;
      
        
            const params1 = {
                "user_id": this.userid,
                "session_id": this.sessionid,
                "school_id":this.schoolid,
                "token": this.token
              };

    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params1).subscribe(details => {
      this.responseobj = details;
     
      if (this.responseobj.response_status.status == '200') {
        
        this.classlist = this.responseobj.response.assigned_classes;
        this.class_id = this.selectedsection.classId;
        const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "class_id": this.class_id,
          "token": this.token
        };
        for(let key in this.classlist)
          {
            if(this.classlist[key].class_id==this.class_id)
              {
                this.class_name = this.classlist[key].class_name;
                window.localStorage.setItem('homework_class_name',this.class_name);
              }
          }
        this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

          this.responseobj = details;
          if (this.responseobj.response_status.status == '200') {

            if (this.selectedsection.id) {
              this.section_id = this.selectedsection.id;
              // window.localStorage.setItem('homework_section_name', this.homework_section_name);
              // this.subjectlabel = this.homework_section_name;
            }
            this.sectionlist = this.responseobj.response.assigned_sections;
             for(let key in this.sectionlist)
              {
                if(this.sectionlist[key].section_id==this.section_id)
                  {
                   window.localStorage.setItem('homework_section_name', this.sectionlist[key].section_name);
                   this.subjectlabel = this.sectionlist[key].section_name;
                  }
              }
            
              
            const params = {
              "user_id": this.userid,
              "session_id": this.sessionid,
              "section_id": this.section_id,
              "token": this.token
            };

            this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {
              this.subjectlist = details;
              if (this.subjectlist.response_status.status == '200') {
                  this.subjectlist = this.subjectlist.response.assigned_subjects;
                  this.subject_id = this.selectedsubject.id;

            const params = {
                "session_id": this.sessionid,
                "section_id": this.section_id,
                "subject_id": this.subject_id,
                "token": this.token
              };
            this.http.post(this.myService.constant.apiURL + "groups/assignedgroups", params).subscribe(details => {

              this.group_list = details;
              if (this.group_list.response.status == '200') {
                this.group_list = this.group_list.response.data;
                for(let key in this.group_list) {
                 
                  const control1 = new FormControl(false);
                  (<FormArray>this.form.get('groupscheckBox')).push(control1);
                    if(this.selectedgroupname.groupid == this.group_list[key].id)
                {
                  this.sendtolist.push({'type':'group','unique_id':this.selectedgroupname.groupid,'value':this.group_list[key].group_name});
                  (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(true);
                }
                  

                };
              }
            });
              }
           });
          }
        });


        }

      });
          });
    }
   }
  }

