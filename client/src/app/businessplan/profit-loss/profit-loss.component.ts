import { Component, OnInit } from '@angular/core';
import  { TranslateService } from '@ngx-translate/core';
import { FormControl,FormGroup,FormBuilder,Validators} from '@angular/forms';
import { BusinessplanService } from '../services/businessplan.service';


@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.css']
})
export class ProfitLossComponent implements OnInit {

  private mylang:string='';
  private schoolId:any='';
  public reports:any=[];
  public sessionSchools:any=[];
  public acadmicSessions:any=[];
  public expenseCategories:any=[];
  public profitlossForm:FormGroup;
  

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

    this.profitlossForm=this.fb.group({

      "session_id":['',Validators.required],
      "from_date":['',Validators.required],
      "to_date":['',Validators.required]

    });

    this.getAcadmicSessions();
    this.getExpenseCategory();


  }


  getAcadmicSessions() {
   
    let params={"status":1}
    this.businessplanService.getAcadmicSessions(params)
    .subscribe (
      data=> {
        this.acadmicSessions=data.response.data;
        
      },
      error=> {

      }
        
    );

  }

  getExpenseCategory() {
    this.businessplanService.getExpenseCategory()
    .subscribe (
      res=> {
        this.expenseCategories=res.response;
        
      },
      error=> {

      }
        
    );

  }



  getProfitLossReport(data) {
    this.sessionSchools=[];this.reports=[]; var expenseCatArr:any=[];
    this.businessplanService.getSchoolSessions(data).
    subscribe(
      result=>{
        
        if(result.response.length > 0 ) {
          
            this.sessionSchools=result.response;
            var schoolIds:any=[]; var sessionIds:any=[];
            let params:any={};
            params.from_date=data.from_date.year+'-'+data.from_date.month+'-'+data.from_date.day;
            params.to_date=data.to_date.year+'-'+data.to_date.month+'-'+data.to_date.day;
                      
            for(let school of result.response) {
              schoolIds.push(school.schoolId);
              sessionIds.push(school.id);
            }
            params.schoolIds= schoolIds;
            params.sessionIds= sessionIds;        
            params.status=1; params.approval_status=2;params.refund_status='Approved';
            this.businessplanService.getprofitlossdata(params).
            subscribe(
              result=>{
                    var fees:any=[]; var expenses:any=[];var refunds:any=[];
                    var grandTotalAmount=0;var grandRefundAmount=0;var grandNetAmount=0;var grandTaxAmount=0;var grandRevenueAmount=0;var grandExpenseAmount=0;var grandNetProfitAmount=0;
                    if(result.response.data.length > 0) {
                      for(let data of result.response.data) {
                        if(data.fees) { fees=data.fees;}
                        if(data.expenses) { expenses=data.expenses;}
                        if(data.refunds) { refunds=data.refunds;}

                      }
                     
                    }
                                       
                    for(let school of this.sessionSchools) {
                      var reportData:any={};
                      var totalAmount=0;var refundAmount=0; var netAmount=0;var taxAmount=0;var revenueAmount=0;var expenseAmount=0; var netProfitAmount=0;
                                           

                      //code to calculate collected fee
                        for(let collectedFee of fees) {

                          if(school.schoolId==collectedFee.schoolId) {
                            totalAmount=totalAmount+parseFloat(collectedFee.total_amount);
                            taxAmount=taxAmount+parseFloat(collectedFee.taxable_amount);
                            
                          }
                          
                        }

                      // code to calculate refunds

                      for(let refund of refunds) {

                        if(school.schoolId==refund.school_id) {
                          refundAmount=refundAmount+refund.total_refundable_amount;
                          
                        }
                        
                      }

                      //code to calculate expenses category wise
                      var expenseCatArr:any=[];var totalExpenseCatArr:any=[];
                      for(let category of this.expenseCategories) {
                        var expenseCatAmount=0;var totalExpenseCatAmount=0;
                       
                          for(let expense of expenses) {

                            if(school.schoolId==expense.center_id && category.id==expense.expense_category) { 

                              expenseCatAmount=expenseCatAmount+parseFloat(expense.total_amount);

                            }
                            if(category.id==expense.expense_category) {
                              totalExpenseCatAmount=totalExpenseCatAmount+parseFloat(expense.total_amount);

                            }

                          }
                       
                        expenseAmount=expenseAmount+expenseCatAmount;
                        expenseCatArr.push(expenseCatAmount);
                        totalExpenseCatArr.push(totalExpenseCatAmount);
                     }

                      netAmount=totalAmount-refundAmount;
                      revenueAmount=netAmount-taxAmount;
                      netProfitAmount=(revenueAmount-expenseAmount);
                      grandTotalAmount=grandTotalAmount+totalAmount;
                      grandRefundAmount=grandRefundAmount+refundAmount
                      grandNetAmount=grandNetAmount+netAmount;
                      grandTaxAmount=grandTaxAmount+taxAmount;
                      grandRevenueAmount=grandRevenueAmount+revenueAmount;
                      grandExpenseAmount=grandExpenseAmount+expenseAmount;
                      grandNetProfitAmount=grandNetProfitAmount+(netProfitAmount);

                      reportData.schoolName=school.school_session.school_name;
                      reportData.totalAmount=totalAmount;
                      reportData.refundAmount=refundAmount;
                      reportData.netAmount=netAmount;
                      reportData.taxAmount=taxAmount;
                      reportData.revenueAmount=revenueAmount;
                      reportData.expenseAmount=expenseAmount;
                      reportData.netProfitAmount=netProfitAmount;
                      reportData.category=expenseCatArr;
                      this.reports.push(reportData);

                    }

                      reportData={};
                      reportData.schoolName='Total';
                      reportData.totalAmount=grandTotalAmount;
                      reportData.refundAmount=grandRefundAmount;
                      reportData.netAmount=grandNetAmount;
                      reportData.taxAmount=grandTaxAmount;
                      reportData.revenueAmount=grandRevenueAmount;
                      reportData.expenseAmount=grandExpenseAmount;
                      reportData.netProfitAmount=grandNetProfitAmount;
                      reportData.category=totalExpenseCatArr;
                      this.reports.push(reportData);
                      

                   
                   
                 
              },
              error=>{

              }
            );


        }

      },
      error=>{}

    );


  }

}
