import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http'; 
import { Observable, of } from 'rxjs';
import {BackendApiService} from './../../services/backend-api.service';
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(private http:HttpClient,private myService: BackendApiService) { }
}
