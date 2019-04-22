import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params } from "@angular/router";

@Component({
  selector: 'app-classmaster',
  templateUrl: './classmaster.component.html',
  styleUrls: ['./classmaster.component.css']
})
export class ClassmasterComponent implements OnInit {

  classForm : FormGroup;
  frmArray : FormArray;
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte = 0;
  public boardList: any = {};
  public classList: any = {};
  public postJson: any = {};
  public schoolId: any;
  public addedBy: any;
  public subjectList: any = {};
  public assignedClass: any = {};
  mylang:any='';

  constructor(private http: HttpClient,  private myService: BackendApiService,private translate: TranslateService, private activatedRoute: ActivatedRoute, private fb: FormBuilder) {
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
    this.frmArray = new FormArray([]);

    this.schoolId = window.localStorage.getItem('school_id');
    this.addedBy = window.localStorage.getItem('user_id');

    /* Form Set function call Here */
    this.getFromSet();

    /* Call function all active assign board*/
    this.getBoardList();
    
  }

  /* Form Set Here */
  getFromSet() {
    this.classForm = new FormGroup({
      board: new FormControl('', Validators.required),
      id: new FormControl(''),
      class_id: this.frmArray
    });
  }

  /* Save data in database here */
  saveClass(value){
    let classArr = value.class_id;
    let today = new Date();
    var tempClassArray:any=[];
    var dbClassData:any = [];
     
    var k=0;
    for(k=0;k<classArr.length;k++){
      if(classArr[k]){
        // collect data of check boxes if checked...
        tempClassArray.push({
          rack_id: this.classList[k].rack_id,
          rack_name : this.classList[k].rack_name,
        });
      }
    }

    var j=0;
    for(j=0;j<this.assignedClass.length;j++){
      if(this.assignedClass[j]){
        dbClassData.push(this.assignedClass[j].classId);
      }
    }

    let res = value.board.split("_");
    var paramArr = {
      'postvalue' : tempClassArray,
      'lms_board_id' : res[1],
      'board_id' : res[0],
      'added_by' : this.addedBy,
      'date' : today,
      'school_id' : this.schoolId,
      'dbvalue': dbClassData
    };

    this.http.post(this.myService.constant.apiURL + "classes/assignboardclass", paramArr).subscribe(data => {
      const detail:any = data;
      this.successMessage.message = detail.response.message;
      setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
      //this.getFromSet();
    });
  }

  /* Get all active assign board*/
  getBoardList(){
    this.http.get(this.myService.constant.apiURL+"boards/getactiveboard").subscribe(data => {
      const detail:any = data;
      this.boardList = detail.response;
    });
  }

  /* Get Board wise class list from lms and assigned class */
  async getClassList(boardVal){

    for(let i in  this.classList){
    (<FormArray>this.classForm.get("class_id")).controls[i].setValue(false);
    }
    let res = boardVal.split("_");
    var Params = {'board_id': res[1], 'rack_id': res[1], "board":res[0]};
    this.getBoardClassList(Params);
    
  }

  async getBoardClassList(Params){
    await this.http.post(this.myService.constant.apiURL+"lmsapis/classlist", Params).subscribe(data => {
      const detail:any = data;
      this.classList = detail.response.data;
      this.classList.forEach(data => {
        this.frmArray.push(new FormControl(''));
      });
      this.getboardwiseclass(Params.board);
    });
  }

  /* Get board and class wise subject list from lms */
getSubjectList(boardId, classId){
    var Params = {'board_id': boardId, 'rack_id': classId};
    this.http.post(this.myService.constant.apiURL+"lmsapis/getsubjectlist", Params).subscribe(data => {
      const detail:any = data;
      this.subjectList = detail.response.data;
    });
  }

  /* Get board wise class from database */
  async getboardwiseclass(boardId){
    var Params = {'board_id': boardId};
    this.http.post(this.myService.constant.apiURL+"classes/getboardwiseclass", Params).subscribe(data => {
      const detail:any = data;
      this.assignedClass = detail.response;
      
      let classActiveData= this.assignedClass.filter(data=>data.status=="Active");
      this.classList.forEach( (classArr, i) => {
        let rUrl =function(url) {return url.classId==classArr.rack_id}
        if(classActiveData.find(rUrl)){
          (<FormArray>this.classForm.get("class_id")).controls[i].setValue(true);
          //(<FormArray>this.classForm.get("class_id")).controls[i].disable();
        }
      });
    });
  }
}
