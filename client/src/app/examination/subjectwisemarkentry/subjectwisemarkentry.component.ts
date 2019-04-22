import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {NgForm} from '@angular/forms';
import {RequestOptions, RequestOptionsArgs} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-subjectwisemarkentry',
  templateUrl: './subjectwisemarkentry.component.html',
  styleUrls: ['./subjectwisemarkentry.component.css'],
  host: {
    "(document:click)": "setdisplays($event)"

  }
})
export class SubjectwisemarkentryComponent implements OnInit {

  form: FormGroup;
  classlist: any = [];
  sectionval: any = [];
  allExam: any = [];
  subjectgroup: any = [];
  subject: any = '';
  typval: any = [];
  namedata: any = [];
  gradeval: any = [];
  studentdataall: any = [];
  allmarkabbreviation: any = [];
  commentdata: any = [];
  maxval: any = [];
  passval: any = [];
  loadFlag: any = '';
  public edited = false;
  public updated = false;
  flag: any = '';
  public editOrUpadte = 0;
  public sessionId: any;
  public currentUser: any;
  insertAbbstudentId: any = [];
  public studentdetails: any = {};
  public globalObj: any = {};
  public classId: any = '';
  public group: any = '';
  public MarkArr: any = [];
  public itstrue: any = false;
  public studIdd: any = '';
  public index: any = '';
  public autoLoaderArr: any = [];

  constructor(private http: Http,
   private  fb: FormBuilder,
    private elem: ElementRef,
     private myService: BackendApiService,
     private httpClient: HttpClient) { }

