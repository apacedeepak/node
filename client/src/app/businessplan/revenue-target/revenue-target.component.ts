import { Component, OnInit } from '@angular/core';
import  { TranslateService } from '@ngx-translate/core';
import { FormControl,FormGroup,FormBuilder,Validators} from '@angular/forms';
import { BusinessplanService } from '../services/businessplan.service';

@Component({
  selector: 'app-revenue-target',
  templateUrl: './revenue-target.component.html',
  styleUrls: ['./revenue-target.component.css']
})
export class RevenueTargetComponent implements OnInit {

  public successMessage:any={};
  public errorMessage:any={};
  private userId='';
  public schoolId='';
  public sessionId='';
  public month='';
  public schoolSessions: any = [];
  public months:any=[];
  public years:any=[];
  public revenueMonthTargets:any=[];
  public mylang: any = '';
  public revenueMonthTargetForm:FormGroup;
  public addRevenueTargetForm:FormGroup;
  public submitted:boolean=false;
  
  constructor(private translate:TranslateService,private fb:FormBuilder,private businessplanService:BusinessplanService) { 
    this.mylang= window.localStorage.getItem('language');
      if(this.mylang){
        translate.setDefaultLang( this.mylang);
      }
      else{
        translate.setDefaultLang( 'en');
      }


  }

  ngOnInit() {
    this.schoolId=localStorage.getItem('school_id');
    this.userId=localStorage.getItem('user_id');
    this.revenueMonthTargetForm=this.fb.group({
      session_id:['',Validators.required],
      school_id:[this.schoolId,Validators.required],
      year:['',Validators.required],
      month:['',Validators.required]
      
    });
    
    this.getSchoolSessions();
    
    }

    getSchoolSessions() {

      let param={"schoolId":this.schoolId}
      this.businessplanService.getSchoolSessions(param)
      .subscribe (
        data=> {
          this.schoolSessions=data.response;
          
        },
        error=> {
  
        }
          
      );
  
    }
  
   get f() { return this.revenueMonthTargetForm.controls; }


  revenueMonthTarget(data) {
    this.submitted = true;
    if (this.revenueMonthTargetForm.invalid) {
       return;
    }
    this.errorMessage.message='';

    this.sessionId=data.session_id;
    this.month=data.year+data.month;
    this.revenueMonthTargets = [];
    let params:any={};
    params.session_id=data.session_id;
    params.month=data.year+data.month;
    params.school_id=data.school_id;
    this.businessplanService.getRevenueMonthTarget(params).
    subscribe(
      res=>{
       
        this.addRevenueTargetForm=this.fb.group({
          
          admission_target:['',Validators.required],
          discount_target:['',Validators.required]
          
        });
       
        
        for(let reponse of res.response) {
          if(reponse.fee_strcuture_map_term_master.length > 0) {
          reponse["revenue_target"] =0;
          reponse["status"] ='';
          reponse["action"] ='Generate';
          reponse["admission_target"] ='';
          reponse["discount_target"] ='';
          reponse["revenue_id"] =0;

          if(reponse.fee_revenue_target.length > 0 ) {
            var revenueTarget=0;
            if(reponse.revenue_target_fee_term.length > 0) {
              for(let revenueFeeTerm of reponse.revenue_target_fee_term) {
                revenueTarget=revenueTarget+parseInt(revenueFeeTerm.amount);
              }
            }

            reponse["revenue_target"] =revenueTarget;
            reponse["status"] =reponse.fee_revenue_target[0].status;
            reponse["admission_target"] =reponse.fee_revenue_target[0].admission_target;
            reponse["discount_target"] =reponse.fee_revenue_target[0].discount_target;
            reponse["revenue_id"] =reponse.fee_revenue_target[0].id;
            reponse["action"] ='Update';
          }
          
          reponse["session_id"] =data.session_id;
          reponse["month"] =data.month;
          this.revenueMonthTargets.push(reponse);
        }     

        }

        if(this.revenueMonthTargets.length < 1) { this.errorMessage.message="Fee data not configured for this session"}
        


      },
      error=>{

      }

    );

  }


  addRevenueTarget(data,feeStructureId,revenueId,admissionTarget,discountTarget) {

    if(revenueId > 0) {
       data["id"]=revenueId;
      if(data.admission_target=="") 
        data["admission_target"]=admissionTarget;
      if(data.discount_target=="") 
        data["discount_target"]=discountTarget;
    } else {
      data['status']='Pending';
    } 
    data["school_id"]=this.schoolId;
    data["session_id"]=this.sessionId;
    data["month"]=this.month;
    data["fee_structure_id"]=feeStructureId
    data["added_by"]=this.userId;

    //console.log(data);

    this.businessplanService.addRevenueTarget(data).
    subscribe(
      res=>{

        if(res.response_status.status=='200') {

          for (var i = 0; i < this.revenueMonthTargets.length; i++) {
            if (this.revenueMonthTargets[i].id === res.response.fee_structure_id) {
              this.revenueMonthTargets[i].revenue_target = res.response.revenue_target;
              this.revenueMonthTargets[i].admission_target = res.response.admission_target;
              this.revenueMonthTargets[i].discount_target = res.response.discount_target;
              this.revenueMonthTargets[i].status = res.response.status;
              this.revenueMonthTargets[i].revenue_id = res.response.id;
              this.revenueMonthTargets[i].action = 'Update';
              break;
            }
          }
          
        }


      },
      error=>{

      }
      
    );


  }

    

  getMonth(event:Event) {

   let selectedOptions = event.target['options'];
   let selectedIndex = selectedOptions.selectedIndex;
   let selectElementValue = selectedOptions[selectedIndex].value;
   this.years=[];
    for(let schoolSession of this.schoolSessions) {

        if(schoolSession.id==selectElementValue) {
         
          var sessionStartDate = new Date(schoolSession.start_date);
          this.years.push(sessionStartDate.getFullYear() - 1);
          this.years.push(sessionStartDate.getFullYear() )
          this.years.push(sessionStartDate.getFullYear() + 1)

        }
    }

  
   this.months=[
     {"val":"01","name":"Jan"},
     {"val":"02","name":"Feb"},
     {"val":"03","name":"March"},
     {"val":"04","name":"April"},
     {"val":"05","name":"May"},
     {"val":"06","name":"June"},
     {"val":"07","name":"July"},
     {"val":"08","name":"Aug"},
     {"val":"09","name":"Sept"},
     {"val":"10","name":"Oct"},
     {"val":"11","name":"Nov"},
     {"val":"12","name":"Dec"}
    ]; 

    
   

  }


  

}
