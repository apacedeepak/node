import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http'; 
import { Observable, of } from 'rxjs';
import {BackendApiService} from './../../services/backend-api.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessplanService {

  
  constructor(private http:HttpClient,private myService: BackendApiService ) { }


  getSchools(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"schools/schoollist",params);

  }

  getSchoolSessions(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"sessions/getallsession",params);


  }


  getAcadmicSessions(params):Observable<any>{

    return this.http.post<any>(this.myService.constant.apiURL+"academic_session_masters/list",params);

  }


  getExpenseCategory():Observable<any>{

    return this.http.get<any>(this.myService.constant.apiURL+"expense_category_masters/getallcategorymaster");
  }



  getRevenueMonthTarget(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"fee_structure_masters/feestructurerevenuetarget",params);

  }


  addRevenueTarget(params):Observable<any>{

    return this.http.post<any>(this.myService.constant.apiURL+"revenue_targets/addrevenuetarget",params);
 
   }


   getMonthRevenueTarget(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"revenue_targets/getmonthrevenuetarget",params);

   }

   updateRevenueTargetStatus(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"revenue_targets/updatestatus",params);

   }


   getprofitlossdata(params):Observable<any>{

    return this.http.post<any>(this.myService.constant.apiURL+"receipts/getprofitlossdata",params);
   }
 
   



}
