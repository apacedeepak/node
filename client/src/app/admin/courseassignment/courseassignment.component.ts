import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params } from "@angular/router";

@Component({
  selector: 'app-courseassignment',
  templateUrl: './courseassignment.component.html',
  styleUrls: ['./courseassignment.component.css']
})
export class CourseassignmentComponent implements OnInit {

  courseForm: FormGroup;
  frmArray: FormArray;
  public successMessage: any = {};
  public errorMessage: any = {};
  public boardList: any = {};
  public boardData: any = {};
  public globalObj:any = {};
  public boardListArr: any = {};
  mylang: any = '';

  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService, private activatedRoute: ActivatedRoute, private fb: FormBuilder) {
    this.mylang = window.localStorage.getItem('language');
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    }
    else {
      translate.setDefaultLang('en');
    }
  }

  ngOnInit() {

    this.frmArray = new FormArray([]);

    this.getFromSet();

    this.getBoardList();

    this.getAllAssignBoardList();

  }

  getFromSet() {
    this.courseForm = new FormGroup({
      status: this.frmArray,
    });
  }

  assignCourse(value) {

    let today = new Date();
    var tempBoardArray:any=[];
    var dbBoardData:any = [];
   
    var k=0;
    for(k=0;k<value.status.length;k++){
      if(value.status[k]){
        // collect data of check boxes if checked...
        tempBoardArray.push({
          board_id: this.boardList[k].board_id,
          board_name : this.boardList[k].board_name,
        });
      }
    }
   
    var j=0;
    for(j=0;j<this.boardData.length;j++){
      if(this.boardData[j]){
        dbBoardData.push(this.boardData[j].boardId);
      }
    }

    var paramArr = {
      'postvalue' : tempBoardArray,
      'dbvalue' : dbBoardData
    };
    this.http.post(this.myService.constant.apiURL + "boards/assignunassigncourse", paramArr).subscribe(data => {
      const detail:any = data;
      this.successMessage.message = detail.response.message;
      setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
      this.getFromSet();
    });
  }

  /*
  * Get All Board list from LMS
  */
  getBoardList() {
    this.http.get(this.myService.constant.apiURL + "lmsapis/boardlist").subscribe(data => {
      const detail: any = data;
      this.boardList = detail.response.data;
      this.globalObj.board = this.boardList;
      this.boardList.forEach(data => {
        this.frmArray.push(new FormControl(''));
      });
    });
  }

  /*
  * Get All Active Board List
  */
  getAllAssignBoardList(){
    this.http.get(this.myService.constant.apiURL+"boards/getallboard").subscribe(data => {
      const detail:any = data;
      this.boardData = detail.response;

      this.http.get(this.myService.constant.apiURL + "lmsapis/boardlist").subscribe(data => {
        const detail: any = data;
        this.boardListArr = detail.response.data;

        var boardActiveData= this.boardData.filter(data=>data.status=="Active");

        this.boardListArr.forEach( (boardArr, i) => {
          let rUrl =function(url) {return url.boardId==boardArr.board_id}
          if(boardActiveData.find(rUrl)){
             (<FormArray>this.courseForm.get("status")).controls[i].setValue(true);
             (<FormArray>this.courseForm.get("status")).controls[i].disable();
           }
        });
      });
    });
  }

}
