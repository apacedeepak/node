import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgForm ,FormsModule,FormGroup, FormBuilder ,FormArray,FormControl} from '@angular/forms';
import {BackendApiService} from './../../services/backend-api.service';
import { element } from 'protractor';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-teacherhomeworkdraft',
  templateUrl: './teacherhomeworkdraft.component.html',
  styleUrls: ['./teacherhomeworkdraft.component.css']
})
export class TeacherhomeworkdraftComponent implements OnInit {
public token: any;
public draftid: any;
public userid: any;
public draftdetail: any;
form: FormGroup;
public sessionid: any;
public homeworklist: any;
public classlist: any;
public sectionlist: any;
public subjectlist: any;
public homeworkDetail: any;
public subject_id : any;
public class_id : any;
public section_id : any;
public target_date : any;
public title : any;
public class_sec_list : any;
public inputFile: any;
public group_list : any;
public sendtolist : Array<any> = new Array<any>();
public ishomeworkexist : any;
public filelist : Array<any> = new Array<any>();
public inputFileModel: Array<any> = new Array<any>();
public inputFileMinimalModel: Array<any> = new Array<any>();
public htmlContent : any;
public subjectlabel : any;
public isImage: boolean = false;
public attachments : Array<any> = new Array<any>();
public fileattachments : Array<any> = new Array<any>();
public responseMessage : boolean = false;
public popmessage : any = '';
public targetdate: any;
public serverurl :any = '';
public file_list :any = '';
public fileNameIcon : any = [];
public minDate: any;
public fileimage : Array<any> = new Array<any>();
public schoolid: any = '';
public target_date_val: any = '';
public product_type : any = '';
public class_name : any = '';
public numberOfAttach : any;
public domainName : any;
mylang:any=''; 
  constructor(private http: HttpClient,private myService: BackendApiService,private activatedRoute: ActivatedRoute,private fb: FormBuilder,private translate: TranslateService) {
    var today = new Date();
    this.minDate = {year: today.getFullYear(), month: today.getMonth()+1, day: today.getDate()};
    this.activatedRoute.params.subscribe((params: Params) => {
      this.draftid= params['id'];

    });
    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.schoolid = window.localStorage.getItem('school_id');
    this.product_type = window.localStorage.getItem('product_type');
    this.serverurl = this.myService.commonUrl;
    this.mylang= window.localStorage.getItem('language');
    this.domainName = this.myService.constant.domainName;
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
      
      this.numberOfAttach = 5;
      this.form = this.fb.group({

      groupscheckBox: this.fb.array([]),
      classseccheckBox: this.fb.array([]),
      htmlContent : new FormControl(),
      loadimage: new FormControl([]),
      title : new FormControl(),
      targetdate : new FormControl(),

    });
    this.getassignedclass();
    this.getdraftdetail();
  }
getdraftdetail()
{
  const params = {
      "user_id": this.userid,
      "draft_id": this.draftid,
       "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "homework/draft", params).subscribe(details => {

      this.draftdetail = details;
       if (this.draftdetail.response_status.status == '200') {

        this.draftdetail = this.draftdetail.response;
        this.class_id = this.draftdetail.draft_data.class_id;
        this.section_id = this.draftdetail.draft_data.section_id;
        this.subject_id = this.draftdetail.draft_data.subject_id;
        this.attachments = this.draftdetail.attachments;
        this.numberOfAttach = 5 - this.attachments.length;
        if(this.attachments.length>0)
          {
        this.isImage = true;
        let attachmentArray = [];
        for(let img in this.attachments){
          const fileExten = this.attachments[img].split(".");
          let tempObj = {preview:this.domainName+this.attachments[img]};
                   attachmentArray.push(tempObj);
              const fileExtindex = fileExten.length - 1;
              //console.log(fileExten[fileExtindex]);
              if(fileExten[fileExtindex].toLowerCase() == 'pdf'){

                this.fileNameIcon.push('assets/images/pdf-type.png');

              }else if(fileExten[fileExtindex].toLowerCase() == 'doc' ||
                  fileExten[fileExtindex].toLowerCase() == 'docx'){

                this.fileNameIcon.push('assets/images/doc-type.png');

              }else if(fileExten[fileExtindex].toLowerCase() == 'xls' ||
                        fileExten[fileExtindex].toLowerCase() == 'xlsx'){

                  this.fileNameIcon.push('assets/images/excel-type.png');

                }else if(fileExten[fileExtindex].toLowerCase() == 'ppt' ||
                      fileExten[fileExtindex].toLowerCase() == 'pptx'){

                  this.fileNameIcon.push('assets/images/ppt-type.png');

                }else{

                this.fileNameIcon.push('assets/images/image-type.png');

              }
        }
        this.form.patchValue({loadimage:attachmentArray});
          }
        this.fileattachments = this.draftdetail.attachments;

        this.form.get('title').setValue(this.draftdetail.homework_title);
        this.form.get('htmlContent').setValue(this.draftdetail.homework_content);
        this.target_date_val = this.draftdetail.target_date;
        
          
        this.getallclasssectionsubjectgroup();


      }



    });
    //});
}
  getassignedclass() {


    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolid,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {

      this.classlist = details;
      if (this.classlist.response_status.status == '200') {

        this.classlist = this.classlist.response.assigned_classes;

        

      }


    });
    //});
  }
  getassignedsection(val) {
    this.subjectlabel = '';
    this.sendtolist = [];
    this.class_sec_list = [];
    this.group_list = [];
    this.class_id = val;
    if(val!='')
      {
 const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "class_id":val,
      "token": this.token

    };
     for(let key in this.classlist)
          {
            if(this.classlist[key].class_id==val)
              {
                this.class_name = this.classlist[key].class_name;
               
              }
          }

    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

      this.sectionlist = details;
      if (this.sectionlist.response_status.status == '200') {

        this.sectionlist = this.sectionlist.response.assigned_sections;

        this.subjectlist = [];

      }



    });
    //});
      }
  else{


    this.sectionlist = [];
    this.subjectlist = [];
    this.section_id = '';
    this.subject_id = '';

  }
  }

   getassignedsubject(val,labelval) {
     this.sendtolist = [];
     this.section_id = val;

     this.subject_id = '';
     if(val!='')
      {


        this.subjectlabel = labelval[labelval.selectedIndex].label;




 const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "section_id":val,
      "token": this.token

    };

    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

      this.subjectlist = details;
      if (this.subjectlist.response_status.status == '200') {

        this.subjectlist = this.subjectlist.response.assigned_subjects;



      }



    });
    //});
  }
  else
    {

      this.subjectlist = [];
      this.class_sec_list = [];
      this.group_list = [];
      this.subjectlabel = '';
      this.subject_id = '';

    }
   }

  getassignedclasssecandgroup(val)
  { 
    this.subject_id = val;
    this.sendtolist = [];
   if(val!='')
      {

 const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "class_id":this.class_id,
      "subject_id":val,
      "token": this.token

    };

    this.sendtolist.push({'type':'classsec','unique_id':this.section_id,'value':this.class_name+'-'+this.subjectlabel});

    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "user_subjects/subjectwisesections", params).subscribe(details => {


      this.class_sec_list = details;
      if (this.class_sec_list.response_status.status == '200') {

        this.class_sec_list = this.class_sec_list.response;




              this.class_sec_list.forEach(element => {
                const control1 = new FormControl(false);
             (<FormArray>this.form.get('classseccheckBox')).push(control1);

              });
            (<FormArray>this.form.get('classseccheckBox')).controls[0].setValue(true);


      }
      const params = {

      "session_id": this.sessionid,
      "section_id":this.section_id,
      "subject_id":val,
      "token": this.token

    };
      this.http.post(this.myService.constant.apiURL + "groups/assignedgroups", params).subscribe(details => {

       this.group_list = details;
      if (this.group_list.response.status == '200') {

        this.group_list = this.group_list.response.data;

              this.group_list.forEach(element => {
                const control1 = new FormControl(false);
             (<FormArray>this.form.get('groupscheckBox')).push(control1);

              });





      }
    });
    });
    //});
  }
  else
    {

      this.class_sec_list = [];
      this.group_list = [];
      
    }
  }


