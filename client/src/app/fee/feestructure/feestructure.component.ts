import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators,FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-feestructure',
  templateUrl: './feestructure.component.html',
  styleUrls: ['./feestructure.component.css']
})
export class FeestructureComponent implements OnInit {

  addFeestructureForm: FormGroup;
  fee_structure_json:any;
  fee_structure_object:any;
  feestructurelistdata:any = [];
  successmsg: any = '';
  errormsg: any = '';
  params:any;
  searchParam:any;
  classArrayList:any=[];
  classToArrayList:any=[];
  sectionArrayList:any=[];
  class_list_object:any;
  section_list_object:any;
  frmArray: FormArray;
  fromClass:any='';
  toClass:any='';
  boardlist:any=[]
  
  constructor(private http: HttpClient, private myservice: BackendApiService) { }
  ngOnInit() {
    this.http.get(this.myservice.constant.apiURL + "boards/getallboard").subscribe(data => {
      const boards: any = data;
      this.boardlist = boards.response
    })

    this.frmArray = new FormArray([]);
    



    this.addFeestructureForm = new FormGroup({
      id: new FormControl(''),
      fee_structure_name: new FormControl('', Validators.required),
      from_class: new FormControl(''),
      to_class: new FormControl(''),
      class_section : this.frmArray,
      
      //orders: new FormArray(this.xxx.map(c => new FormControl(false)))
    });
   // console.log(this.addFeestructureForm.controls.orders);

    this.searchParam = {"status":"Active"};
    this.getFeestructureList();

  }

  onSubmit(value){
    //console.log(value);
    var tempArray:any=[];
    var k=0;

    for(k=0;k<value.class_section.length;k++){
    if(value.class_section[k]){

      // collect data of check boxes if checked...
      tempArray.push(this.sectionArrayList[k].id);
    }


    }

    //console.log(tempArray);
    var postdata: any = '';
    

    if(value.id != ""){
      
     postdata = {
        "fee_structure_name": value.fee_structure_name,
        "id": value.id,
        "modified_by": window.localStorage.getItem('user_id'),
        "modified_date": new Date(),
        "school_id": window.localStorage.getItem('school_id'),
        "session_id": window.localStorage.getItem('session_id'),
        "class_sections": tempArray
      }


    }
    else{
      postdata = {
        "fee_structure_name": value.fee_structure_name,
        "status": "Active",
        "added_by": window.localStorage.getItem('user_id'),
        "added_date": new Date(),
        "school_id": window.localStorage.getItem('school_id'),
        "session_id": window.localStorage.getItem('session_id'),
        "class_sections": tempArray
      }
   }
    



    var url = value.id == ""  ? this.myservice.constant.apiURL + "fee_structure_masters/addfeestructure" : this.myservice.constant.apiURL + "fee_structure_masters/editfeestructure";
    // hit post API to add/edit fee structure
    
    this.http.post(url, postdata).subscribe(data => {


      const details: any = data;

      if (details.response_status.status == "200") {
        this.searchParam = {"status":"Active"};
        this.getFeestructureList();
        this.addFeestructureForm.patchValue({
          id:"",
          fee_structure_name: "",
          from_class: "",
          to_class: "",
          
        });

        //SET FALSE/BLANK TO ALL CHECKBOXES AFTER SUCCESS...
        for(let i in  this.sectionArrayList){
        (<FormArray>this.addFeestructureForm.get("class_section")).controls[i].setValue(false);
        }

        
        this.successmsg = details.response_status.messasge;
        this.errormsg = '';

        
        //this.getFeeHeadList();
        this.msgRemoval();
      }
      else if (details.response_status.status == "202") {
        this.successmsg = '';
        this.errormsg = details.response_status.messasge;
        this.msgRemoval();
      }
      else {
        this.successmsg = '';
        this.errormsg = details.response_status.messasge;
        this.msgRemoval();
      }

      

    });


    


  }

  getFeestructureList(){

  
    var url = this.myservice.constant.apiURL + "fee_structure_masters/getfeestructurelist";
    this.searchParam.school_id = window.localStorage.getItem('school_id');
    this.searchParam.session_id = window.localStorage.getItem('session_id');
    this.http.post(url, this.searchParam).subscribe(data => {
      const result: any = data;

      if(result.response_status.status == "200") {
      this.feestructurelistdata = result.response;
      console.log(this.feestructurelistdata);
      }

    });

  }



   /*
  Delete the Fee Structure 
  */

