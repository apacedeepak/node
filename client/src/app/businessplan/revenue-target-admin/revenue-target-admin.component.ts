import { Component, OnInit } from '@angular/core';
import  { TranslateService } from '@ngx-translate/core';
import { FormControl,FormGroup,FormBuilder,Validators,FormArray} from '@angular/forms';
import { BusinessplanService } from '../services/businessplan.service';


@Component({
  selector: 'app-revenue-target-admin',
  templateUrl: './revenue-target-admin.component.html',
  styleUrls: ['./revenue-target-admin.component.css']
})
export class RevenueTargetAdminComponent implements OnInit {
  public successMessage:any={};
  public errorMessage:any={};
  private userId='';
  public schoolId='';
  public sessionId='';
  public month='';
  public schoolSessions: any = [];
  public schools: any = [];
  public statusFilters: any = [];
  public months:any=[];
  public years:any=[];
  public revenueMonthTargets:any=[];
  public mylang: any = '';
  public revenueMonthTargetForm:FormGroup;
  public statusRevenueTargetForm:FormGroup;
  public statusFrmArr: FormArray;
  public idFrmArr: FormArray;
  constructor(private translate:TranslateService,private fb:FormBuilder,private businessplanService:BusinessplanService) {
    this.mylang=window.localStorage.getItem('language');
    if(this.mylang) {

      translate.setDefaultLang(this.mylang);
    } else{
      translate.setDefaultLang('en');
    }


   }

  ngOnInit() {
    this.schoolId=localStorage.getItem('school_id');
    this.userId=localStorage.getItem('user_id');


    this.revenueMonthTargetForm=this.fb.group({

    session_id:['',Validators.required],
    school_id:['',Validators.required],
    year:['',Validators.required],
    month:['',Validators.required],
    status:['Pending',Validators.required]

    });

    


    this.statusFilters=['Pending','Accepted','Rejected'];
    
    this.getSchools();

  }


  

  getSchools() {
    let params={"status":"Active"}
    this.businessplanService.getSchools(params).
    subscribe(
      data=>{
        this.schools=data.response;
      },
      error=>{

      }
    );


  }


  getSchoolSessions(event:Event) {
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementValue = selectedOptions[selectedIndex].value;
    this.schoolSessions=[];
    for (let school of this.schools) {
      if(selectElementValue==school.id) {
        if(school.has_many_sessions.length>0) {
          for(let session of school.has_many_sessions) {
            this.schoolSessions.push(session);
          }
        }
      }
          
            
    }
    
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



   getMonthRevenueTarget(data) {
   
    var params:any={};
    this.errorMessage.message='';
    this.successMessage.message='';
    this.revenueMonthTargets=[];

    this.idFrmArr = new FormArray([]);
    this.statusFrmArr = new FormArray([]);

    this.statusRevenueTargetForm=this.fb.group({
      id:this.idFrmArr,
      status:this.statusFrmArr

    });



    params.session_id=data.session_id;
    params.school_id=data.school_id;
    params.month=data.year+data.month;;
    params.status=data.status;
        
    this.businessplanService.getMonthRevenueTarget(params).
    subscribe(
      data=>{
        if(data.response.length > 0) {
          this.errorMessage.message="";
          for(let monthTarget of data.response) {
            this.idFrmArr.push(new FormControl(monthTarget.id));
            this.statusFrmArr.push(new FormControl(monthTarget.status));
            if(monthTarget.fee_structure.revenue_target_fee_term.length > 0) {
              var revenurTarget=0;
              for(let revenueFeeTerm of  monthTarget.fee_structure.revenue_target_fee_term) {
                revenurTarget=revenurTarget+parseInt(revenueFeeTerm.amount);

              }
              monthTarget.revenue_target=revenurTarget;
            }
            this.revenueMonthTargets.push(monthTarget);
            
          }
          
        } else {
          this.revenueMonthTargets=data.response;
          this.errorMessage.message="No Record Found !";
        }
      

        

      },
      error=>{

      }
    );

    //console.log(data);


  }


  updateRevenueTargetStatus(params) {

    //console.log(params);
    this.businessplanService.updateRevenueTargetStatus(params).
    subscribe(
      data=>{
        this.successMessage.message=data.response_status.message;
      },
      error=>{

      }
    );
  }





}
