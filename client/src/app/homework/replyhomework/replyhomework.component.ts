import { Component, OnInit } from '@angular/core';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NgForm ,FormsModule,FormGroup, FormBuilder ,FormArray,FormControl} from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-replyhomework',
  templateUrl: './replyhomework.component.html',
  styleUrls: ['./replyhomework.component.css']
})
export class ReplyhomeworkComponent implements OnInit {
  public homeId: any;
  public teachername: any;
  public subject: any;
  public inputFileModel: Array<any> = new Array<any>();
  public filelist: Array<any> = new Array<any>();
  public htmlContent: any;
  public userid: any;
  public token: any;
  public rersponse : any;
  public message : any;
  public detaildata : any;
  public sendto_user_id : any;
  public isImage: boolean = false;
  public responseMessage : boolean = false;
  public popmessage : any = '';
  public fileimage: Array<any> = new Array<any>();
  form: FormGroup;
  mylang:any=''; 

  public submitapiUrl = 'homework/studenthomeworksubmit';

  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient, private myService: BackendApiService,private fb: FormBuilder,private translate: TranslateService) {
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.activatedRoute.params.subscribe((data: any) => {
      this.homeId = data.homeId;
      
    })
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }


  ngOnInit() {
     this.form = this.fb.group({
      htmlContent : new FormControl(),
      subject : new FormControl(),
      });
    
  this.gethomeworkdetails();
  }
  onAccept(file: any): void {
    let checkflag = false;
    this.isImage = true;
    if (this.filelist.length > 0) {
      for (var i in this.filelist) {
        if (this.filelist[i].file.name == file.file.name) {
          checkflag = true;
          break;
        }
      }
      if (!checkflag) {
        this.filelist.push(file);
        const fileExten = file.file.name.split(".");
        const fileExtindex = fileExten.length - 1;
        //console.log(fileExten[fileExtindex]);
        if (fileExten[fileExtindex].toLowerCase() == 'pdf') {

          this.fileimage.push('assets/images/pdf-type.png');

        } else if (fileExten[fileExtindex].toLowerCase() == 'doc' ||
          fileExten[fileExtindex].toLowerCase() == 'docx') {

          this.fileimage.push('assets/images/doc-type.png');

        } else if (fileExten[fileExtindex].toLowerCase() == 'xls' ||
          fileExten[fileExtindex].toLowerCase() == 'xlsx') {

          this.fileimage.push('assets/images/excel-type.png');

        } else if (fileExten[fileExtindex].toLowerCase() == 'ppt' ||
          fileExten[fileExtindex].toLowerCase() == 'pptx') {

          this.fileimage.push('assets/images/ppt-type.png');

        } else {

          this.fileimage.push('assets/images/image-type.png');

        }
      }
    }
    else {
      this.filelist.push(file);
      const fileExten = file.file.name.split(".");
      const fileExtindex = fileExten.length - 1;
      //console.log(fileExten[fileExtindex]);
      if (fileExten[fileExtindex].toLowerCase() == 'pdf') {

        this.fileimage.push('assets/images/pdf-type.png');

      } else if (fileExten[fileExtindex].toLowerCase() == 'doc' ||
        fileExten[fileExtindex].toLowerCase() == 'docx') {

        this.fileimage.push('assets/images/doc-type.png');

      } else if (fileExten[fileExtindex].toLowerCase() == 'xls' ||
        fileExten[fileExtindex].toLowerCase() == 'xlsx') {

        this.fileimage.push('assets/images/excel-type.png');

      } else if (fileExten[fileExtindex].toLowerCase() == 'ppt' ||
        fileExten[fileExtindex].toLowerCase() == 'pptx') {

        this.fileimage.push('assets/images/ppt-type.png');

      } else {

        this.fileimage.push('assets/images/image-type.png');

      }
    }
  }

  onRemove(file: any): void {
    let counter = 0;
    if (this.filelist.length > 0) {
      for (var i in this.filelist) {
        if (this.filelist[i].file.name == file.file.name) {
          this.filelist.splice(counter, 1);
        }
        counter++;
      }
    }
     if(this.filelist.length==0)
    {
        this.isImage = false;
    }
  }
  removeattachment(index)
  {
    
    this.filelist.splice(index,1);
 
  if( this.filelist.length == 0){
      this.isImage = false;
  }
        
  }
    removeattachmentall(type)
  {
   
        
        this.filelist = [];
  
   if(type == true){
      this.isImage =  false;
    }else{
       this.isImage = true;
    }
     
  }
  replymail() {
    const formData = new FormData();
    for (var i in this.filelist) {
      formData.append(i, this.filelist[i].file);
    }
    formData.append("homework_id", this.homeId);
    formData.append("user_id", this.userid);
    formData.append("token", this.token);
    formData.append("content", this.form.get('htmlContent').value);

    this.http.post(this.myService.constant.apiURL + this.submitapiUrl, formData).subscribe(details => {
      const studentrecord = details;
      this.rersponse  = studentrecord;
      //alert(this.rersponse.message);
      if (this.rersponse.status == '200') {
     this.responseMessage = true;
     var response = details;
     this.popmessage = this.translate.instant(this.rersponse.message);
       }
       
    });

  }
  gethomeworkdetails()
  {
    const param = {
            'user_id' : this.userid,
            'homework_id': this.homeId,
            'token': this.token
       };
      this.http.post(this.myService.constant.apiURL + "homework/homeworksubmitandremarkdetail", param).subscribe(details => {
      this.detaildata = details;
      this.form.get('subject').setValue("RE:"+this.detaildata.response.teacher_homework_detail.title);
      //this.subject  = "RE:"+this.detaildata.response.teacher_homework_detail.title;
      this.sendto_user_id = this.detaildata.response.teacher_homework_detail.user_id
      this.detaildata  = this.detaildata.response.teacher_homework_detail;
      
      
      })
  }
}


