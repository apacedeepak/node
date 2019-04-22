import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doubt',
  templateUrl: './doubt.component.html',
  styleUrls: ['./doubt.component.css']
})
export class DoubtComponent implements OnInit {

  public urlPath: any;

  constructor(private router: Router) { }

  ngOnInit() {

    this.urlPath = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);

  }

}
