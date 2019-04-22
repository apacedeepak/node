import { Component, OnInit, ViewChild } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {
  prescriptionForm: FormGroup;
  illnessForm: FormGroup;
  allergiesForm: FormGroup;
  vaccinationForm: FormGroup;
  otherForm: FormGroup;
  student_id: any;
  student_user_id: any;
  user_id: any;
  added_by: any;
  added_date: any;
  medical_type: any = 'illness';
  medicaldate: any;
  medicalreason: any;
  medicallist: any = [];
  infirmarylist: any = [];
  dataobj: any = {};
  show: boolean = false;
  fileuploads: File;
  illnesslst: any = [];
  vaccinationlst: any = [];
  hygienelst: any = [];
  allergieslst: any = [];
  not_found: boolean = false;
  public userType:any='';
  mylang:any=''; 

  @ViewChild('fileupload') file_upload;
  constructor(
    private myService: BackendApiService, 
    private http: HttpClient, 
    private formBuilder: FormBuilder,
    private formBuilder1: FormBuilder,
    private formBuilder2: FormBuilder,
    private formBuilder3: FormBuilder,
    private translate: TranslateService
  ) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
    this.prescriptionForm = this.formBuilder.group({
      fileupload: [],
      prescriptionselect: [null, Validators.required],
      prescriptionprecaution: [null, Validators.required],
      prescriptiontreatment: [null, Validators.required]
    });

    this.prescriptionForm.valueChanges
      .subscribe(term => {
         this.dataobj.prescriptionselect = this.prescriptionForm.value.prescriptionselect;
         this.dataobj.prescriptionprecaution = this.prescriptionForm.value.prescriptionprecaution;
         this.dataobj.prescriptiontreatment = this.prescriptionForm.value.prescriptiontreatment;
         this.medical_type = 'prescription';
      });     

    this.illnessForm = this.formBuilder.group({
      illnessdate: [null, Validators.compose([Validators.required, Validators.pattern(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/)])],
      illnessselect: [null, [Validators.required]],
      illnessprecaution: [null, [Validators.required]],
      illnesstreatment: [null, [Validators.required]]
    });
    this.illnessForm.valueChanges
          .subscribe(term => {
             this.medicaldate = this.illnessForm.value.illnessdate;
             this.medicalreason = this.illnessForm.value.illnessselect;
             this.dataobj.illnessprecaution = this.illnessForm.value.illnessprecaution;
             this.dataobj.illnesstreatment = this.illnessForm.value.illnesstreatment;
             this.medical_type = 'illness';
          }); 

    this.allergiesForm = this.formBuilder1.group({
              allergiesdate: [null, Validators.compose([Validators.required, Validators.pattern(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/)])],
              allergiesselect: [null, [Validators.required]],  
              allergiesprecaution: [null, [Validators.required]],   
              allergiestreatment: [null, [Validators.required]]
    });
    this.allergiesForm.valueChanges
              .subscribe(term => {
                   this.medicaldate = this.allergiesForm.value.allergiesdate;
                   this.medicalreason = this.allergiesForm.value.allergiesselect;
                   this.dataobj.allergiesprecaution = this.allergiesForm.value.allergiesprecaution;
                   this.dataobj.allergiestreatment = this.allergiesForm.value.allergiestreatment;
                   this.medical_type = 'allergies';
    }); 

    this.vaccinationForm = this.formBuilder2.group({
      vaccinationdate: [null, Validators.compose([Validators.required, Validators.pattern(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/)])],
      vaccinationselect: [null, [Validators.required]],
      vaccinationprecaution: [null, [Validators.required]]
    });
    this.vaccinationForm.valueChanges
              .subscribe(term => {
              this.medicaldate = this.vaccinationForm.value.vaccinationdate;
              this.medicalreason = this.vaccinationForm.value.vaccinationselect;
              this.dataobj.vaccinationprecaution = this.vaccinationForm.value.vaccinationprecaution;
              this.medical_type = 'vaccination';
    }); 
    
    this.otherForm = this.formBuilder3.group({
      otherdate: [null, Validators.compose([Validators.required, Validators.pattern(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/)])],
    
      otheroperation: [null, [Validators.required]],
      otherinjury: [null, [Validators.required]],
      otherfmh: [null,[Validators.required]]
    });
    this.otherForm.valueChanges
              .subscribe(term => {
              this.medicaldate = this.otherForm.value.otherdate;
             
              this.dataobj.otheroperation = this.otherForm.value.otheroperation;
              this.dataobj.otherinjury = this.otherForm.value.otherinjury;
              this.dataobj.otherfmh = this.otherForm.value.otherfmh;
              this.medical_type = 'other';
    }); 
    this.userType= window.localStorage.getItem('user_type');
    this.user_id =  window.localStorage.getItem('user_id');
    this.student_user_id = window.localStorage.getItem('student_user_id');
    if(this.userType=="Parent"){
    this.student_id=this.student_user_id;
    }
    if(this.userType=="Student"){
    this.student_id=this.user_id;
    }
    // console.log(this.student_id);
    this.dataobj.name = window.localStorage.getItem('student_name');
    this.dataobj.class = window.localStorage.getItem('student_section_name');
    this.dataobj.adm_no = window.localStorage.getItem('student_adm_no');

    this.added_by = window.localStorage.getItem('user_id');
    let currentdate = new Date();
    this.added_date = currentdate.toISOString().substr(0, 10);
    this.getmedicallist();
    this.getinfirmarylist();
    this.diseaselist();
  }

  diseaselist(){
    this.illnesslst.length = 0;
    this.vaccinationlst.length = 0;
    this.hygienelst.length = 0;
    this.allergieslst.length = 0;

    const params = { type: "All" };
    this.vaccinationlst = [];
    const url = this.myService.commonUrl + "schoolerp/erpapi/medical/getmasterlist";

    this.myService.apiService(url, params).subscribe(details => {
      let data: any = details;
      if(data.responseCode == '200'){
        this.illnesslst = data.illness_data;
        this.vaccinationlst = data.vaccination_data;
        this.hygienelst = data.hygiene_data;
        this.allergieslst = data.allergies_data;
      }
    });
  }

  resetForm(formobj){
    formobj.reset();
  }

  changeshow(){
    this.show = true;
  }

  change_medical_type(type){
    this.medical_type = type;
    this.getmedicallist();
  }

  downloadprescription(file = ""){
    if(file != ""){
      const url = this.myService.commonUrl + "schoolerp/erpapi/medical/downloadprescription";
      this.myService.apiService(url, file).subscribe( details => {
      });
    }
  }

  getinfirmarylist(){
    // console.log("hello")
    const params = { "student_id": this.student_id };
    this.infirmarylist = [];
      const url = this.myService.commonUrl + "schoolerp/erpapi/medical/getinfirmary";

      this.myService.apiService(url, params).subscribe(details => {
        const data: any = details;
        let arr = [];
        // console.log(data);
        arr.push(data.medical_infirmary_data);
        if(data.responseCode == '200'){
          arr.forEach(obj => {
          this.infirmarylist.push({"entry_date": obj.entry_date, "problem": obj.reason, "treatment": obj.treatment, "medicine": obj.dignosis});
          });
        }
      });
  }

  getmedicallist(type = ""){
    this.medical_type = (type == "") ? this.medical_type : type;
    // console.log(this.medical_type);
    const params = {
      'student_id': this.student_id,
      'medical_type': this.medical_type
    };
  
    this.medicallist = [];
    if(this.student_id && this.medical_type){
      const url = this.myService.commonUrl + "schoolerp/erpapi/medical/getmedicalhistory";

      this.myService.apiService(url, params).subscribe(details => {
        const data: any = details;
       
        let objct = {};
        this.medicallist = data.medical_history_data;
        // data.medical_history_data.forEach(obj => {
        //   objct = {"illness": obj.illness, "illness_date": obj.illness_date};
        //   if(this.medical_type == "prescription") objct['prescription_path'] = obj.prescription_path;
        //   this.medicallist.push(objct);
        // });
        this.not_found = (this.medicallist.length == 0) ? true : false;
      });

    }else{
      console.log('some error');
    }
  }

  prescriptionFormSubmit(value){
    const fu = this.file_upload.nativeElement;
    if(fu.files && fu.files[0]){
      this.fileuploads = fu.files[0];
    }
    const fd: FormData = new FormData();
    fd.append('fileupload', this.fileuploads, this.fileuploads.name); 
    fd.append('prescriptionselect', this.dataobj.prescriptionselect); 
    fd.append('prescriptionprecaution', this.dataobj.prescriptionprecaution); 
    fd.append('prescriptiontreatment', this.dataobj.prescriptiontreatment); 
   
    const url = this.myService.commonUrl + "schoolerp/erpapi/medical/uploadprescription";
    this.myService.apiService(url, fd).subscribe(details => {
      const data: any = details;
      
    });
  }

  submitForm(){
    let params = {
      'added_by': this.added_by,
      'added_date': this.added_date,
      'student_id': this.student_id,
      'medical_type': 0,
      'medical_type_detail': 0,
      'treatment': '',
      'precaution': '',
      'illness': this.medicalreason,
      'illness_date': this.medicaldate,
      'injury': '',
      'Operation': '',
      'family_medical_history': ''
    };

      switch (this.medical_type) {
            case "illness":{
                  params.medical_type = 1;
                  params.medical_type_detail = 1;
                  params.treatment = this.dataobj.illnesstreatment;
                  params.precaution = this.dataobj.illnessprecaution;
                }
                break;
            case "allergies":{
                  params.medical_type = 2;
                  params.medical_type_detail = 2;
                  params.treatment = this.dataobj.allergiestreatment;
                  params.precaution = this.dataobj.allergiesprecaution;
                }
                break;
            case "vaccination":{
                  params.medical_type = 3;
                  params.medical_type_detail = 3;
                  params.precaution = this.dataobj.vaccinationprecaution; 
                }
                break;
            case "other":{
                  params.medical_type = 4;
                  params.medical_type_detail = 4;
                  params.treatment = this.dataobj.othertreatment;
                  params.precaution = this.dataobj.otherprecaution; 
                  params.family_medical_history = this.dataobj.otherfmh;
                  params.injury = this.dataobj.otherinjury;
                  params.Operation = this.dataobj.otheroperation;
                }
                break;    
            default:
                alert(this.translate.instant("No medical type is given"));
        }
        const url = this.myService.commonUrl + "schoolerp/erpapi/medical/medicalhistory";
        this.myService.apiService(url, params).subscribe(details => {
          const data: any = details;
          if(data.responseCode == '200'){
            this.illnessForm.reset();
            this.allergiesForm.reset();
            this.vaccinationForm.reset();
            this.otherForm.reset();
            this.show = false;
            console.log(data.responseMessage)
            alert(this.translate.instant(data.responseMessage));
            this.getmedicallist(data.medical_type);
          }
        });
    
  }
}
