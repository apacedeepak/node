import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params } from "@angular/router";
import { resolve } from 'dns';
import { reject } from 'q';

@Component({
  selector: 'app-equipmentmaster',
  templateUrl: './equipmentmaster.component.html',
  styleUrls: ['./equipmentmaster.component.css']
})
export class EquipmentmasterComponent implements OnInit {

  equipmentForm : FormGroup;
  public errorMessage: any = {};
  public successMessage: any = {};
  public equipmentMasterArr: any = [];
  public equipmentId: any = {};
  public equipmentData: any = {};
  public editOrUpadte = 0;
  public postJson: any = {};
  public equipmentCheckArr: any = [];
  mylang:any='';
  
  constructor(private http: HttpClient, private myService: BackendApiService,private translate: TranslateService, private activatedRoute: ActivatedRoute, private elem: ElementRef) {
    this.mylang= window.localStorage.getItem('language');
    if(this.mylang){
      translate.setDefaultLang( this.mylang);
    }
    else{
      translate.setDefaultLang( 'en');
    }
  }

  ngOnInit() {
    this.editOrUpadte = 0;

      this.getFromSet();

      /* Get All Course Mode Master List */
      this.getEquipmentList();
  }

  getFromSet() {
    this.equipmentForm = new FormGroup({
      equipment_name: new FormControl('', Validators.required),
      status: new FormControl(true),
      id: new FormControl('')
    });
  }

  saveEquipment(equipmentArr){
    if (equipmentArr.status == 1) {
      var status = "Active";
    } else {
      var status = "Inactive";
    }
    let today = new Date();
    
    if(equipmentArr.id){
      this.postJson = {
        "id" : equipmentArr.id,
        "equipment_name" : equipmentArr.equipment_name,
        "status" : status,
        "added_date": today
      }
    } else{
      this.postJson = {
        "equipment_name" : equipmentArr.equipment_name,
        "status" : status,
        "added_date": today
      };
    }

    this.duplicateEquipmentCheck(equipmentArr.equipment_name, status).then( checkVal => {
      if(checkVal == 1){
        this.errorMessage.message = this.translate.instant("Equipment already exists");
        setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
      }else{
        this.http.post(this.myService.constant.apiURL+ "equipment/createequipment", this.postJson).subscribe(data => {
          const datas: any = data;
          if(datas.response_status.response_status == 200){
            this.successMessage.message = datas.response_status.response;
            setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
            this.getFromSet();
          }else{
            this.errorMessage.message = this.translate.instant("Error Occured");
            setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
          }
          this.getEquipmentList();
        });
      }
    });
  }

  /* Get edit data from database base of equipment id*/
  editEquipment(equipmentId){
    if(equipmentId){ 
      this.editOrUpadte = 1;
      this.http.get(this.myService.constant.apiURL+ "equipment/getequipmentbyid?equipmentId="+ equipmentId).subscribe(detail => {
        const data: any = detail;
        this.equipmentData = data.response;
        
        if(this.equipmentData.status == 'Active'){
          var status = true;
        }else{
          var status = false;
        }
     
        this.equipmentForm.patchValue({
          id: this.equipmentData.id,
          equipment_name: this.equipmentData.equipment_name,
          status: status
        });
        this.getEquipmentList();
      });
    }
  }

  /* Get Equipment List */
  getEquipmentList(){
    this.http.get(this.myService.constant.apiURL+ "equipment/getequipment").subscribe(detail => {
      this.equipmentMasterArr = detail;
      this.equipmentMasterArr = this.equipmentMasterArr.response;
    });
  }

  /*
  * Duplicate Equipment Check
  */


  duplicateEquipmentCheck(equipmentName,status){
    return new Promise( (resolve, reject) => {
      if(equipmentName){
        const param = {
          "equipment_name": equipmentName
        }
        this.http.post(this.myService.constant.apiURL+ "equipment/getequipmentbyname", param).subscribe(detail => {
          this.equipmentCheckArr = detail;
          this.equipmentCheckArr = this.equipmentCheckArr.response;
          if(this.equipmentCheckArr){
            if(this.equipmentCheckArr.status == status){
              resolve(1);
            }else{
              resolve(0);
            }
          }else{
            resolve(0);
          }
        });
      }
    }).catch(err => console.log(err));

  }

}
