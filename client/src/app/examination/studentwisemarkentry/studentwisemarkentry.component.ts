import { Component, OnInit,ElementRef } from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {NgForm} from '@angular/forms';
import {RequestOptions, RequestOptionsArgs} from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-studentwisemarkentry',
  templateUrl: './studentwisemarkentry.component.html',
  styleUrls: ['./studentwisemarkentry.component.css'],
  host: {
    "(document:click)": "setdisplays($event)"

  }
})
export class StudentwisemarkentryComponent implements OnInit {
    
    form: FormGroup;
    classlist: any = [];
    sectionval: any = [];
    allExam: any = [];
    subjectgroup: any = [];
    subject: any = [];
    typval: any = [];
    namedata: any = [];
    gradeval: any = [];
    studentdataall: any = [];
    allmarkabbreviation: any = [];
    commentdata: any = [];
    maxval: any = [];
    passval: any = [];
    student: any = '';
    flag: any = '';
    notdisplay: any = true;
    loadFlag: any = '';
    public edited = false;
    public updated = false;
    public editOrUpadte = 0;
    public sessionId: any;
    public currentUser: any;
    public classId: any = '';
    public MarkArr: any = [];
  public itstrue: any = false;
  public studIdd: any = '';
  public index: any = '';
  public autoLoaderArr: any = [];
  public globalObj: any = {};

  constructor(private http: Http,
        private  fb: FormBuilder,
        private elem: ElementRef,
        private myService: BackendApiService,
        private httpClient: HttpClient) { }

