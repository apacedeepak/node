import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
public userType : any;
  constructor() {
        this.userType = window.localStorage.getItem('user_type');
   }

  ngOnInit() {
  }

}
