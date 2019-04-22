import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
public userType : any;
  constructor(private myService: BackendApiService) {

    window.localStorage.setItem('callfrom', 'dashboard');
    window.localStorage.setItem('callfrom1', 'dashboard');
   }

  ngOnInit() {
 
        const userType = window.localStorage.getItem('user_type');
        this.userType = userType.toLowerCase();
   
  }

}
