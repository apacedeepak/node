import { Component, OnInit } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ChartService } from './../../services/chart.service';

@Component({
  selector: 'app-weeklytestperformance',
  templateUrl: './weeklytestperformance.component.html',
  styleUrls: ['./weeklytestperformance.component.css']
})
export class WeeklytestperformanceComponent implements OnInit {

  constructor(private http: HttpClient, private myService: BackendApiService, activatedRoute: ActivatedRoute, private chart: ChartService) { 
    this.chart.getChart();    
  }

  public globalObj : any = {};
  public usertype: any = '';
  public userid: any = '';
  public sessionid: any = '';
  public result: any;
  public responsedataall: any;
  public ApiUrl = 'iitjeereports/weeklytestperformance';
  public scoreInfoObj : any = {};
  public rankInfoObj : any = {};
  public subjectWiseScoreObj : any = {};
  public experAdviceObj : any = {};

  doughnoutoptionsscore: any;
  public scoreData: any = {};

  doughnoutoptionssubject: any;
  public subjectData: any = {};

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
      "type": "fullreport",
      "paper_type":10
    };
    
    this.http.post(this.myService.constant.apiURL + this.ApiUrl, params).subscribe(details => {
      this.responsedataall = details;
      this.result = this.responsedataall.response;
      
      this.scoreInfoObj = this.result.score_info;
      this.rankInfoObj = this.result.rank_info;
      this.subjectWiseScoreObj = this.result.subject_wise_score;
      this.experAdviceObj = this.result.expert_advice;
      //console.log(this.subjectWiseScoreObj);
      
      let colorarr = [];
      colorarr = [ "#844fe8","#dddddd"];

      /* Score Info Wise Graph */
      this.scoreData = {
        labels: ['Total', 'Obtained'],
        datasets: [
            {
                data:[this.scoreInfoObj.total_score, this.scoreInfoObj.score_obtained],
                backgroundColor: colorarr,
                hoverBackgroundColor: colorarr
            }]    
      };
    
      this.doughnoutoptionsscore ={
        cutoutPercentage: 70,
        legend: {
            display: false
        },
        responsive: true,
        elements: {
            center: {
                text: this.scoreInfoObj.score_obtained+"/"+this.scoreInfoObj.total_score,
                color: '#000000', 
                fontStyle: 'Arial', 
                sidePadding: 60,
                fontSize: 16
            }
        }
      };

      /* Subject Analysis wise Graph*/
     
      this.subjectWiseScoreObj.forEach((subject, key) => {
        
        this.subjectData = {
          labels: ['Total', 'Obtained'],
          datasets: [
              {
                  data:[subject.total_score, subject.score_obtained],
                  backgroundColor: colorarr,
                  hoverBackgroundColor: colorarr
              }]    
        };

        this.subjectWiseScoreObj[key]['subject_data'] = this.subjectData;

        this.doughnoutoptionssubject ={
          cutoutPercentage: 70,
          legend: {
              display: false
          },
          responsive: true,
          elements: {
              center: {
                  text: subject.score_obtained+"/"+subject.total_score,
                  color: '#000000', 
                  fontStyle: 'Arial', 
                  sidePadding: 60,
                  fontSize: 16
              }
          }
        };
        this.subjectWiseScoreObj[key]['subject_option'] = this.doughnoutoptionssubject;
      });
    });

  }

}
