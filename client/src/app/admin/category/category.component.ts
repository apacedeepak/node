import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
category:FormGroup
subcategory:FormGroup
category_obj:any
addsubcategory:any=[]
addnewsub:FormArray
val=1
categoryList:any
  constructor( private http: HttpClient, private myService: BackendApiService, private translate: TranslateService) { }

  ngOnInit() {
    this.addsubcategory.push(this.val)
this.addnewsub=new FormArray([]);
this.addnewsub.push(new FormControl(''))
    this.category=new FormGroup({
      category_name:new FormControl(''),
      sub_category:this.addnewsub

    })
    this.subcategory=new FormGroup({
      category_name:new FormControl(''),
      sub_category:new FormControl('')
    })
    const param={
      'tag':"Category"
    }
    this.http.post(this.myService.constant.apiURL + "ctpconfiguration/getcategory", param).subscribe(data => {
      const detail:any=data
     var  category_json=detail.response.value
     this.category_obj=JSON.parse(category_json)
    });
    this.tablelist();
  }
  onSubmitsubcategory(val){
console.log(val)

  }
  onSubmitcategory(val){
console.log(val)
const param ={
  "category":val.category_name,
  "sub_category":val.sub_category
}
this.http.post(this.myService.constant.apiURL + "ctpconfiguration/insertcategory", param).subscribe(data => {
  const detail:any=data
  console.log(detail)
  if(detail.response_status.status=="200"){
    alert(detail.response_status.message)
    window.location.reload()
    this.tablelist()
  }
  if(detail.response_status.status=="202"){
    alert(detail.response_status.message)
  }
});

  }
  addmoresub(){
this.val++;
this.addsubcategory.push(this.val)
this.addnewsub.push(new FormControl(''))
  }
  tablelist(){
   const params = {"tag":"category"};
    var url = this.myService.constant.apiURL + "ctpconfiguration/gethocontactdetails";
    // hit post API to add/edit fee head
    // fee_head_masters/addfeehead
    this.http.post(url, params).subscribe(data => {
      
      const result: any = data;


        var obj = result.response.value;
        this.categoryList =JSON.parse(obj)
      
    })
  }
}
