import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router' 
import { HttpClient } from '@angular/common/http'
import {BackendApiService} from './../../services/backend-api.service';
declare var Chart:any;
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-studentfeedback',
  templateUrl: './studentfeedback.component.html',
  styleUrls: ['./studentfeedback.component.css']
})
export class StudentfeedbackComponent implements OnInit {

    globalObj: any = {};
    negativeDateArr: any = []
    positiveDataArr: any = []
    positiveDateArr: any = []
    negativeDataArr: any = []
    positiveCheckArr: any = []
    negativeCheckArr: any = []
    showGraph: boolean = true
    mylang:any='';
    constructor(private router: Router, private http: HttpClient, private myService: BackendApiService,private translate: TranslateService) {
        this.mylang= window.localStorage.getItem('language');
        if(this.mylang){
          translate.setDefaultLang( this.mylang);}
          else{
            translate.setDefaultLang( 'en');
          }
     }

    ngOnInit() {
        this.globalObj.user_type = localStorage.getItem('user_type');
        if(this.globalObj.user_type.toLowerCase() != 'student') this.router.navigate(["dashboard/main"]);
        this.globalObj.userid = window.localStorage.getItem('user_id');
        this.globalObj.sessionid = window.localStorage.getItem('session_id'); 
        this.globalObj.school_id = window.localStorage.getItem('school_id');
        this.globalObj.school_id = window.localStorage.getItem('school_id');
        this.globalObj.feedbackDeatail = [];
    
        var params = { "user_id": this.globalObj.userid };

        this.http.post(this.myService.constant.apiURL + "student_feedback_remarks/behaviourfeedback", params).subscribe(details => {
            let data : any = details;

            this.globalObj.feedbackDeatail = data.response;
            let positiveSize = this.globalObj.feedbackDeatail.positive.length
            let negativeSize = this.globalObj.feedbackDeatail.negative.length
            for(let i = 0; i<positiveSize; i++) this.positiveCheckArr.push(false)
            for(let i = 0; i<negativeSize; i++) this.negativeCheckArr.push(false)    
           
            this.globalObj.feedbackDeatailOther = this.globalObj.feedbackDeatail;
            this.datewiseData()
        });
    }

    datewiseData(){
        var params = { "user_id": this.globalObj.userid };
        this.http.post(this.myService.constant.apiURL + "student_feedback_remarks/behaviourdatewise", params).subscribe(details => {
            let data : any = details;
            
            this.globalObj.feedbackDatewise = data.response;
            
            this.drawGraph()
        });
    }
  
    drawGraph(): void{ 
        if(!this.globalObj.feedbackDatewise) return;
      
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        let positiveData = [], negativeData = []
       
        for(let unix_timestamp in this.globalObj.feedbackDatewise.positive){
            let d = new Date(+unix_timestamp*1000)
            this.positiveDateArr.push(`${d.getDate()} ${monthNames[d.getMonth()]} `)
            this.positiveDataArr.push(this.globalObj.feedbackDatewise.positive[unix_timestamp])
            const data: TwoDimesionData = {
                date: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`, 
                other_date: `${d.getDate()} ${monthNames[d.getMonth()]} `, 
                frequency: this.globalObj.feedbackDatewise.positive[unix_timestamp],
                type: 'positive'
            }
            positiveData.push(data)
        }

        for(let unix_timestamp in this.globalObj.feedbackDatewise.negative){
            let d = new Date(+unix_timestamp*1000)
            this.negativeDateArr.push(`${d.getDate()} ${monthNames[d.getMonth()]} `)
            this.negativeDataArr.push(this.globalObj.feedbackDatewise.negative[unix_timestamp])
            const data: TwoDimesionData = {
                date: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`, 
                other_date: `${d.getDate()} ${monthNames[d.getMonth()]} `, 
                frequency: this.globalObj.feedbackDatewise.negative[unix_timestamp],
                type: 'negative'
            }
            negativeData.push(data)
        } 

        var uniqueArray = arrArg => {
            return arrArg.filter((elem, pos, arr) => {
              return arr.indexOf(elem) == pos;
            });
        }
        let infoArr = [...positiveData, ...negativeData]
        
        // todo: probably you have to sort infoArr
        let negativeDatArr_1 = [], positiveDatArr_1 = []
        let dateArr = uniqueArray([...this.positiveDateArr, ...this.negativeDateArr])

        infoArr.forEach(obj => {
            if(obj.type == 'negative'){
              negativeDatArr_1.push(obj.frequency)
            }
            else if(obj.type == 'positive'){
             positiveDatArr_1.push(obj.frequency)
            }
          
            console.log(obj)
        })
        
        if(dateArr.length == 0) this.showGraph = false
        let positive_max = Math.max(...this.positiveDataArr)
        let negative_max = Math.max(...this.negativeDataArr)

        let maxsize = ((positive_max > negative_max)? positive_max: negative_max) || 5

        let ctx = document.getElementById("myChart");

        let myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                    labels: dateArr,
                    datasets: [
                    {
                        data: positiveDatArr_1,
                        borderColor: 'green',
                        backgroundColor: 'transparent',
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(0, 255, 0, 0.3)',
                    }, 
                    {
                        data: negativeDatArr_1,
                        borderColor: 'red',
                        backgroundColor: 'transparent',
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(255, 0, 0, 0.3)',
                    }]
              },
            options: {
                legend: {
                    display: false
                },
                // tooltips: {
                //     mode: 'label'
                // },
                responsive: true,
                scales: {
                    yAxes: [{
                      scaleLabel: {
                          display: true,
                          labelString: "---------- "+this.translate.instant("Frequency")+" ----------"  
                      }, 
                      ticks: { 
                          min: 0,
                          max: maxsize,
                          userCallback: function(label, index, labels) {
                              if (Math.floor(label) === label) {
                                  return label;
                              }
         
                          },
                      }
                    }],
                    xAxes: [{
                      scaleLabel: {
                          display: true,
                          labelString: "---------- "+this.translate.instant("Date Range")+" ----------"  
                      }
                    }]
                  },
                //   elements: {
                //       line: {
                //           tension: 0, 
                //       }
                //   }
            }
        });
    }

    accodfunc(index, type){
        if(type.toLowerCase() == 'positive') this.positiveCheckArr[index] = !this.positiveCheckArr[index]
        else this.negativeCheckArr[index] = !this.negativeCheckArr[index]
    }

}

interface TwoDimesionData{
    date: string,
    frequency: number,
    other_date: string,
    type: string
}