  ngOnInit() {
      this.flag = 0;
      this.loadFlag = 1;
      this.editOrUpadte = 0;
      
        this.globalObj.sessionid = window.localStorage.getItem('session_id');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.schoolid = window.localStorage.getItem('school_id');
        this.globalObj.user_id = window.localStorage.getItem('user_id');
        
        const isClassTeacher = window.localStorage.getItem('isClassTeacher');
         
         if(isClassTeacher && isClassTeacher != "No"){
             this.globalObj.isClassTeacher = true;
         }else{
             this.globalObj.isClassTeacher = false;
         }

      this.form = new FormGroup({
        allClass : new FormControl(''),
        allClassSections: new FormControl(''),
        examSelect: new FormControl(''),
        subjectGroup: new FormControl(''),
        ddlStudent: new FormControl(''),
        subjectsId: new FormArray([]),
        studentsMarks: new FormArray([]),
        studentsMarksAbbr: new FormArray([]),
        studentsGrade: new FormArray([]),
        studentsComment: new FormArray([]),
        studentsGFreeStyle: new FormArray([]),

      });
      
      const url = this.myService.constant.apiURL + "sessions/sessionfromsessionid?erp_session_id="+this.globalObj.sessionid;
    this.httpClient.get(url).subscribe( response => {
        var data: any = response;
        this.sessionId = data.response.session_id;
      
            this.http.get(this.myService.details.url + 'getallclasssubject').subscribe(details => {

                      const allDdlClass = details.json();
                     var classLists = allDdlClass.classresult;
                  this.getassignedclass(classLists);

            });

            this.http.get(this.myService.details.url + 'markabbreviation').subscribe(details => {

                      const getData = details.json();
                      this.allmarkabbreviation = getData.allmarkabbreviation;
                      for (let i = 0; i < this.allmarkabbreviation.length; i++) {
                this.MarkArr.push(this.allmarkabbreviation[i].mark_abbreviation_name);
              }

                  });
        });
    }
    
    
    getassignedclass(classes) {

    
    const params = {
      "user_id": this.globalObj.user_id,
      "session_id": this.globalObj.sessionid,
      "school_id":this.globalObj.schoolid,
      "token": this.globalObj.token

    };
    this.httpClient.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {

      var classlistNew: any = details;
     
      if (classlistNew.response_status.status == '200') {
          var classesNew = classlistNew.response.assigned_classes;
          for(let i in classesNew){
              for(let j in classes){
                  if(classes[j].class_name == classesNew[i].class_name){
                      this.classlist.push({
                          class_auto_id: classes[j].class_auto_id,
                          class_name: classes[j].class_name,
                          class_id: classesNew[i].class_id
                      });
                }
              }
          }

        
      }
      
    });
    
  }
    

    classChange = function(classId) {
        
        this.sectionval= [];
      this.flag = 0;
      this.classId = classId;
      this.loadFlag = 1;
      if (classId == '') {
        this.sectionval = [];

      }else {
      this.http.get(this.myService.details.url + 'getallsectionsubject/class_id/' + classId + '/session_id/' + this.sessionId).subscribe(details => {
          const sectionresults = details.json();
        var sectionval = sectionresults.sectionresult;
        for(let i in this.classlist){
            if(this.classlist[i].class_auto_id == classId){
                const params = {
                    "user_id": this.globalObj.user_id,
                    "session_id": this.globalObj.sessionid,
                    "class_id": this.classlist[i].class_id,
                    "token": this.globalObj.token

                  };

               this.httpClient.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

                    var sectionlist = details;
                    if (sectionlist.response_status.status == '200') {

                      var sections = sectionlist.response.assigned_sections;
                        for(let k in sections){
                            for(let j in sectionval){
                                if(sections[k].class_section_name == sectionval[j].section_name){
                                    this.sectionval.push({
                                        section_id: sectionval[j].section_id,
                                        group_name: sectionval[j].group_name,
                                        section_id_new: sections[k].section_id
                                    })
                                }
                            }
                        }

                    }



                  });
            }
        }
       });
      }
      this.form.patchValue({
        allClassSections: '',
        examSelect: '',
        subjectGroup: '',
        ddlStudent: ''
      });
      this.loadFlag = 0;
    };

    sectionChange = function(sectionId){
      this.flag = 0;
      this.loadFlag = 1;
      this.sectionId = sectionId;
      this.http.get(this.myService.details.url + 'getsectionbaseexam/section_id/' + sectionId + '/session_id/' + this.sessionId).subscribe(details => {
        const exams = details.json();
        this.allExam = exams.examname;

     });
      this.form.patchValue({
         examSelect: '',
         subjectGroup: '',
         ddlStudent: ''
      });
      this.loadFlag = 0;
    };

    examChange = function(examId) {
      this.flag = 0;
      this.loadFlag = 1;
      this.examId = examId;
      const params = {
        examid: examId,
        session_id: this.sessionId,
        section_id: this.sectionId
      };
      if (examId == '') {
        this.loadFlag = 0;
        this.subjectgroup = [];
        return false;
       }
      this.http.post(this.myService.details.url + 'getsubjectoption', params).subscribe(details => {
        const subGroup = details.json();
        this.subjectgroup = subGroup.subjectassigngroup;

     });
      this.form.patchValue({subjectGroup: '', ddlStudent: '' });
      this.loadFlag = 0;
    };

    subjectGruopChange = function(subGroupId){
      this.flag = 0;
      this.loadFlag = 1;
      this.subGrupId = subGroupId;
      if (subGroupId == '') {
        this.loadFlag = 0;
        this.studentdataall = [];
        return false;
       }

     this.http.get(this.myService.details.url + 'getsectionbaseexam/section_id/' + this.sectionId + '/session_id/' + this.sessionId).subscribe(details => {
      const getData = details.json();
      this.studentdataall = getData.studentdata;
     });
     this.form.patchValue({ddlStudent: ''});
     this.loadFlag = 0;
    };

    allStudentChange = function (studId) {
      this.flag = 0;
      this.student = studId;

    };

    displayfun = function() {
        this.namedata = [];
      if (this.classId == '') {
        alert('Please select class.');
        return false;
      }
      if (this.sectionId == '' || this.sectionId == undefined) {
        alert('Please select section.');
        return false;
      }

      if (this.examId == '' || this.examId == undefined) {
        alert('Please select exam.');
        return false;
      }

      if (this.subGrupId == '' || this.subGrupId == undefined) {
        alert('Please select subject group');
        return false;
      }

      if (this.student == '') {
        alert('Please select student.');
        return false;
      }

      this.loadFlag = 1;
      
      

     // this.form.controls['subjectsId'] = new FormArray([]);
      this.form.controls['studentsMarks'] = new FormArray([]);
      this.form.controls['studentsMarksAbbr'] = new FormArray([]);
      this.form.controls['studentsGrade'] = new FormArray([]);
      this.form.controls['studentsComment'] = new FormArray([]);
      this.form.controls['studentsGFreeStyle'] = new FormArray([]);


      const param = {
        section_id: this.sectionId,
        exam_id: this.examId,
        subjectgroupid: this.subGrupId,
        session_id: this.sessionId,
        student_id: this.student
    };
    const subjId = [];
    const markEntry = [];
    const markAbb = [];
    let autoLoaderArray = [];


      this.http.post(this.myService.details.url + 'showstudentwisemarklist', param).subscribe(detail => {
        const getdetail = detail.json();


        for (let i = 0; i < getdetail.entrydata.length; i++) {
          subjId.push(getdetail.entrydata[i].subject_id);
          markEntry.push(getdetail.entrydata[i].entry);
          markAbb.push(getdetail.entrydata[i].mark_abbreviation_id);
        }

      const params = {
          section_id: this.sectionId,
          exam_id: this.examId,
          subjectgroupid: this.subGrupId,
          session_id: this.sessionId
        };
      this.http.post(this.myService.details.url + 'getsubjectgroupentryscreen', params).subscribe(details => {
        const getdetails = details.json();
        var namedata = getdetails.subject;
        
        for(let i in this.sectionval){
          if(this.sectionval[i].section_id == this.sectionId){
              const params = {
                    "user_id": this.globalObj.user_id,
                    "session_id": this.globalObj.sessionid,
                    "section_id": this.sectionval[i].section_id_new,
                    "token": this.globalObj.token

                  };
                 this.httpClient.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

                var subjectlist = details;
                if (subjectlist.response_status.status == '200') {

                    var subjects = subjectlist.response.assigned_subjects;
                    
                    if(this.globalObj.isClassTeacher){
                        for(let j in namedata){
                            this.namedata.push({
                                subject_id: namedata[j].subject_id,
                                subject_name:namedata[j].subject_name,
                                max_marks: namedata[j].max_marks,
                                checkSlec: false,
                                checkText: false
                            });
                        }
                    }else{
                        for(let k in subjects){
                            for(let j in namedata){
                                if(subjects[k].subject_name == namedata[j].subject_name){
                                    this.namedata.push({
                                        subject_id: namedata[j].subject_id,
                                        subject_name:namedata[j].subject_name,
                                        max_marks: namedata[j].max_marks,
                                        checkSlec: false,
                                        checkText: false
                                    });
                                }
                            }
                        }
                    }
                    
                    
                    
                    
                    
                    this.typval = getdetails.type;
                    this.gradeval = getdetails.gradename;
                    
                    for (let i = 0; i < this.namedata.length; i++) {
                        autoLoaderArray = [];
                       for (let j = 0; j < this.allmarkabbreviation.length; j++) {
                       autoLoaderArray.push({
                         value: this.allmarkabbreviation[j].mark_abbreviation_name,
                       });
                     }
                        for (let j = 0; j <= this.namedata[i].max_marks; j++) {
                         autoLoaderArray.push({
                         value: j,
                       });
                      }

                         this.namedata[i].checkSlec = false;
                         this.namedata[i].checkText = true;

                         const control = new FormControl(this.namedata[i].subject_id);
                         (<FormArray>this.form.get('subjectsId')).push(control);

                         if (this.typval == 1) {
                           if (subjId.includes(this.namedata[i].subject_id)) {
                             const index = subjId.indexOf(this.namedata[i].subject_id);
                             this.editOrUpadte = 1;

                          if (markAbb[index] != '0') {
                           for (let j = 0; j < this.allmarkabbreviation.length; j++) {
                             if(this.allmarkabbreviation[j].id == markAbb[index]) {
                                const control1 = new FormControl(this.allmarkabbreviation[j].mark_abbreviation_name);
                               (<FormArray>this.form.get('studentsMarks')).push(control1);
                             }

                           }
                         }else {
                                 const control1 = new FormControl(markEntry[index]);
                               (<FormArray>this.form.get('studentsMarks')).push(control1);

                               }

                           }else {
                             this.notdisplay = true;
                             const control1 = new FormControl('');
                             (<FormArray>this.form.get('studentsMarks')).push(control1);
                             const control2 = new FormControl('');
                             (<FormArray>this.form.get('studentsMarksAbbr')).push(control2);
                           }
                         }else if (this.typval == 2) {
                           if (subjId.includes(this.namedata[i].subject_id)) {
                             const index = subjId.indexOf(this.namedata[i].subject_id);
                             const control3 = new FormControl(markEntry[index]);
                             (<FormArray>this.form.get('studentsGrade')).push(control3);
                           }else {
                             const control3 = new FormControl('');
                             (<FormArray>this.form.get('studentsGrade')).push(control3);
                           }

                         }else if (this.typval == 3) {
                           if (subjId.includes(this.namedata[i].subject_id)) {
                             const index = subjId.indexOf(this.namedata[i].subject_id);
                             const control4 = new FormControl(markEntry[index]);
                             (<FormArray>this.form.get('studentsComment')).push(control4);
                           }else {
                             const control4 = new FormControl('');
                             (<FormArray>this.form.get('studentsComment')).push(control4);
                           }

                         }else {
                           if (subjId.includes(this.namedata[i].subject_id)) {
                             const index = subjId.indexOf(this.namedata[i].subject_id);
                             const control5 = new FormControl(markEntry[index]);
                             (<FormArray>this.form.get('studentsGFreeStyle')).push(control5);
                           }else {
                             const control5 = new FormControl('');
                             (<FormArray>this.form.get('studentsGFreeStyle')).push(control5);
                           }

                         }
                       }
                    this.autoLoaderArr = autoLoaderArray;
                       
                       
                       
                  }
                });  
                  
          }
      }
        
     });

    });
    this.flag = 1;


    };




    onSubmit = function(user, event) {
      this.loadFlag = 1;
      if (user.ddlStudent == '' || user.ddlStudent == null) {
        alert('Please select student.');
        this.loadFlag = 0;
        return false;
      }

      const array = [];
      let insertData = '';
      let markAbb: any = '';
      for (let i = 0; i < this.form.controls["subjectsId"].length; i++) {
        if (this.typval == 1) {
          if(this.form.controls["studentsMarks"].controls[i].value == '' || this.form.controls["studentsMarks"].controls[i].value == null) {
            insertData = '';
            markAbb = '';
          }else{
            if(this.MarkArr.includes(this.form.controls["studentsMarks"].controls[i].value)){
              insertData = '';
              for (let j = 0; j < this.allmarkabbreviation.length; j++) {
                if(this.allmarkabbreviation[j].mark_abbreviation_name == this.form.controls["studentsMarks"].controls[i].value) {
                   markAbb = this.allmarkabbreviation[j].id
                }
              }
            }else{
              const studsMark = +this.form.controls["studentsMarks"].controls[i].value;
              if(studsMark <= this.namedata[i].max_marks) {
                insertData = this.form.controls["studentsMarks"].controls[i].value;

              }else{
                alert('You have entered wrong value.');
                this.loadFlag = 0;
                return false;

              }
              markAbb = '';
            }
          }
        } else if (this.typval == 2) {
          insertData = this.form.controls["studentsGrade"].controls[i].value;
        } else if (this.typval == 3) {
          insertData = this.form.controls["studentsComment"].controls[i].value;
        } else {
          insertData = this.form.controls["studentsGFreeStyle"].controls[i].value;
        }

        array.push({
          subject_id: this.form.controls["subjectsId"].controls[i].value,
          marks: insertData,
          markabb: markAbb
        });
      }

      const params = {
        class_id: user.allClass,
        section_id: user.allClassSections,
        subject_group_id: user.subjectGroup,
        exam_id: user.examSelect,
        student_id: user.ddlStudent,
        session_id: this.sessionId,
        entry_details: array,
        flag: this.editOrUpadte
      };
      this.http.post(this.myService.details.url + 'studentwisemarkentry', params).subscribe(details => {
        const getdetails = details.json();
        this.loadFlag = 0;

        if (getdetails.responceCode == 200 && getdetails.responceMessage == 'Inserted Successfully') {
          this.edited = true;
          this.sectionId = '';
          this.examId = '';
          this.subGrupId = '';
          this.classId = '';
          this.student = '';
          this.editOrUpadte = 0;
        } else if (getdetails.responceCode == 200 && getdetails.responceMessage == 'Updated Successfully') {
          this.updated = true;
          this.sectionId = '';
          this.examId = '';
          this.subGrupId = '';
          this.classId = '';
          this.student = '';
          this.editOrUpadte = 0;
        }

        this.flag = 0;
        this.form.reset();
        this.form.patchValue({
          allClass: '',
          allClassSections: '',
          examSelect: '',
          subjectGroup: '',
          ddlStudent: ''
        });


      });
      setTimeout(() => {
        this.updated = false;
        this.edited = false;
      }, 2000);
    };

    select(value, i) {
    (<FormArray>this.form.get("studentsMarks")).controls[i].setValue(value);
  }

    setdisplay(event, studentid, i) {
    this.studIdd = studentid;
    this.index = i;

  }

  setdisplays(event) {
    let idd = event.target.id;
    if (idd != '' && this.studIdd != '') {
      if (idd == this.studIdd) {
        let inside = false;
    do {
      if (idd == this.studIdd) {
        inside = true;
      }
      idd = idd.parentNode;
    } while (idd);
    if (inside) {
     console.log('inside');
     $('.suggestions').css('display', 'none');
     $('#' + this.studIdd + '-' + this.index).css('display', '');
    } else {
      console.log('outside');
     $('.suggestions').css('display', 'none');
    }

      }

    }else if (idd == '' && this.studIdd != '') { console.log('2');
      $('.suggestions').css('display', 'none');

    }else { 
      $('.suggestions').css('display', 'none');
    }

  }

  blurfo(event, studentid, i){
    $('.suggestions').css('display', 'none');
    $('#' + studentid + '-' + i).css('display', '');
  }

  checkonblur(event, subject_id, i) {

    const chckmarks = (<FormArray>this.form.get("studentsMarks")).controls[i].value;
    if(chckmarks != ''){
    const marksData = +(<FormArray>this.form.get("studentsMarks")).controls[i].value;
    const maxMarks = +this.namedata[i].max_marks;
    if (marksData <= maxMarks || this.MarkArr.includes(chckmarks)) {

    }else{
      alert('Marks is less or equal to max marks');
      (<FormArray>this.form.get("studentsMarks")).controls[i].setValue('');
      setTimeout(() => {
      $('#'+subject_id).focus();
      }, 10);
      return false;

    }
    }


  }

}