 deletefeestructure(id){
 if(confirm("Are you sure to delete the fee structure")){
 var url = this.myservice.constant.apiURL + "fee_structure_masters/deletefeestructure";
 var postdata = {"id":id};
 this.http.post(url, postdata).subscribe(data => {
   const details: any = data;
   if (details.response_status.status == "200") {
     this.successmsg = details.response_status.messasge;
     this.errormsg = '';
     
     this.searchParam = {"status":"Active"};
     this.getFeestructureList();
     this.msgRemoval();
   }else{
     this.successmsg = "";
     this.errormsg = 'Something went wrong...';
     this.msgRemoval();
   }
   
});
}else{
 return false;
}
}


/*
Details of Fee structure by id
*/

feestructuredetails(id){
  var url = this.myservice.constant.apiURL + "fee_structure_masters/feestructuredetails";
  var postdata = {"id":id};
  this.http.post(url, postdata).subscribe(data => {
    const details: any = data;
    //console.log(details.response);
    //console.log(this.sectionArrayList);

   var k=0;
   var sids = [];
   for(k=0;k<details.response.fee_strcuture_master_map_fee_structure_detail.length;k++)
   {
    sids.push(details.response.fee_strcuture_master_map_fee_structure_detail[k].section_id);
   }
    //console.log(sids);
    if (details.response_status.status == "200") {
    
      // auto fill data...
      this.addFeestructureForm.patchValue({
      "fee_structure_name": details.response.fee_structure_name,
      "id":details.response.id
      });


      for(let i in  this.sectionArrayList){
      (<FormArray>this.addFeestructureForm.get("class_section")).controls[i].setValue(false);
      if(sids.indexOf(this.sectionArrayList[i].id) >=0 ){
      (<FormArray>this.addFeestructureForm.get("class_section")).controls[i].setValue(true);
      }
      }

    }else{
      this.successmsg = "";
      this.errormsg = 'Something went wrong...';
    }

 });


}


  
  

  msgRemoval(){

    setTimeout(()=>{
      this.successmsg = "";
      this.errormsg = "";
    },3000);
  }

  getToClass(value){
    //console.log(value);
    //console.log(this.classArrayList);
    this.addFeestructureForm.patchValue({
      
      to_class: "",
      
    });
    this.classToArrayList = [];
    this.fromClass = value;
    this.class_list_object.forEach(element => {

      if(element.id >= value){
      var classtolist = {
        'id': element.id,
        'class_name':element.class_name
      };

      this.classToArrayList.push(classtolist);

      }

      
    });


  }

  selectSectionBox(value){
  this.toClass = value;
 
  var toRangeClass = parseInt(this.toClass);
  var fromRangeClass = parseInt(this.fromClass);

  for(let i in this.sectionArrayList){

    //console.log(this.sectionArrayList[i].class_id);
    if(parseInt(this.sectionArrayList[i].class_id) <=toRangeClass && parseInt(this.sectionArrayList[i].class_id) >= fromRangeClass ){
      (<FormArray>this.addFeestructureForm.get("class_section")).controls[i].setValue(true);

    }else{
      (<FormArray>this.addFeestructureForm.get("class_section")).controls[i].setValue(false);
    }


  }

  }
onboardchange(val){
  this.class_list_object=[]
  this.classArrayList=[]
  this.sectionArrayList=[]
  while (this.frmArray.length !== 0) {
    this.frmArray.removeAt(0)
  }
  this.params = {"school_id":window.localStorage.getItem('school_id'),"status":"Active"};

    
  var url = this.myservice.constant.apiURL + "/classes/getclasslist";
  // hit post API to add/edit fee head
  // fee_head_masters/addfeehead
  this.http.post(url, this.params).subscribe(data => {
    const result: any = data;
    console.log(result);
    if(result.response_status.status == "200") {
      let classes =result.response.filter(index => index.boardId == val);
      this.class_list_object = classes;
      console.log(classes)
    }
    //this.fee_structure_object = JSON.parse(this.fee_structure_json);
    //console.log(this.fee_structure_object);
    this.class_list_object.forEach(element => {
      var classlist = {
        'id': element.id,
        'class_name':element.class_name
      };
      this.classArrayList.push(classlist);
    });




    this.params = {"school_id":window.localStorage.getItem('school_id')};

  
    var url = this.myservice.constant.apiURL + "/sections/schoolwisesectionlist";
    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;
     // console.log(result);
      if(result.response) {
        let sections =result.response.filter(index => index.boardId == val);
        this.section_list_object = sections;
      }
     
      this.section_list_object.forEach(element => {
        var sectionlist = {
          'id': element.id,
          'section_name':element.section_name,
          'class_id': element.classId
        };
        this.sectionArrayList.push(sectionlist);
        this.frmArray.push(new FormControl(''));
      });
 
    });


  });
}


}
