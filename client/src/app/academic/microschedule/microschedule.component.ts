import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, FormControlName } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { element } from 'protractor';
import { TreeviewModule, TreeviewItem, TreeviewConfig, TreeviewHelper } from 'ngx-treeview';
import { months } from 'moment';


@Component({
  selector: 'app-microschedule',
  templateUrl: './microschedule.component.html',
  styleUrls: ['./microschedule.component.css']
})
export class MicroscheduleComponent implements OnInit {
  dropdownEnabled = true;
  items: TreeviewItem[];
  values: number[];

  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false
    //maxHeight: 400
  });

  buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[0];

  microschduleForm: FormGroup;
  public dp: any = '';
  public id: any;
  public userId: any;
  public centerId: any;
  public minDate: any;
  public academicSessionId: any;
  public globalObj: any = {};
  public syllabusData: any = [];
  public subjectId = 0;
  public customBoardId = 0;
  public currentDay: any;
  public microscheduleList: any = [];
  public totalRows: any = 0;
  public lmsBoardId: any = 0;
  public lmsClassId: any = 0;
  public lmsSubjectId: any = 0;
  public viewSyllabusList = [];
  public topicIdArr: any = [];
  page: number = 1;

  constructor(private myService: BackendApiService, private http: HttpClient) {
    const today = new Date();
    this.currentDay = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  }

  ngOnInit() {
    this.userId = window.localStorage.getItem('user_id');
    this.centerId = window.localStorage.getItem('school_id');
    this.microschduleForm = new FormGroup({
      id: new FormControl(''),
      academic_session_id: new FormControl('', Validators.required),
      batch_start_date_id: new FormControl('', Validators.required),
      test_date: new FormControl('', Validators.required),
      course_mode: new FormControl('', Validators.required),
      course_name: new FormControl('', Validators.required),
      course_type: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required)
    });

    const sessionInputData = { where: { status: '1' } };
    const sessionListUrl = this.myService.constant.apiURL + 'academic_session_masters/list';
    this.http.post(sessionListUrl, sessionInputData).subscribe(resdata => {
      const sessionResult: any = resdata;
      if (sessionResult.response.data) {
        this.globalObj.academicSsessionList = sessionResult.response.data;
        this.getCourseMode();
        this.getCourseName();
      }
    });

    this.getMicroscheduleList('');
  }

  getBacthDateDetails(sessionId = 0) {
    this.microschduleForm.get('batch_start_date_id').setValue('');
    this.microschduleForm.get('test_date').setValue('');
    if (sessionId > 0) {
      const batchDateInputs = { where: { session_id: sessionId, status: '1' } };
      const batchDatetUrl = this.myService.constant.apiURL + 'batch_date_masters/list';
      this.http.post(batchDatetUrl, batchDateInputs).subscribe(batchDateData => {
        const batchDateresult: any = batchDateData;
        this.globalObj.batchDateList = batchDateresult.response.data;
      });
    }
  }

  setMinTestDate(batchStartDateId = 0) {
    if (batchStartDateId) {
      this.microschduleForm.get('test_date').setValue('');
      let batchInfotUrl = this.myService.constant.apiURL + 'batch_date_masters/getbatchstartrow?id=' + batchStartDateId;
      this.http.get(batchInfotUrl).subscribe(batchInfo => {
        let batchInfoResult: any = batchInfo;
        var batchStartDateInfo = batchInfoResult.response;
        var selectedBatchDate = batchStartDateInfo.batch_start_date;
        let startDate = new Date(selectedBatchDate);
        this.minDate = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };
      });
    }
  }

  getCourseMode() {
    const courseModeUrl = this.myService.constant.apiURL + 'course_modes/getcoursemode';
    this.http.get(courseModeUrl).subscribe(courseModeData => {
      const courseModeResult: any = courseModeData;
      this.globalObj.courseModeList = courseModeResult.response;
    });
  }

  getCourseName() {
    const courseNameUrl = this.myService.constant.apiURL + 'boards/getallboard';
    this.http.get(courseNameUrl).subscribe(courseNameData => {
      const courseNameResult: any = courseNameData;
      if (courseNameResult.response) {
        this.globalObj.courseNameList = courseNameResult.response.filter(element => (element.status === 'Active'));
      } else {
        this.globalObj.courseNameList = '';
      }
    });
  }

  getCourseType(courseIdStr) {
    this.lmsSubjectId = 0;
    let courseId = courseIdStr.split('@@')[0];
    this.lmsBoardId = courseIdStr.split('@@')[1];
    this.microschduleForm.get('course_type').setValue('');
    this.microschduleForm.get('subject').setValue('');
    this.globalObj.courseTypeList = [];
    this.globalObj.subjectList = [];

    if (courseId > 0) {
      this.customBoardId = courseId;
      const courseTypeInputs = { boardId: courseId, school_id: this.centerId };
      const courseTypeUrl = this.myService.constant.apiURL + 'classes/getclasslistbyboardId';

      this.http.post(courseTypeUrl, courseTypeInputs).subscribe(courseTypeData => {
        const courseTypeResult: any = courseTypeData;
        if (courseTypeResult.response_status.status == '200') {
          this.globalObj.courseTypeList = courseTypeResult.response;
        } else {
          this.globalObj.courseTypeList = [];
        }
      });
    }


  }

  getSubjectList(courseTypeStr) {
    this.lmsSubjectId = 0;
    let classId = courseTypeStr.split('@@')[0];
    this.lmsClassId = courseTypeStr.split('@@')[1];
    this.microschduleForm.get('subject').setValue('');
    this.globalObj.subjectList = [];
    if (this.lmsClassId > 0 && this.lmsBoardId > 0) {
      const subjectInputs = { where: { boardId: this.lmsBoardId, classId: this.lmsClassId } };
      const subjectUrl = this.myService.constant.apiURL + 'lms_class_subjects/classsubjectList';
      this.http.post(subjectUrl, subjectInputs).subscribe(subjectData => {
        const subjectResult: any = subjectData;
        if (subjectResult.response.data) {
          this.globalObj.subjectList = subjectResult.response.data;
        } else {
          this.globalObj.subjectList = [];
        }
      });
    }
  }

  oldgetSubjectList(boardId = 0, courseTypeId = 0) {
    this.microschduleForm.get('subject').setValue('');
    if (courseTypeId > 0 && boardId > 0) {
      const subjectInputs = { lms_board_id: boardId, rack_id: courseTypeId };
      const subjectUrl = this.myService.constant.apiURL + 'lmsapis/getsubjectlist';
      this.http.post(subjectUrl, subjectInputs).subscribe(subjectData => {
        const subjectResult: any = subjectData;

        if (subjectResult.response.data) {
          this.globalObj.subjectList = subjectResult.response.data;
        } else {
          this.globalObj.subjectList = [];
        }
      });
    }
  }

  getWholeSyllabusDetails(subjectValues) {
    let subjectId = subjectValues.split('@@')[0];
    this.lmsSubjectId = subjectValues.split('@@')[1];
    if (this.lmsSubjectId > 0 && this.lmsBoardId > 0) {
      this.subjectId = this.lmsSubjectId;
      const syllabusInputs = { subject_id: this.lmsSubjectId, board_id: this.lmsBoardId };
      const syllabusUrl = this.myService.constant.apiURL + 'lmsapis/syllabusData';
      this.http.post(syllabusUrl, syllabusInputs).subscribe(syllabusDetails => {
        const syllabusResult: any = syllabusDetails;
        //console.log(syllabusResult);
        if (syllabusResult.response.status == '200') {
          this.syllabusData = syllabusResult.response.data;
          this.items = this.getSyllabus(this.syllabusData);
        }
      });
    }
  }

  getSyllabus(syllabusData): TreeviewItem[] {
    var syllabusArr: any = [];
    var chapterArr: any = [];
    var topicArr: any = [];
    var subtopicArr: any = [];

    syllabusData.forEach((val, key) => {
      var unitValue = val.value + '###' + val.text;
      syllabusArr[key] = [];
      if (val.children) {
        chapterArr[key] = [];
        val.children.forEach((cval, ckey) => {
          var chapterName = cval.text.replace(',', ' ');
          var chapterId = cval.value + '###' + chapterName;

          if (this.topicIdArr.length > 0) {
            var checkedValue = false;
            if (this.topicIdArr.find(element => element === chapterId)) {
              checkedValue = true;
            }
          }

          if (cval.children) {
            topicArr[key] = [];
            topicArr[key][ckey] = [];
            cval.children.forEach((ccval, cckey) => {
              var topicName = ccval.text.replace(',', ' ');
              var topicId = ccval.value + '###' + topicName;

              if (this.topicIdArr.length > 0) {
                var checkedValue = false;
                if (this.topicIdArr.find(element => element === topicId)) {
                  checkedValue = true;
                }
              }


              if (ccval.children) {
                subtopicArr[key] = [];
                subtopicArr[key][ckey] = [];
                subtopicArr[key][ckey][cckey] = [];
                ccval.children.forEach((cccval, ccckey) => {
                  var subtopicName = cccval.text.replace(',', ' ');
                  var subtopicId = cccval.value + '###' + subtopicName;

                  if (this.topicIdArr.length > 0) {
                    var checkedValue = false;
                    if (this.topicIdArr.find(element => element === subtopicId)) {
                      checkedValue = true;
                    }
                  }

                  subtopicArr[key][ckey][cckey].push({ text: subtopicName, value: subtopicId, checked: checkedValue });
                });
                topicArr[key][ckey].push({ text: topicName, value: topicId, children: subtopicArr[key][ckey][cckey], checked: checkedValue });
              } else {
                topicArr[key][ckey].push({ text: topicName, value: topicId, checked: checkedValue });
              }
            });
            chapterArr[key].push({ text: chapterName, value: chapterId, children: topicArr[key][ckey], checked: checkedValue });
          } else {
            chapterArr[key].push({ text: chapterName, value: chapterId, checked: checkedValue });
          }
        });
        syllabusArr[key] = new TreeviewItem({
          text: val.text, value: unitValue, children: chapterArr[key],
          collapsed: true
        });
      } else {
        syllabusArr[key] = new TreeviewItem({ text: val.text, value: unitValue });
      }
    });

    return syllabusArr;
  }

  onSubmitDetail(formValue) {
    if (this.values.length == 0) {
      alert('Please select at least one topic');
      return false;
    }

    let postData = {};
    let testId = (formValue.id > 0) ? formValue.id : 0;
    let academicSessionId = formValue.academic_session_id;
    let batchStartDateId = formValue.batch_start_date_id;
    let courseModeId = formValue.course_mode;
    let boardId = formValue.course_name.split('@@')[0];
    let lmsBoardId = formValue.course_name.split('@@')[1];

    let classId = formValue.course_type.split('@@')[0];
    let lmsClassId = formValue.course_type.split('@@')[1];

    let subjectId = formValue.subject.split('@@')[0];
    let lmsSubjectId = formValue.subject.split('@@')[1];

    let syllabusData = JSON.stringify(this.values);
    let testDate = formValue.test_date;
    let testDateYear = testDate.year;
    let testDateMonth = (testDate.month > 9) ? testDate.month : '0' + testDate.month;
    let testDateDay = (testDate.day > 9) ? testDate.day : '0' + testDate.day;
    let testDateStr = testDateYear + '-' + testDateMonth + '-' + testDateDay;
    let toDayStr = this.currentDay.year + '-' + this.currentDay.month + '-' + this.currentDay.day;



    if (testId > 0) {
      testDateStr = (testDateYear) ? testDateStr : formValue.test_date;
      postData = {
        academic_session_id: academicSessionId,
        batch_start_date_id: batchStartDateId,
        test_date: testDateStr,
        course_mode_id: courseModeId,
        board_id: boardId,
        lms_boardId: lmsBoardId,
        class_id: classId,
        lms_classId: lmsClassId,
        subject_id: subjectId,
        lms_subjectId: lmsSubjectId,
        syllabus_data: syllabusData,
        updated_by: this.userId,
        updated_date: toDayStr,
        id: testId
      };
      this.saveMicroScheduleData(postData);

    } else {
      postData = {
        academic_session_id: academicSessionId,
        batch_start_date_id: batchStartDateId,
        test_date: testDateStr,
        course_mode_id: courseModeId,
        board_id: boardId,
        lms_boardId: lmsBoardId,
        class_id: classId,
        lms_classId: lmsClassId,
        subject_id: subjectId,
        lms_subjectId: lmsSubjectId,
        syllabus_data: syllabusData,
        status: '1',
        added_by: this.userId,
        added_date: toDayStr
      };
      let checkConditions = {
        where: {
          academic_session_id: academicSessionId,
          batch_start_date_id: batchStartDateId,
          test_date: testDateStr,
          course_mode_id: courseModeId,
          board_id: boardId,
          lms_boardId: lmsBoardId,
          class_id: classId,
          lms_classId: lmsClassId,
          subject_id: subjectId,
          lms_subjectId: lmsSubjectId
        }
      };
      const checkUrl = this.myService.constant.apiURL + 'microschedule_masters/getdata';
      this.http.post(checkUrl, checkConditions).subscribe(chkData => {
        const checkResult: any = chkData;
        var chkId = 0;
        if (checkResult.response.data) {
          let checkDataArr = checkResult.response.data;
          chkId = (checkDataArr.id > 0) ? checkDataArr.id : 0;
        }
        if (chkId > 0) {
          this.globalObj.errorMessage = "This microschedule is already exist.";
          setTimeout(() => { this.globalObj.errorMessage = ''; }, 4000);
        } else {
          this.saveMicroScheduleData(postData);
        }
      });
    }
    $('html,body').animate({ scrollTop: $('#mainContent').offset().top }, 'slow');
  }

  saveMicroScheduleData(postData) {
    const saveUrl = this.myService.constant.apiURL + 'microschedule_masters/save';
    this.http.post(saveUrl, postData).subscribe(resData => {
      const resultData: any = resData;
      if (resultData.response.status == '200') {
        //this.id = (resultData.response.data.id > 0) ? resultData.response.data.id : 0;
        //this.globalObj.microscheduleData = resultData.response.data;
        this.globalObj.successMessage = resultData.response.message;
        setTimeout(() => { this.globalObj.successMessage = ''; }, 4000);
        this.getMicroscheduleList('');
        this.clearForm();
      } else {
        this.globalObj.errorMessage = resultData.response.message;
        setTimeout(() => { this.globalObj.errorMessage = ''; }, 4000);
      }
    });
  }

  getMicroscheduleList(searchData) {
    const listUrl = this.myService.constant.apiURL + 'microschedule_masters/list';
    this.http.post(listUrl, searchData).subscribe(resData => {
      const resultSet: any = resData;
      if (resultSet.response.status == '200') {
        if (resultSet.response.data) {
          this.microscheduleList = resultSet.response.data;
          this.totalRows = this.microscheduleList.length;
        }
      } else {
        this.totalRows = 0;
      }
    });
  }

  editAndUpdateRowValues(rowId = 0) {
    if (rowId > 0) {
      this.microschduleForm.patchValue({
        academic_session_id: '',
        batch_start_date_id: '',
        test_date: '',
        course_mode: '',
        course_name: '',
        course_type: '',
        subject: ''
      });

      const dataUrl = this.myService.constant.apiURL + 'microschedule_masters/getrowdata?id=' + rowId;
      this.http.get(dataUrl).subscribe(resData => {
        const rowResult: any = resData;
        const formData = rowResult.response;
        if (formData) {
          this.id = formData.id;
          let boardValues = formData.board_id + '@@' + formData.lms_boardId;
          let classValues = formData.class_id + '@@' + formData.lms_classId;
          let subjectValues = formData.subject_id + '@@' + formData.lms_subjectId;

          this.getBacthDateDetails(formData.academic_session_id);
          this.setMinTestDate(formData.batch_start_date_id);
          //this.getCourseMode();
         // this.getCourseName();
          this.getCourseType(boardValues);
          this.getSubjectList(classValues);
          this.getWholeSyllabusDetails(subjectValues);
          this.values = JSON.parse(formData.syllabus_data);
          let TestDate = new Date(formData.test_date);
          var testDateYear = TestDate.getFullYear();
          var testDateMonth = TestDate.getMonth() + 1;
          var testDateMonthStr = (testDateMonth > 9) ? testDateMonth : '0' + testDateMonth;
          var testDateDay = TestDate.getDate();
          var testDateDayStr = (testDateDay > 9) ? testDateDay : '0' + testDateDay;
          let testDateStr = testDateYear + '-' + testDateMonthStr + '-' + testDateDayStr;
          this.dp = testDateYear + '-' + testDateMonthStr + '-' + testDateDayStr;
          this.microschduleForm.patchValue({
            id: formData.id,
            academic_session_id: formData.academic_session_id,
            batch_start_date_id: formData.batch_start_date_id,
            test_date: this.dp,
            course_mode: formData.course_mode_id,
            course_name: boardValues,
            course_type: classValues,
            subject: subjectValues
          });

          let topicDetails = [];
          var topicId = 0;
          topicDetails = JSON.parse(formData.syllabus_data);
          if (topicDetails.length > 0) {
            topicDetails.forEach((val, key) => {
              topicId = val.split('###')[0];
              this.topicIdArr.push(val);
            });
          }
        }
      });
    }
  }

  statusUpdate(rowId = 0, statusFlag = '') {
    let vstatus = '';
    if (statusFlag == '1') {
      vstatus = "Active";
    } else {
      vstatus = "Inactive";
    }

    if (confirm('Are you sure to ' + vstatus)) {
      if (rowId > 0) {
        const updateUrl = this.myService.constant.apiURL + 'microschedule_masters/save';
        let toDayStr = this.currentDay.year + '-' + this.currentDay.month + '-' + this.currentDay.day;
        let updateData = { id: rowId, status: statusFlag, updated_by: this.userId, updated_date: toDayStr };

        this.http.post(updateUrl, updateData).subscribe(details => {
          const data: any = details;
          this.globalObj.listMessage = 'Microschedule details ' + vstatus + 'ed  successfully';
          this.getMicroscheduleList('');
          setTimeout(() => { this.globalObj.listMessage = ''; }, 3000);
        });
      } else {
        this.globalObj.listMessage = 'Something went wrong';
        setTimeout(() => { this.globalObj.listMessage = ''; }, 3000);
      }
    }
  }

  openSyllabus(rowAutoId = 0) {
    let syllabusDetails = [];
    this.viewSyllabusList = [];
    this.globalObj.viewSubjectName = '';
    this.globalObj.viewClassName = '';
    var syllabusName = '';
    if (rowAutoId > 0) {
      const detailsUrl = this.myService.constant.apiURL + 'microschedule_masters/getrowdata?id=' + rowAutoId;
      this.http.get(detailsUrl).subscribe(details => {
        const dataSet: any = details;
        if (dataSet.response) {
          
          this.globalObj.viewSubjectName = dataSet.response.subjectData.subject_name;
          this.globalObj.viewClassName = dataSet.response.classData.class_name;
          syllabusDetails = JSON.parse(dataSet.response.syllabus_data);
          if (syllabusDetails.length > 0) {
            syllabusDetails.forEach((val, key) => {
              syllabusName = val.split('###')[1];
              this.viewSyllabusList.push(syllabusName);
            });
          }
        }
      });
    }
    (<any>$("#showpopup")).modal("show");
  }

  clearForm() {
    this.microschduleForm.patchValue(
      {
        id: 0,
        academic_session_id: '',
        batch_start_date_id: '',
        test_date: '',
        course_mode: '',
        course_name: '',
        course_type: '',
        subject: ''
      });
    this.dp = '';
    this.id = 0;
    this.lmsSubjectId = 0;
  }

}
