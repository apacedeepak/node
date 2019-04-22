import { Component, OnInit } from '@angular/core';
import  { TranslateService } from '@ngx-translate/core';
import { FormControl,FormGroup,FormBuilder,Validators} from '@angular/forms';
import  { BatchService } from '../services/batch.service';

@Component({
  selector: 'app-batch-summary-report',
  templateUrl: './batch-summary-report.component.html',
  styleUrls: ['./batch-summary-report.component.css']
})
export class BatchSummaryReportComponent implements OnInit {
  public successMessage:any={};
  public errorMessage:any={};
  public mylang: any = '';
  private userId='';
  public schools:any=[];
  public batches:any=[];
  public courseModes:any=[];
  public courses:any=[];
  public courseTypes:any=[];
  public batchSummaryReport:FormGroup;
  
  constructor(private translate:TranslateService,private fb:FormBuilder,private batchService:BatchService) { 

    this.mylang=window.localStorage.getItem('language');
    if(this.mylang) {

      translate.setDefaultLang(this.mylang);
    } else{
      translate.setDefaultLang('en');
    }

  }

  ngOnInit() {
    this.userId=localStorage.getItem('user_id');

    this.batchSummaryReport=this.fb.group({
      school_id:['',Validators.required],
      course_mode:['',Validators.required],
      course_id:['',Validators.required],
      course_type:['',Validators.required],
      batch_name:['',Validators.required],


    });
    this.getUserSchools();
    this.getCourseMode();
    this.getCourse();
    let params={};
    this.getBatchSummaryReport(params);

  }

  getUserSchools() {
    let params={
      "userId": this.userId
    }
    this.batchService.getUserSchools(params).
    subscribe(
      data=>{
        this.schools=data.response;
      },
      error=>{

      }
    )

  }

  getCourseMode() {
    this.batchService.getCourseMode().
    subscribe(
      data=>{
        this.courseModes=data.response;
      },
      error=>{

      }
    )
  }


  getCourse() {
    this.batchService.getCourse().
    subscribe(
      data=>{
        this.courses=data.response;
      },
      error=>{

      }
    )
  }

  getCourseType(schoolId,couserId) {
    let params = {
      "boardId": couserId,
      "school_id": schoolId
    }
    this.batchService.getCourseType(params).
    subscribe(
      data=>{
        this.courseTypes=data.response;
      },
      error=>{

      }
    )
  }


  getBatchSummaryReport(data) {
    console.log(data);
    
    this.batchService.getSectionList(data).
    subscribe(
      data=>{
        this.batches=data.response;
      },
      errer=>{

      }
    )

  }

}
