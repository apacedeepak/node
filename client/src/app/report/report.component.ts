import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../services/backend-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  public urlPath: any;
  constructor(private http: HttpClient, private myService: BackendApiService, private router: Router) {  }

  ngOnInit() {

        
    this.urlPath = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);

  }

}
