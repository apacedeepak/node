import { Component, OnInit } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NgForm, FormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';

@Component({
  selector: 'app-questionsubjectanalysis',
  templateUrl: './questionsubjectanalysis.component.html',
  styleUrls: ['./questionsubjectanalysis.component.css']
})
export class QuestionsubjectanalysisComponent implements OnInit {

  public globalObj : any = {};
  public usertype: any = '';
  public userid: any = '';
  public sessionid: any = '';
  public ApiUrl = 'iitjeereports/questionsubjectanalysis';
  public result: any;
  public responsedataall: any;
  public easyArr: any;
  public mediumArr: any;
  public dificultyArr: any;
  

  constructor(private http: HttpClient, private myService: BackendApiService, activatedRoute: ActivatedRoute) { }

  ngOnInit() {

    this.usertype = window.localStorage.getItem('user_type');
    if (this.usertype == 'Parent') {
      this.userid = window.localStorage.getItem('student_user_id');
    } else {
      this.userid = window.localStorage.getItem('user_id');
    }
    this.sessionid = window.localStorage.getItem('session_id');
    
    const params = {
      "weeklytest_Id":77,
      "user_id":14029919,
      "student_type":1,
      "type": "difficulty",
      "paper_type":10,
      "paper_id":125,
      "subject_id":438331
    };

    this.http.post(this.myService.constant.apiURL + this.ApiUrl, params).subscribe(details => {
      this.responsedataall = details;
      this.result = this.responsedataall.response;
      this.easyArr = this.result.difficulty_level_question_detail.Easy;
      this.mediumArr = this.result.difficulty_level_question_detail.Moderate;
      this.dificultyArr = this.result.difficulty_level_question_detail.Difficult;
    });


  }

}