  ngOnInit() {

    this.loadFlag = 1;
    this.flag = 0;
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

    this.currentUser = window.localStorage.getItem('current_user');
    this.studentdetails.checkSlec = false;

    this.form = new FormGroup({
      allClass : new FormControl(''),
      allClassSections: new FormControl(''),
      examSelect: new FormControl(''),
      subjectGroup: new FormControl(''),
      ddlSubject: new FormControl('', Validators.compose([Validators.required])),
      studentsIds: new FormArray([]),
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

    })

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
    this.flag = 0;
    this.classId = classId;
    this.loadFlag = 1;
    this.sectionval = [];
    this.form.patchValue({
      allClassSections: '',
      examSelect: '',
      subjectGroup: '',
      ddlSubject: ''
    });
    if (classId == '') {
      this.sectionval = [];
      this.loadFlag = 0;
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





  };

  sectionChange = function(sectionId){
    this.flag = 0;
    this.loadFlag = 1;
    this.form.patchValue({
      examSelect: '',
      subjectGroup: '',
      ddlSubject: ''
    });
    this.sectionId = sectionId;
    this.http.get(this.myService.details.url + 'getsectionbaseexam/section_id/' + sectionId + '/session_id/' + this.sessionId).subscribe(details => {
      const exams = details.json();
      this.allExam = exams.examname;
      this.loadFlag = 0;
   });



  };

  examChange = function(examId) {
    this.flag = 0;
    this.loadFlag = 1;
    this.form.patchValue({
      subjectGroup: '',
      ddlSubject: ''
    });
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
      this.loadFlag = 0;
   });


  };

  subjectGruopChange = function(subGroupId){
    this.flag = 0;
    this.form.patchValue({
      ddlSubject: ''
    });
    this.loadFlag = 1;
    this.subGrupId = subGroupId;
    const params = {
      section_id: this.sectionId,
      exam_id: this.examId,
      subjectgroupid: subGroupId,
      session_id: this.sessionId
    };

    if (subGroupId == '') {
      this.loadFlag = 0;
      this.namedata = [];
      return false;
     }

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
                                    max_marks: namedata[j].max_marks
                                });
                            }
                    }else{
                        for(let k in subjects){
                            for(let j in namedata){
                                if(subjects[k].subject_name == namedata[j].subject_name){
                                    this.namedata.push({
                                        subject_id: namedata[j].subject_id,
                                        subject_name:namedata[j].subject_name,
                                        max_marks: namedata[j].max_marks
                                    });
                                }
                            }
                        }
                    }

                  }
                });

          }
      }


      this.typval = getdetails.type;
      this.gradeval = getdetails.gradename;
      this.loadFlag = 0;
   });









  };

  allSubjectChange = function (subId) {
    this.flag = 0;
    const autoLoaderArray = [];

    this.subject = subId;
    const params = {
      subjectid: subId,
      session_id: this.sessionId,
      subjectgroupid: this.subGrupId,
      section_id: this.sectionId,
      examId: this.examId
    };
    this.http.post(this.myService.details.url + 'getsubjectgroupmarkscreen', params).subscribe(details => {
      const getdetails = details.json();

      this.commentdata = getdetails.comment;
      this.maxval = getdetails.max_marks;
      this.passval = getdetails.pass_marks;

      for (let i = 0; i < this.allmarkabbreviation.length; i++) {
        autoLoaderArray.push({
          value: this.allmarkabbreviation[i].mark_abbreviation_name,
        });
      }
      for (let i = 0; i <= this.maxval; i++) {
        autoLoaderArray.push({
          value: i,
        });
      }
      this.autoLoaderArr = autoLoaderArray;

   });

  };

  displayfun = function() {
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
     if (this.subject == '') {
      alert("Please select subject");
      return false;
    }
    this.loadFlag = 1;
    const autoLoaderArray = [];

        const paramets = {
          subjectid: this.subject,
          session_id: this.sessionId,
          subjectgroupid: this.subGrupId,
          section_id: this.sectionId,
          examId: this.examId
        };
        this.http.post(this.myService.details.url + 'getsubjectgroupmarkscreen', paramets).subscribe(details => {
          const getdetails = details.json();

          this.commentdata = getdetails.comment;
          this.maxval = getdetails.max_marks;
          this.passval = getdetails.pass_marks;

          for (let i = 0; i < this.allmarkabbreviation.length; i++) {
            autoLoaderArray.push({
              value: this.allmarkabbreviation[i].mark_abbreviation_name,
            });
          }
          for (let i = 0; i <= this.maxval; i++) {
            autoLoaderArray.push({
              value: i,
            });
          }
          this.autoLoaderArr = autoLoaderArray;

       });



  this.form.controls["studentsIds"] = new FormArray([]);
  this.form.controls["studentsMarks"] = new FormArray([]);
  this.form.controls["studentsMarksAbbr"] = new FormArray([]);
  this.form.controls["studentsGrade"] = new FormArray([]);
  this.form.controls["studentsComment"] = new FormArray([]);
  this.form.controls["studentsGFreeStyle"] = new FormArray([]);

    this.flag = 1;
    const studtId = [];
    const markEntry = [];

    const markAbb = [];
    const params = {
      section_id: this.sectionId,
      exam_id: this.examId,
      subjectgroupid: this.subGrupId,
      session_id: this.sessionId,
      subjectid: this.subject
    };
    this.http.post(this.myService.details.url + 'entryshowlist', params).subscribe(details => {
      const getdetails = details.json();
      this.flag = 1;

      for (let i = 0; i < getdetails.entrydata.length; i++) {
        studtId.push(getdetails.entrydata[i].student_id);
        markEntry.push(getdetails.entrydata[i].entry);
        markAbb.push(getdetails.entrydata[i].mark_abbreviation_id);
      }


      this.http.get(this.myService.details.url + 'getsectionbaseexam/section_id/' + this.sectionId + '/session_id/' + this.sessionId).subscribe(details => {
        const getData = details.json();
        this.studentdataall = getData.studentdata;

        for (let i = 0; i < this.studentdataall.length; i++) {
          this.studentdataall[i].checkSlec = false;
          this.studentdataall[i].checkText = true;
          const control = new FormControl(this.studentdataall[i].id);
          (<FormArray>this.form.get('studentsIds')).push(control);

          if (this.typval == 1) {
            if (studtId.includes(this.studentdataall[i].id)) {
              const index = studtId.indexOf(this.studentdataall[i].id);
              this.editOrUpadte = 1;
                // const control2 = new FormControl(markAbb[index]);
                // (<FormArray>this.form.get('studentsMarksAbbr')).push(control2);
               //  fb.addControl(this.studentdataall[i].id, new FormControl(markAbb[index]));
               // (<FormArray>this.form.get('studentsMarksAbbr')).push(markAbb[index]);


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
              const control1 = new FormControl('');
              (<FormArray>this.form.get('studentsMarks')).push(control1);
              // const control2 = new FormControl('');
              // (<FormArray>this.form.get('studentsMarksAbbr')).push(control2);
              // fb.addControl(this.studentdataall[i].id, new FormControl());
            }
          }else if (this.typval == 2) {
            if (studtId.includes(this.studentdataall[i].id)) {
              const index = studtId.indexOf(this.studentdataall[i].id);
              const control3 = new FormControl(markEntry[index]);
              (<FormArray>this.form.get('studentsGrade')).push(control3);
            }else {
              const control3 = new FormControl('');
              (<FormArray>this.form.get('studentsGrade')).push(control3);
            }

          }else if (this.typval == 3) {
            if (studtId.includes(this.studentdataall[i].id)) {
              const index = studtId.indexOf(this.studentdataall[i].id);
              const control4 = new FormControl(markEntry[index]);
              (<FormArray>this.form.get('studentsComment')).push(control4);
            }else {
              const control4 = new FormControl('');
              (<FormArray>this.form.get('studentsComment')).push(control4);
            }

          }else {
            if (studtId.includes(this.studentdataall[i].id)) {
              const index = studtId.indexOf(this.studentdataall[i].id);
              const control5 = new FormControl(markEntry[index]);
              (<FormArray>this.form.get('studentsGFreeStyle')).push(control5);
            }else {
              const control5 = new FormControl('');
              (<FormArray>this.form.get('studentsGFreeStyle')).push(control5);
            }

          }

        }
        // (<FormArray>this.form.get('studentsMarksAbbr')).push(fb);
        console.log(this.form);

        this.loadFlag = 0;

    });
  });


  };




  onSubmit = function(user, event) {
    if (user.ddlSubject == '' || user.ddlSubject == null) {
      alert('Please select subject.');
      return false;
    }

    this.loadFlag = 1;
    const array = [];
    let insertData = '';
    let markAbb: any = '';
    for (let i = 0; i < this.form.controls["studentsIds"].length; i++) {
      if (this.typval == 1) {
        if(this.form.controls["studentsMarks"].controls[i].value == '' || this.form.controls["studentsMarks"].controls[i].value == null) {

        insertData = '';
        markAbb = '';
        }else {
        if(this.MarkArr.includes(this.form.controls["studentsMarks"].controls[i].value)){
          insertData = '';
          for (let j = 0; j < this.allmarkabbreviation.length; j++) {
          if(this.allmarkabbreviation[j].mark_abbreviation_name == this.form.controls["studentsMarks"].controls[i].value) {
            markAbb = this.allmarkabbreviation[j].id
          }
        }
        }else{
          //for (let i = 0; i <= this.maxval; i++) {
            const onlynumber = +this.form.controls["studentsMarks"].controls[i].value;
            if(onlynumber <= this.maxval) {
              insertData = this.form.controls["studentsMarks"].controls[i].value;

            } else {
              alert('You have entered wrong value.');
              const studentId = this.form.controls["studentsIds"].controls[i].value;
               $('#'+studentId).focus();
              this.loadFlag = 0;
              return false;

            }

          //}

          markAbb = '';
        }
      }
        // insertData = this.form.controls["studentsMarks"].controls[i].value;
        // markAbb = this.form.controls['studentsMarksAbbr'].controls[i].value;
      } else if (this.typval == 2) {
        insertData = this.form.controls["studentsGrade"].controls[i].value;
      } else if (this.typval == 3) {
        insertData = this.form.controls["studentsComment"].controls[i].value;
      } else {
        insertData = this.form.controls["studentsGFreeStyle"].controls[i].value;
      }
      // if ( this.form.controls["studentsMarksAbbr"].controls[i].value == undefined ||
      // this.form.controls["studentsMarksAbbr"].controls[i].value == '' ||
      // this.form.controls["studentsMarksAbbr"].controls[i].value == null) {
      //   markAbb = '';
      // } else {
      //   markAbb = this.form.controls['studentsMarksAbbr'].controls[i].value;
      // }

      array.push({
        studId: this.form.controls["studentsIds"].controls[i].value,
        marks: insertData,
        markabb: markAbb
      });
    }

    const params = {
      class_id: user.allClass,
      section_id: user.allClassSections,
      subject_group_id: user.subjectGroup,
      exam_id: user.examSelect,
      subject_id: user.ddlSubject,
      session_id: this.sessionId,
      comment_id: array,
      flagEdUp: this.editOrUpadte
    };


    this.http.post(this.myService.details.url + 'insertentrysreendata', params).subscribe(details => {
      const getdetails = details.json();
      this.loadFlag = 0;

      if (getdetails.responceCode == 200 && getdetails.responceMessage == 'Inserted Successfully') {
        this.edited = true;
        this.sectionId = '';
        this.examId = '';
        this.subGrupId = '';
        this.classId = '';
        this.subject = '';
        this.editOrUpadte = 0;

      } else if (getdetails.responceCode == 200 && getdetails.responceMessage == 'Updated Successfully') {
        this.updated = true;
        this.sectionId = '';
        this.examId = '';
        this.subGrupId = '';
        this.classId = '';
        this.subject = '';
        this.editOrUpadte = 0;

      }
      this.flag = 0;
      this.form.reset();
      this.form.patchValue({
        allClass: '',
        allClassSections: '',
        examSelect: '',
        subjectGroup: '',
        ddlSubject: ''
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

    }else { console.log('3');
      $('.suggestions').css('display', 'none');
    }

  }

  blurfo(event, studentid, i){
    $('.suggestions').css('display', 'none');
    $('#' + studentid + '-' + i).css('display', '');
  }

  checkonblur(event, studentid, i) {

    const chckmarks = (<FormArray>this.form.get("studentsMarks")).controls[i].value;
    if(chckmarks != ''){
    const marksData = +(<FormArray>this.form.get("studentsMarks")).controls[i].value;
    if (marksData <= this.maxval || this.MarkArr.includes(chckmarks)) {

    }else{
      alert('Marks is less or equal to max marks');
      (<FormArray>this.form.get("studentsMarks")).controls[i].setValue('');
      setTimeout(() => {
      $('#'+studentid).focus();
      }, 10);
      return false;

    }
    }


  }

}
