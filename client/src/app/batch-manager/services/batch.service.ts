import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http'; 
import { Observable, of } from 'rxjs';
import {BackendApiService} from './../../services/backend-api.service';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(private http:HttpClient,private myService: BackendApiService ) { }


  getCourseMode():Observable<any>{

    return this.http.get<any>(this.myService.constant.apiURL+"course_modes/getcoursemode");
  }

  getCourse():Observable<any>{

    return this.http.get<any>(this.myService.constant.apiURL+"boards/getactiveboard");
  }

  getCourseType(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"classes/getclasslistbyboardId",params);

  }

  getUserSchools(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"user_schools/assignedSchoolListByUserId",params);

  }

  getSectionList(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"sections/getsectionlist",params);

  }

  getSyllabusCoverage(params):Observable<any> {

    return this.http.post<any>(this.myService.constant.apiURL+"microschedule_masters/getsyllabuscoverage",params);

  }


  


}
