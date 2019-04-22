import { Component, OnInit, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BackendApiService } from './../../services/backend-api.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-addremovebehaviour',
  templateUrl: './addremovebehaviour.component.html',
  styleUrls: ['./addremovebehaviour.component.css']
})
export class AddremovebehaviourComponent implements OnInit {
  positiveArr: any = []
  negativeArr: any = []
  globalObj: any = {}
  remarks_name: string = ''
  type: any = 'Positive'
  toggleBehaviourFlag: boolean = true;
  btnName: string = 'Add'
  editObj: Remark;
  fileFlag: boolean = false
  popmessage: string = ''
  responseMessage: boolean = false
  project_name: string = ''
  mylang:any='';
  filename: string = ''
  filepath: string = '/upload/student_feedback/'
  //@ViewChild('fileInput') fileInput: ElementRef;
  @ViewChildren('input') positive_input;
  @ViewChildren('negativeinput') negative_input;

  behaviourForm = new FormGroup({
    icon: new FormControl('', Validators.required),
    behaviour_type: new FormControl('', Validators.required)
   }); 

   negativeBehaviourForm = new FormGroup({
    negative_icon: new FormControl('', Validators.required),
    negative_behaviour_type: new FormControl('', Validators.required)
   }); 

  constructor(private router: Router, private http: HttpClient, private myService: BackendApiService,private translate: TranslateService) { 
    this.mylang= window.localStorage.getItem('language');
    if(this.mylang){
      translate.setDefaultLang( this.mylang);}
      else{
        translate.setDefaultLang( 'en');
      }
  }

  ngOnInit() {
    this.globalObj.user_type = localStorage.getItem('user_type');
    if(this.globalObj.user_type.toLowerCase() != 'teacher') this.router.navigate(["dashboard/main"]);
    this.globalObj.domainUrlwithoutSlash = this.myService.commonUrl1;
    this.project_name = this.myService.constant.PROJECT_NAME
    this.globalObj.school_id = localStorage.getItem('school_id');
    this.globalObj.user_id = localStorage.getItem('user_id')
    this.remarkList()
  }

  remarkList(){
    this.http.post(this.myService.constant.apiURL + "user_feedback_masters/getallremarksother", { user_id: this.globalObj.user_id }).subscribe(details => {
      const data: any = details;
      this.positiveArr  =[]
      this.negativeArr = []
      data.response
      .forEach(obj => {
        const { id, remarks_category, remarks_icon, remarks_name } = obj;
       
        const objct: Remark = { id: id, icon: remarks_icon, name: remarks_name }
        if(remarks_category.toLowerCase() == 'positive') this.positiveArr.push(objct)
        else if(remarks_category.toLowerCase() == 'negative') this.negativeArr.push(objct)
      })
    });
  }

  closeme(){
    this.responseMessage = false
  }

