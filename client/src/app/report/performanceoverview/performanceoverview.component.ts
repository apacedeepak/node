import { Component, OnInit } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';


@Component({
  selector: 'app-performanceoverview',
  templateUrl: './performanceoverview.component.html',
  styleUrls: ['./performanceoverview.component.css']
})
export class PerformanceoverviewComponent implements OnInit {

  constructor(private http: HttpClient, private myService: BackendApiService, activatedRoute: ActivatedRoute) { 
   
  }

  public globalObj : any = {};
  public expertAdvice: any;
  public subjectReport: any;
  public trends: any;
  public responsedataall: any;
  public ApiUrl = 'iitjeereports/performanceoverviewweekly';
  public performanceData: any = {};
  public testTaken: any = {};
  public questionStatus: any = {};
  public testData: any = {};
  public data:any;
  public testOption: any = {};

  ngOnInit() {

    const params = {
      "user_id":14029919,
      "student_type":2,
      "board_id" :"439",
      "type": "overallperformance",
      "paper_type":10
    };

    this.http.post(this.myService.constant.apiURL + this.ApiUrl, params).subscribe(details => {
      this.responsedataall = details;
       
      this.performanceData = this.responsedataall.response.overall_performance.weekly_test_analysis;
      this.expertAdvice = this.performanceData.expert_advice;
      this.subjectReport = this.performanceData.subject_wise_report;
      this.trends = this.performanceData.trend;
      this.testTaken = this.performanceData.test_status;
      this.questionStatus = this.performanceData.question_status;

      this.questionStatus.correctPercent=Math.round((this.questionStatus.correct_question_count*100)/this.questionStatus.total_questions);
      console.log(this.questionStatus);

      var labels:any=[];
      var data:any=[];

      this.trends.forEach((detail, key) => {
        
        let keyIndex=key+1;
        let labelName='Test '+keyIndex;
        labels.push(labelName);
        data.push(detail.user_performance);
            
      });

      this.testOption = {
         
        legend: {
            display: true
        },
        labels: {
          fontSize:10
        },
        responsive: true,
        scaleShowValues: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [{
            ticks: {
              autoSkip: false,
              
            }
          }]
        }
        
      };

      this.data = {
        labels: labels,
        datasets: [
            {
                label: 'Your Performance',
                data: data,
                fill: false,
                borderColor: '#844fe8'
            }
            
        ]
      }

      //console.log(this.performanceData);
    });

  }

}
