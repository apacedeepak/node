import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, FormControlName } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { element } from 'protractor';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
  selector: 'app-batch-create',
  templateUrl: './batch-create.component.html',
  styleUrls: ['./batch-create.component.css']
})
export class BatchCreateComponent implements OnInit {

  manageBatchForm: FormGroup;
  public dp: any = '';
  public id: any = 0;
  public userId: any;
  public centerId: any;
  public currentDate: any;
  public academicSessionId: any;
  public globalObj: any = {};
  public courseModeStr: any = '';
  public classNameStr: any = '';
  mylang: any = '';
  page: number = 1;

  constructor(private myService: BackendApiService, private http: HttpClient, private translate: TranslateService) {
    const today = new Date();
    this.currentDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };

    this.mylang = window.localStorage.getItem('language');
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang('en');
    }

  }


  ngOnInit() {
    this.userId = window.localStorage.getItem('user_id');
    this.centerId = window.localStorage.getItem('school_id');
    this.setFormFiels();
    this.getSessionList(this.centerId);
    //this.getAcademicSessionList();
    this.getCenterRoomList(this.centerId);
    this.getBatchSummary(this.centerId);
  }

  setFormFiels() {
    this.manageBatchForm = new FormGroup({
      id: new FormControl(''),
      academic_session_id: new FormControl('', Validators.required),
      batch_start_date_id: new FormControl('', Validators.required),
      course_mode: new FormControl('', Validators.required),
      course_name: new FormControl('', Validators.required),
      course_type: new FormControl('', Validators.required),
      room_id: new FormControl('', Validators.required),
      batch_name: new FormControl('', Validators.required),
      status: new FormControl('')
    });
  }

  getSessionList(centerId = 0) {
    const sessionInputData = { schoolId: centerId };
    const sessionListUrl = this.myService.constant.apiURL + 'sessions/getallsession';
    this.http.post(sessionListUrl, sessionInputData).subscribe(resdata => {
      const sessionResult: any = resdata;
      if (sessionResult.response) {
        this.globalObj.sessionList = sessionResult.response;
        this.getCourseMode();
        this.getCourseName();
      }

    });
  }

  getBacthDateDetails(sessionId = 0) {
    this.manageBatchForm.get('batch_start_date_id').setValue('');
    if (sessionId > 0) {
      const batchDateInputs = { session_id: sessionId };
      const batchDatetUrl = this.myService.constant.apiURL + 'batch_date_masters/sessionbatchstartdates';
      this.http.post(batchDatetUrl, batchDateInputs).subscribe(batchDateData => {
        const batchDateresult: any = batchDateData;
        this.globalObj.batchDateList = batchDateresult.response.data;
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
        this.globalObj.courseNameList = courseNameResult.response;
      } else {
        this.globalObj.courseNameList = '';
      }
    });
  }

  getCourseType(courseId = 0) {
    this.manageBatchForm.get('course_type').setValue('');
    if (courseId) {
      const courseTypeInputs = { where: { schoolId: this.centerId, boardId: courseId, status: 'Active' } };
      const courseTypeUrl = this.myService.constant.apiURL + 'classes/getboardclasses';
      this.http.post(courseTypeUrl, courseTypeInputs).subscribe(courseTypeData => {
        const courseTypeResult: any = courseTypeData;
        if (courseTypeResult.response) {
          this.globalObj.courseTypeList = courseTypeResult.response;
        } else {
          this.globalObj.courseTypeList = '';
        }
      });
    }
  }

  getCenterRoomList(centerId = 0) {
    if (centerId > 0) {
      const roomInputs = { where: { schoolId: centerId, status: 'Active' } };
      const roomUrl = this.myService.constant.apiURL + 'center_room_masters/list';
      this.http.post(roomUrl, roomInputs).subscribe(roomData => {
        const roomResult: any = roomData;
        if (roomResult.response.data) {
          this.globalObj.centerRoomList = roomResult.response.data;
          this.globalObj.totalRows = roomResult.response.data.length;
        } else {
          this.globalObj.centerRoomList = [];
          this.globalObj.totalRows = 0;
        }
      });
    } else {
      this.globalObj.centerRoomList = '';
    }
  }

  getBatchSummary(schoolId = 0) {
    this.globalObj.batchSummary = [];
    let batchInputs = { school_id: schoolId };
    const batchListUrl = this.myService.constant.apiURL + 'sections/batchsummary';
    this.http.post(batchListUrl, batchInputs).subscribe(batchDetails => {
      const resultData: any = batchDetails;
      this.globalObj.status = resultData.response.status;
      console.log(resultData);
      if (resultData.response.status === '200') {
        if (resultData.response.data) {
          let result = resultData.response.data;
          result.forEach((val, key) => {
            let sessionName: any = '';
            if (val.sessionData) {
              sessionName = (val.sessionData.session_name) ? val.sessionData.session_name : 'NA';
            } else { 
              sessionName = 'NA';
            }
            var boardName = (val.board.board_name) ? val.board.board_name : 'NA';
            var batchStartDate = (val.startdateData.batch_start_date) ? val.startdateData.batch_start_date : 'NA';
            var roomName = (val.roomData.room_name) ? val.roomData.room_name : 'NA';
            var seatingCapacity = (val.roomData.sitting_capacity) ? val.roomData.sitting_capacity : 'NA';
            var totalStudents = (val.userData) ? val.userData.length : 0;

            this.globalObj.batchSummary[key] = {
              id: val.id,
              section_name: val.section,
              session_name: sessionName,
              batch_start_date: batchStartDate,
              course_mode: val.stream_name,
              board_name: boardName,
              class_name: val.class_name,
              room_name: roomName,
              seating_capacity: seatingCapacity,
              total_students: totalStudents,
              status: val.status
            };

          });
        }
        //console.log(this.globalObj.batchSummary);
      } else {
        this.globalObj.listmessage = resultData.response.message;
        this.globalObj.batchSummary = [];
      }
    });

  }

  batchEdit(sectionId = 0) {

    let isConfirm = confirm('Are you sure to update this record?');
    if (isConfirm) {
      $('html,body').animate({ scrollTop: $('#mainContent').offset().top }, 'slow');
      this.manageBatchForm.patchValue({
        id: 0, academic_session_id: '', batch_start_date_id: '', course_mode: '', course_name: '',
        course_type: '', batch_name: '', room_id: '', status: ''
      });
      let sectionData = { section_id: sectionId };
      let sectionUrl = this.myService.constant.apiURL + 'sections/sectionbyid';
      this.http.post(sectionUrl, sectionData).subscribe(secDetails => {
        const secResult: any = secDetails;
        let dataSet = secResult.response;
        if (dataSet.id && dataSet.id > 0) {
          this.getBacthDateDetails(dataSet.session_id);
          this.getCourseType(dataSet.boardId);
          this.id = dataSet.id;
          this.manageBatchForm.patchValue(
            {
              id: dataSet.id,
              academic_session_id: dataSet.session_id,
              batch_start_date_id: dataSet.batch_start_date_id,
              course_mode: dataSet.course_mode_id,
              course_name: dataSet.boardId,
              course_type: dataSet.classId,
              batch_name: dataSet.section,
              room_id: dataSet.room_id,
              status: dataSet.status
            });
        } else {
          this.globalObj.message = 'Something went wrong.';
          setTimeout(() => { this.globalObj.message = ''; }, 3000);
        }
      });
    } else {
      return false;
    }
  }

  clearForm() {
    this.manageBatchForm.patchValue(
      {
        id: 0,
        academic_session_id: '',
        batch_start_date_id: '',
        course_mode: '',
        course_name: '',
        course_type: '',
        batch_name: '',
        room_id: ''
      });
    this.id = 0;
  }

  onSubmitDetail(formValue) {
    //console.log(formValue);
    var sectionStr = '';
    var sectionName = '';
    var streamName = '';
    var className = '';
    var postData: any = {};
    var roomCapacity = 0;
    this.id = (formValue.id > 0) ? formValue.id : 0;
    var monthStr = (this.currentDate.month > 9) ? this.currentDate.month : '0' + this.currentDate.month;
    var dayStr = (this.currentDate.day > 9) ? this.currentDate.day : '0' + this.currentDate.day;
    let dateStr = this.currentDate.year + '-' + monthStr + '-' + dayStr;

    postData = {
      schoolId: this.centerId,
      section_name: sectionName,
      stream_name: streamName,
      class_name: className,
      class_order: 0,
      section_seats: 0,
      session_id: formValue.academic_session_id,
      batch_start_date_id: formValue.batch_start_date_id,
      course_mode_id: formValue.course_mode,
      boardId: formValue.course_name,
      classId: formValue.course_type,
      room_id: formValue.room_id,
      section: formValue.batch_name,
      added_by: this.userId,
      added_date: dateStr,
      status: 'Active'
    };

    if (this.id > 0) {
      postData = {
        schoolId: this.centerId,
        section_name: sectionName,
        stream_name: streamName,
        class_name: className,
        session_id: formValue.academic_session_id,
        batch_start_date_id: formValue.batch_start_date_id,
        course_mode_id: formValue.course_mode,
        boardId: formValue.course_name,
        classId: formValue.course_type,
        room_id: formValue.room_id,
        section: formValue.batch_name,

        updated_by: this.userId,
        updated_date: dateStr,
        status: formValue.status,
        id: formValue.id
      };
    }

    if (postData) {
      const batchUrl = this.myService.constant.apiURL + 'sections/savebatchdetails';
      this.http.post(batchUrl, postData).subscribe(resData => {
        const batcResult: any = resData;
        let dataSet = batcResult.response;

        if (dataSet.status == '201') {
          this.globalObj.errorMessage = dataSet.message;
          setTimeout(() => { this.globalObj.errorMessage = ''; }, 3000);
        } else {
          //console.log(dataSet);
          if (dataSet.data.id > 0) {
            var msg = (this.id > 0) ? "Batch details updated successfully." : "Batch Created successfully.";

            this.getBatchSummary(this.centerId);
            this.globalObj.message = msg;
            setTimeout(() => { this.globalObj.message = ''; }, 3000);
            this.clearForm();
          } else {
            this.globalObj.errorMessage = "Something went wrong.";
            setTimeout(() => { this.globalObj.errorMessage = ''; }, 3000);
          }
        }
      });
    }







  }
  // =================================== Class End Here ========================================//
}