onAccept(file: any): void {
    
   
  let checkflag = false;
  this.isImage = true;
  if(this.filelist.length>=0)
    {
    for (var i in this.filelist) {
              if(this.filelist[i].file.name==file.file.name)
                {
                  checkflag = true;
                  break;
                }
            }
              if(!checkflag)
                {
                   this.filelist.push(file);
                   const fileExten = file.file.name.split(".");
                    const fileExtindex = fileExten.length - 1;
                    //console.log(fileExten[fileExtindex]);
                    if(fileExten[fileExtindex].toLowerCase() == 'pdf'){

                        this.fileimage.push('assets/images/pdf-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'doc' ||
                          fileExten[fileExtindex].toLowerCase() == 'docx'){

                        this.fileimage.push('assets/images/doc-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'xls' ||
                              fileExten[fileExtindex].toLowerCase() == 'xlsx'){

                        this.fileimage.push('assets/images/excel-type.png');

                      }else if(fileExten[fileExtindex].toLowerCase() == 'ppt'||
                           fileExten[fileExtindex].toLowerCase() == 'pptx'){

                        this.fileimage.push('assets/images/ppt-type.png');

                      }else{

                        this.fileimage.push('assets/images/image-type.png');

                      }
                }
    }

}

onRemove(file: any): void {

    let counter = 0;;

  if(this.filelist.length>0)
    {
    for (var i in this.filelist) {
              if(this.filelist[i].file.name==file.file.name)
                {
                  this.filelist.splice(counter,1);
                  this.fileimage.splice(counter,1);
                }
                counter++;
            }

    }

   if(this.fileattachments.length==0 && this.filelist.length==0)
    {
        this.isImage = false;
    }


}

createhomework(type)
{

          if(this.class_id==undefined || this.class_id=='')
         {
          if(this.product_type=='emscc'){
            alert(this.translate.instant('please_select_course_type'));
          }
          else{
          alert(this.translate.instant('please_select_class'));}
             return false;
         }
          if(this.section_id==undefined || this.section_id=='')
         {
          if(this.product_type=='emscc'){
            alert(this.translate.instant('please_select_batch'));
          }
            else{    alert(this.translate.instant('please_select_section'));}
             return false;
         }
          if(this.subject_id==undefined || this.subject_id=='')
         {
             alert(this.translate.instant("please_select_subject"));
             return false;
         }
          if(this.form.get('targetdate').value==undefined && this.target_date_val=='')
         {
             alert(this.translate.instant("please_select_target_date"));
             return false;
         }

           if(this.form.get('title').value==undefined || this.form.get('title').value=='')
         {
             alert(this.translate.instant("please_select_assignment_title"));
             return false;
         }
          if(this.sendtolist.length==0)
         {
             alert(this.translate.instant("Kindly select at least one group or class"));
             return false;
         }
         let channel = ''  ;
         let assignto = ''  ;
         let classsec_ids = '';
         let group_ids = '';
         let alllist = '';
         var target_date = '';
         if(this.form.get('targetdate').value!=undefined)
          {
         let t_year = this.form.get('targetdate').value.year;
         let t_month = this.form.get('targetdate').value.month<10?'0'+this.form.get('targetdate').value.month:this.form.get('targetdate').value.month;
         let t_day = this.form.get('targetdate').value.day<10?'0'+this.form.get('targetdate').value.day:this.form.get('targetdate').value.day;
          target_date = t_year+"-"+t_month+"-"+t_day;
          }
        else
          {
             target_date = this.target_date_val;
          }

          this.sendtolist.forEach(function(values){
              alllist = alllist+values.unique_id+',';
          })
            alllist = alllist.substring(0,alllist.length-1);
         if(this.sendtolist[0].type=='classsec')
          {
          channel = 'class-section';
          assignto = 'class';
          classsec_ids = alllist;
          }
         else
          {
          channel = 'group';
          assignto = 'group';
          group_ids = alllist;
          }



  const formData = new FormData();

         for (var i in this.filelist) {
           formData.append(i, this.filelist[i].file);
            //console.log(this.inputFileModel[i].file);

}         if(this.fileattachments.length==0)
          {
            this.file_list = '';
          }
          else
            {
              this.file_list = this.getallfilelist();
            }


          var contentval = this.form.get('htmlContent').value;
          if (this.form.get('htmlContent').value == null || this.form.get('htmlContent').value == '' || this.form.get('htmlContent').value == undefined) {
            contentval = ' ';
          }
          formData.append("user_id", this.userid);
          formData.append("session_id", this.sessionid);
          formData.append("class_id", this.class_id);
          formData.append("section_id", this.section_id);
          formData.append("subject_id", this.subject_id);
          formData.append("title", this.form.get('title').value);
          formData.append("content", this.form.get('htmlContent').value);
          formData.append("channel", channel);
          formData.append("origin", 'web');
          formData.append("type", type);
          formData.append("homework_id", this.draftid);
          formData.append("file_list", this.file_list);
          formData.append("target_date", target_date);
          formData.append("classsec_ids", classsec_ids);
          formData.append("group_ids", group_ids);
          formData.append("assign_to", assignto);
          formData.append("token", this.token);
              //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "homework/createhomework", formData).subscribe(details => {


      this.popmessage = details;
      if (this.popmessage.response_status.status == '200' || this.popmessage.response_status.status == '201') {

     this.responseMessage = true;

     this.popmessage = this.translate.instant(this.popmessage.response_status.message);




       }



    });
    //});
}
  addtosendlist(id,name,callfrom,event)
  {
    if(this.sendtolist.length>0)
      {
       if(this.sendtolist[0].type!=callfrom)
        {
          if(callfrom=='classsec')
            {
              for(let key in this.class_sec_list){
                  (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(false);
              }

            }
            if(callfrom=='group')
            {
              for(let key in this.group_list){
                  (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(false);
              }

            }
         this.sendtolist = [];
         if(event.target.checked)
          {
            if(callfrom=='classsec')
         this.sendtolist.push({'type':callfrom,'unique_id':id,'value':name});
            else
              this.sendtolist.push({'type':callfrom,'unique_id':id,'value':name});
          }
        }
        else{
           if(event.target.checked)
          { let existflag = false;
            this.sendtolist.forEach(function(dataval){
              if(dataval.unique_id==id)
                {
                 existflag = true;
                }
            })
              if(!existflag)
                {
            if(callfrom=='classsec')
         this.sendtolist.push({'type':callfrom,'unique_id':id,'value':name});
            else
              this.sendtolist.push({'type':callfrom,'unique_id':id,'value':name});
                }
          }
          else
            { let counter = 0;
              let existposition = 0;
              let existflag = false;
          this.sendtolist.forEach(function(dataval){
            if(dataval.unique_id==id && dataval.type==callfrom )
              {
             existflag = true;
             existposition = counter;

              }
             counter++;

          })
            if(existflag)
              {
                this.sendtolist.splice(existposition,1);
              }
            }
        }
      }
      else{
        if(callfrom=='classsec')
         this.sendtolist.push({'type':callfrom,'unique_id':id,'value':name});
            else
              this.sendtolist.push({'type':callfrom,'unique_id':id,'value':name});
      }

  }
removelist(type,id)
{

      let counter = 0;
              let existposition = 0;
              let existflag = false;
          this.sendtolist.forEach(function(dataval){
            if(dataval.unique_id==id && dataval.type==type)
              {
             existflag = true;
             existposition = counter;

              }
             counter++;

          })
            if(existflag)
              {
                this.sendtolist.splice(existposition,1);
              }
              if(type=='classsec')
            {
              this.class_sec_list.forEach((element,key) => {
                  if(element.section_id == id){
                        (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(false);
                  }

                });

            }
            if(type=='group')
            {
              this.group_list.forEach((element,key) => {
                  if(element.id == id){
                        (<FormArray>this.form.get('groupscheckBox')).controls[key].setValue(false);
                  }

                });
            }


}
    getallclasssectionsubjectgroup(){
            const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "class_id":this.class_id,
      "token": this.token

    };

    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

      this.sectionlist = details;
      for(let key in this.classlist)
          {
            if(this.classlist[key].class_id==this.class_id)
              {
                this.class_name = this.classlist[key].class_name;
               
              }
          }
      if (this.sectionlist.response_status.status == '200') {

        this.sectionlist = this.sectionlist.response.assigned_sections;
        const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "section_id":this.section_id,
      "token": this.token

    };

    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

      this.subjectlist = details;
      if (this.subjectlist.response_status.status == '200') {
         const paramss = {

      "session_id": this.sessionid,
      "section_id":this.section_id,
      "subject_id":this.subject_id,
      "token": this.token

    };
      this.http.post(this.myService.constant.apiURL + "groups/assignedgroups", paramss).subscribe(details => {

       this.group_list = details;
      if (this.group_list.response.status == '200') {

        this.group_list = this.group_list.response.data;

              this.group_list.forEach(element => {
                const control1 = new FormControl(false);
             (<FormArray>this.form.get('groupscheckBox')).push(control1);

              });







        this.subjectlist = this.subjectlist.response.assigned_subjects;
        const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "class_id":this.class_id,
      "subject_id":this.subject_id,
      "token": this.token

    };

        if(this.draftdetail.draft_data.assign_to=='class')
          {
           this.sectionlist.forEach((sectionadata)=>{
             this.draftdetail.draft_data.all_ids.forEach((allids)=>{

               if(allids==sectionadata.section_id)
                {
                  this.subjectlabel = sectionadata.section_name;
                  this.sendtolist.push({'type':'classsec','unique_id':allids,'value':this.class_name+'-'+sectionadata.section_name});
                }
             })
           })
          }
           if(this.draftdetail.draft_data.assign_to=='group')
          {
           this.group_list.forEach((groupdata)=>{
             this.draftdetail.draft_data.all_ids.forEach((allids)=>{

               if(allids==groupdata.id)
                {
                  this.sendtolist.push({'type':'group','unique_id':allids,'value':groupdata.group_name});
                }
             })
           })
          }



    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "user_subjects/subjectwisesections", params).subscribe(details => {


      this.class_sec_list = details;
      if (this.class_sec_list.response_status.status == '200') {

        this.class_sec_list = this.class_sec_list.response;




              this.class_sec_list.forEach(element => {
                const control1 = new FormControl(false);
             (<FormArray>this.form.get('classseccheckBox')).push(control1);

              });
              for(let key in this.class_sec_list){
                for(let key1 in this.draftdetail.draft_data.all_ids){
                  if(this.draftdetail.draft_data.all_ids[key1]==this.class_sec_list[key].section_id)
                  (<FormArray>this.form.get('classseccheckBox')).controls[key].setValue(true);
              }
              }
           // (<FormArray>this.form.get('classseccheckBox')).controls[0].setValue(true);


      }

    });
    //});

     }
    });

      }



    });
    //});

      }



    });
    //});

          }
  removeattachment(index,type)
  {
     
     if(type == 'draft'){
    //this.fileattachments.splice(index,1);
    this.fileNameIcon.splice(index,1);
    this.attachments.splice(index,1);
    
    this.numberOfAttach = this.numberOfAttach + 1;
  }else{
    this.filelist.splice(index,1);
    this.fileimage.splice(index,1);
    this.inputFileModel.splice(index,1);
  }
  if(this.fileattachments.length == 0 && this.filelist.length == 0){
      this.isImage = false;
  }

  }
    removeattachmentall(type)
  {

        this.fileattachments = [];
        this.filelist = [];
        this.fileimage = [];
        this.fileNameIcon = [];
        this.inputFileModel = [];
        this.attachments = [];
        this.numberOfAttach = 5;

   if(type == true){
      this.isImage =  false;
    }else{
       this.isImage = true;
    }

  }
    getallfilelist()
    {
      let temparr = [];

      for(let key in this.fileattachments)
      {
        let temparr1 = [];
        let counter =0 ;
         temparr1 = this.fileattachments[key].split("/");
          let path = "";
         for(let key1 in temparr1)
          {

           if(counter>0)
            {
             path = path+temparr1[key1]+"/";
            }
            counter++;
          }
          temparr.push(path.substring(0,path.length-1));

      }
        return temparr.join();
    }
}
