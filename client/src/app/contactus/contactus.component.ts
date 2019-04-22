import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {
  public schooldata:any={};
  public head_name: any = '';
  public address: any = '';
  public email: any = '';
  public contact_no: any = '';
  public centredata:any;
  public renderdata:any=[];
  constructor(private myService: BackendApiService, private http: HttpClient, private https: HttpClient,private translate: TranslateService) { }

  ngOnInit() {
    const params={
      tag: "Contact Head Office"
          }
          this.http.post(this.myService.constant.apiURL+"ctpconfiguration/gethocontactdetails", params).subscribe(data => {
            const datas: any = data;
       
            this.schooldata = datas.response.value;
            var obj =JSON.parse(this.schooldata)
         this.head_name=obj.head_name;
         console.log( this.head_name)
        
        this.address=obj.address;
        console.log(this.address)
        this.email=obj.email;
        this.contact_no=obj.contact_no
      });
      
        this.http.post(this.myService.constant.apiURL+"schools/schoollist", params).subscribe(data => {
          const datas: any = data;
      
        this.centredata=datas;
        // var val= Object.values( this.centredata)
        let key;
        key = Object.keys(this.centredata);
     
        this.renderdata=this.centredata[key]
        // this.centredata[key].forEach(obj => {
        //   this.renderdata.push(obj);
        //   // this.renderdata['school_email'].push(obj.school_email);
        //   // this.renderdata['school_name'].push(obj.school_name);
        //   // this.renderdata['school_address'].push(obj.school_address);
      
        //         });
        
                
        });
      
  }

}
