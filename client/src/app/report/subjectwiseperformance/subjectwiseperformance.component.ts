import { Component, OnInit } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ChartService } from './../../services/chart.service';

@Component({
  selector: 'app-subjectwiseperformance',
  templateUrl: './subjectwiseperformance.component.html',
  styleUrls: ['./subjectwiseperformance.component.css']
})
export class SubjectwiseperformanceComponent implements OnInit {

  constructor(private http: HttpClient, private myService: BackendApiService, activatedRoute: ActivatedRoute, private chart: ChartService) {
    this.chart.getChart();
   }

  public globalObj : any = {};
  public usertype: any = '';
  public userid: any = '';
  public sessionid: any = '';
  public result: any;
  public responsedataall: any;
  public ApiUrl = 'iitjeereports/subjectwiseweeklytestreport';
  public scoreInfoObj : any = {};
  public rankInfoObj : any = {};
  public subjectWiseScoreObj : any = {};
  public experAdviceObj : any = {};

  doughnoutoptionsscore: any;
  public scoreData: any = {};

  public subjectWiseReport: any = {};
  public subjectArr = [];

  doughnoutoptionsdifficulty: any;
  public difficultyData: any = {};

  ngOnInit() {

    this.usertype = window.localStorage.getItem('user_type');
    if (this.usertype == 'Parent') {
      this.userid = window.localStorage.getItem('student_user_id');
    } else {
      this.userid = window.localStorage.getItem('user_id');
    }
    this.sessionid = window.localStorage.getItem('session_id');

    const params = {
      "weeklytest_Id":113,
      "user_id":14029919,
      "student_type":2,
      "type": "subjectwise",
      "paper_type":10
    };

    this.http.post(this.myService.constant.apiURL + this.ApiUrl, params).subscribe(details => {
      this.responsedataall = details;
      this.result = this.responsedataall.response;

      this.getsubjectwisedetail(this.result);
    });

  }

  getsubjectwisedetail(result){
    this.subjectWiseReport = result.subject_wise_report;
    
    this.globalObj.graph_title = result.graph_title;
    this.globalObj.info_text = result.info_text;
    this.globalObj.paper_name = result.paper_name;
    this.globalObj.paper_type = result.paper_type;
    this.globalObj.sub_heading = result.sub_heading;
    
    let colorarr = [];
    colorarr = [ "#844fe8","#dddddd"];

    this.subjectWiseReport.forEach((detail, key) => {

      let subjectObj = {
       'subject_id' : detail.subject_id,
       'subject_name' : detail.subject_name
      }
      this.subjectArr.push(subjectObj);

      /* Score Graph */
      this.scoreData = {
        labels: ['Total', 'Obtained'],
        datasets: [
            {
                data:[detail.rank_info.total_rank, detail.rank_info.get_rank],
                backgroundColor: colorarr,
                hoverBackgroundColor: colorarr
            }]    
      };
      this.subjectWiseReport[key]['score_data'] = this.scoreData;

      this.doughnoutoptionsscore ={
        cutoutPercentage: 70,
        legend: {
            display: false
        },
        responsive: true,
        elements: {
            center: {
                text: detail.rank_info.get_rank+"/"+detail.rank_info.total_rank,
                color: '#000000', 
                fontStyle: 'Arial', 
                sidePadding: 60,
                fontSize: 16
            }
        }
      };
      this.subjectWiseReport[key]['score_option'] = this.doughnoutoptionsscore;

      /* Difficulty Graph*/
      var resultData = [];
      var resultOption = [];
      detail.perfromance_difficulty.forEach((difficult, key1) => {
      
        this.difficultyData = {
          labels: ['Correct', 'Skipped', 'Incorrect'],
          datasets: [
              {
                  data:[difficult.correct_questions, difficult.skipped_questions, difficult.incorrect_questions],
                  backgroundColor: difficult.color_code,
                  hoverBackgroundColor: difficult.color_code
              }]    
        };
        resultData[key1]= this.difficultyData;
        
        this.doughnoutoptionsdifficulty ={
          cutoutPercentage: 70,
          legend: {
              display: false
          },
          responsive: true,
          elements: {
              center: {
                  text: difficult.question_type,
                  color: '#000000', 
                  fontStyle: 'Arial', 
                  sidePadding: 60,
                  fontSize: 16
              }
          }
        };
        resultOption[key1]= this.doughnoutoptionsdifficulty;
      });

      this.subjectWiseReport[key]['difficulty_data'] = resultData;
      this.subjectWiseReport[key]['difficulty_option'] = resultOption;

    });
    
      console.log(this.subjectWiseReport);

  }

}