  behaviourSubmit(type: string){
    this.type = type

    this.remarks_name = (type.toLowerCase() == 'positive') ? this.behaviourForm.get('behaviour_type').value: this.negativeBehaviourForm.get('negative_behaviour_type').value                       
    if(!this.remarks_name) {
      this.popmessage = this.translate.instant("Remarks cannot be blank")
      this.responseMessage = true
      return
    }
    
    const formModel = this.prepareSave()
    let uri = (this.fileFlag)? "user_feedback_masters/createfeedback": "user_feedback_masters/createfeedbackother" 
   
    this.http.post(this.myService.constant.apiURL + uri, formModel).subscribe(details => {
      const data: any = details

      if(data.response_type.status == '201'){
      
        this.popmessage = this.translate.instant(data.response_type.message)
        this.responseMessage = true
        return;
      }
      this.fileFlag = false
      this.filename = (data.response)? data.response.remarks_icon: ''
      this.filepath = ''
      if(type.toLowerCase() == 'positive'){
        const objct = { 
                      //  icon: this.behaviourForm.get('icon').value, 
                        icon: (this.filename)? this.filepath+this.filename: this.behaviourForm.get('icon').value, 
                        name: this.behaviourForm.get('behaviour_type').value 
                      }
              
        if(this.btnName.toLowerCase() == 'add')              
          this.positiveArr.push(objct) 
        else{
          this.positiveArr = this.positiveArr
          .map(obj => {
            if(obj.name === this.globalObj.editIdentifier){
              obj.name = this.behaviourForm.get('behaviour_type').value
              if(this.filename) obj.icon = (this.filename)? this.filepath+this.filename: this.behaviourForm.get('icon').value
              
              //obj.icon = "/"+this.behaviourForm.get('icon').value.name
            }
           
            return obj
          })
        }            

        this.behaviourForm.setValue({ icon: '', behaviour_type: '' });  
                 
      }
      else if(type.toLowerCase() == 'negative') { 
     
         const objct = { 
                       // icon: this.negativeBehaviourForm.get('negative_icon').value, 
                        icon: (this.filename)? this.filepath+this.filename: this.negativeBehaviourForm.get('negative_icon').value, 
                        name: this.negativeBehaviourForm.get('negative_behaviour_type').value 
                      }
                      
         if(this.btnName.toLowerCase() == 'add') this.negativeArr.push(objct)
         else{
          this.negativeArr = this.negativeArr
          .map(obj => {
            if(obj.name === this.globalObj.editIdentifier){
              obj.name = this.negativeBehaviourForm.get('negative_behaviour_type').value
              if(this.filename) obj.icon = (this.filename)? this.filepath+this.filename: this.behaviourForm.get('negative_icon').value
              //obj.icon = "/"+this.negativeBehaviourForm.get('negative_icon').value.name
            }
            return obj
          })
        }   
         this.negativeBehaviourForm.setValue({ negative_icon: '', negative_behaviour_type: '' });
      }
     
      this.btnName = 'Add'
    });
  }

  private prepareSave(): any {
    let id = 0; 
    if(this.btnName.toLowerCase() == 'edit') { id = this.editObj.id }
    let icon = ''
    if(this.type.toLowerCase() == 'positive') { icon = this.behaviourForm.get('icon').value }
    else if(this.type.toLowerCase() == 'negative') { icon = this.negativeBehaviourForm.get('negative_icon').value }
    
    if(this.fileFlag){
        let input = new FormData();
        if(this.btnName.toLowerCase() == 'edit') input.append('id', ''+id);
        input.append('name', this.remarks_name);
        input.append('0', icon);
        input.append('school_id', this.globalObj.school_id);
        input.append('added_by', this.globalObj.user_id);
        input.append('remarks_category', this.type);
        return input;
    }else{
      let obj = { 
        remarks_name: this.remarks_name, 
        remarks_category: this.type, 
        remarks_icon: icon, 
        status: 1, 
        schoolId: this.globalObj.school_id,
        added_by: this.globalObj.user_id,
        added_date: new Date().toISOString()
      } 
       
      if(this.btnName.toLowerCase() == 'edit') obj['id'] = id
      return obj;
    }
  }

  onFileChange(event, type) {
    this.fileFlag = true
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      this.filename = file.name;
      if(type == 'positive')
      this.behaviourForm.get('icon').setValue(file);
      else if(type == 'negative')
      this.negativeBehaviourForm.get('negative_icon').setValue(file);
    }
  }

  editUserFeedbackMaster(obj: Remark, type: string){
    this.globalObj.editIdentifier = obj.name
    this.btnName = 'Edit'
    this.editObj = obj;
    if(type.toLowerCase() == 'positive'){
        this.behaviourForm.setValue({ icon: obj.icon, behaviour_type: obj.name });
        this.positive_input.first.nativeElement.focus();
    }
    else if(type.toLowerCase() == 'negative')  {
        this.negativeBehaviourForm.setValue({ negative_icon: obj.icon, negative_behaviour_type: obj.name });
        this.negative_input.first.nativeElement.focus();
    }
    window.scrollTo(500, 0);    
    
  }

  toggleBehaviour(){
    this.toggleBehaviourFlag = !this.toggleBehaviourFlag;
  }

}

interface Remark {
  id: number,
  icon: string, 
  name: string
}

interface Response{
  response_type: object
}
