import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public userType : any;
  constructor() {
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
   }

  ngOnInit() {
  }

}
