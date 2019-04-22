import { Component, OnInit, ɵConsole } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BackendApiService } from "./../../services/backend-api.service";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-announcementlist',
  templateUrl: './announcementlist.component.html',
  styleUrls: ['./announcementlist.component.css']
})
export class AnnouncementlistComponent implements OnInit {
  sessionId: any;
  schoolId: any;
  public globalObj: any = {};
  successmsg: any = "";
  errormsg: any = "";
  public page: number = 1;


  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit() {

    this.sessionId = window.localStorage.getItem("session_id");
    this.schoolId = window.localStorage.getItem("school_id");
    this.getAnnouncementList();

  }

  addAnnouncement() {
    this.router.navigate(["/communication/announcement"]);
  }

  getAnnouncementList() {
    const url =
      this.myService.constant.apiURL +
      "announcements/allannouncement";
    var params = {};
    this.http.post(url, params).subscribe(details => {
      const data: any = details;
      var dataResponce = data.response;

      var dataSet = [];
      dataResponce.forEach(element => {

        let type_val = '';
        if (element.type == 3 || element.type == 'Circular') {
          type_val = 'Circular';
        } else {
          type_val = 'Notice';
        }


        var dataSetObj = {
          type: type_val,
          title: element.title,
          description: element.description,
          attachments_path: element.attachments,
          start_date: element.start_date,
          end_date: element.end_date,
          status: element.status,
          userId: element.userId,
          id: element.id,
          created_date: element.created_date
        };
        dataSet.push(dataSetObj);
      });



      this.globalObj.annuncementList = dataSet;
      console.log(this.globalObj.annuncementList);
    });
  }


  showPopUp(annuncementID) {
    // console.log(annuncementID + "666");
    const url =
      this.myService.constant.apiURL +
      "announcement_assign/getalluserlistbyannouncement?announcementId=" + annuncementID;
    this.http.get(url).subscribe(response => {
      var data: any = response;
      var announcementDetailslist = data.response;
      // console.log(JSON.stringify(announcementDetailslist) + "popUp");
      (<any>$("#showpopup")).modal("show");
      this.globalObj.announcementDetailslist = announcementDetailslist;
    });

  }


}
