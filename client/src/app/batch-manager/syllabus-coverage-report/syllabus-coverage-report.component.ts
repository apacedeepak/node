import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import  { TranslateService } from '@ngx-translate/core';
import { BatchService } from '../services/batch.service';

@Component({
  selector: 'app-syllabus-coverage-report',
  templateUrl: './syllabus-coverage-report.component.html',
  styleUrls: ['./syllabus-coverage-report.component.css']
})
export class SyllabusCoverageReportComponent implements OnInit {
  public chartData: any;
  public mylang: any = '';
  public syllabus:any=[];
  public coverage:any=[];
  public syllabusCoverage:any=[];
  public totalTopic:number=0;
  public coveredTopic:number=0;
  public pendingTopic:number=0;
  public subjectName:string='All';
  constructor(private translate:TranslateService,private route:ActivatedRoute,private batchService:BatchService) {

    this.mylang=window.localStorage.getItem('language');
    if(this.mylang) {

      translate.setDefaultLang(this.mylang);
    } else{
      translate.setDefaultLang('en');
    }
   }

  ngOnInit() {

      this.getSyllabusCoverage('');

  }

  getSyllabusCoverage(subjecId){
    var params:any={};
    params.section_id=this.route.snapshot.paramMap.get('sectionId');
    params.course_mode_id=this.route.snapshot.paramMap.get('courseModeId');
    params.board_id=this.route.snapshot.paramMap.get('boardId');
    params.class_id=this.route.snapshot.paramMap.get('classId');
    params.batch_start_date_id=this.route.snapshot.paramMap.get('batchStartDateId');
    params.subject_id=subjecId;
    this.batchService.getSyllabusCoverage(params)
      .subscribe(
        result=>{
          this.syllabus=[];this.coverage=[];this.syllabusCoverage=[];
            for(let res of result.response.data) {
              if(res.syllabus) this.syllabus=res.syllabus;
              if(res.coverage) this.coverage=res.coverage;
            }
            var percentCoverage=Math.round((this.coverage.length*100)/this.syllabus.length);
            var percentPending=100-percentCoverage;
            this.totalTopic=this.syllabus.length;
            this.coveredTopic=this.coverage.length;
            this.pendingTopic=parseInt(this.syllabus.length)-parseInt(this.coverage.length);
            this.chartData = {
              labels: ['Covered Syllabus','Pending Syllabus'],
              datasets: [
                  {
                      data: [percentCoverage,percentPending],
                      backgroundColor: [
                          "#36A2EB",
                          "#FF6384"
                          
                      ],
                      hoverBackgroundColor: [
                          "#36A2EB",
                          "#FF6384"
                         
                      ]
                  }]    
              };
        
            var coverageArr:any=[];
            for(let item of this.coverage) {
              coverageArr.push(item.topicId);
            }

            for(let syllabus of this.syllabus) {

              var syllabusArr = syllabus.split('###');
              let syllabusObj:any={};
              syllabusObj.topicId=syllabusArr[0];
              syllabusObj.topicName=syllabusArr[1];
              syllabusObj.status='Pending';
              syllabusObj.completeDate='';
              syllabusObj.facultyName='';
              for(let item of this.coverage) {
                if(syllabusArr[0]==item.topicId) {
                  syllabusObj.status='Completed';
                  syllabusObj.completeDate=item.test_date;
                  syllabusObj.facultyName=item.user.user_name;
                }
              }
              this.syllabusCoverage.push(syllabusObj);

            }
            

        },
        error=>{}

      );
  }

}
