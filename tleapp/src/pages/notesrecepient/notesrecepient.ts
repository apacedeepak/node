import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { FormControl, FormBuilder, FormGroup } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';

/**
 * Generated class for the NotesrecepientPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notesrecepient',
  templateUrl: 'notesrecepient.html',
})
export class NotesrecepientPage {
    
    public globalObj: any = {};
    public form: FormGroup;
    public testRadioOpen: boolean;
    public staffList: any = [];
    public displayRecepient: any = [];
    

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController, private alertCtrl: AlertController,
      private http: HttpClient,private myProvider: CommonProvider) {
  }

  ionViewDidLoad() {
     this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.selectedType = "";
    this.globalObj.teacherAll = true;
    this.globalObj.assignedClassData = [];
  }
  
  onClose(){
      var finalObj = {
          receipent: [],
          selectedType: this.globalObj.selectedType,
          className: this.globalObj.selectClassName,
          classId: this.globalObj.selectedClass,
          sectionName: this.globalObj.selectSectionName,
          sectionId: this.globalObj.selectedSection,
          subjectName: this.globalObj.selectSubject,
          subjectId: this.globalObj.selectedSubject,
        };
      this.viewCtrl.dismiss(finalObj);
  }
  
  recepientTypeAlert(){
      let alert = this.alertCtrl.create();
        alert.setTitle('Assign');
        alert.addInput({
            type: 'radio',
            label: 'Class-section',
            value: 'classsection'
        });
        alert.addInput({
            type: 'radio',
            label: 'Group',
            value: 'group'
        });
//        alert.addInput({
//            type: 'radio',
//            label: 'Teachers',
//            value: 'teachers'
//        });
        alert.addInput({
            type: 'radio',
            label: 'Individuals',
            value: 'individuals'
        });
        
        alert.addButton({
      text: 'Ok',
      handler: data => {
        this.testRadioOpen = false;
        this.globalObj.selectedType = data;
        if(data == 'teachers'){
            this.getStaff();
        }
        if(data == 'classsection' || data == 'individuals' || data == 'group'){
            this.classSectionType();
        }
      }
    });

    alert.present().then(() => {
      this.testRadioOpen = true;
      
    });
  }
  
  getStaff(){
      this.displayRecepient = [];
      let params = {
        user_id: this.globalObj.loginId,
        user_type: this.globalObj.userType,
        school_id:this.globalObj.schoolId,
        token: this.globalObj.token,
        session_id: this.globalObj.sessionId
      };
      this.http.post(this.globalObj.serverUrl+"staffs/stafflistbyschoolid", params).subscribe(data => {
        const details: any = data;
        let staffList = details.response;
        for(let k in staffList){
            staffList[k]['check']=true;
            this.displayRecepient.push({
                user_id: staffList[k].userId,
                name: staffList[k].name,
                admissionNo: '',
                check: true
            })
        }
        this.staffList = staffList;
        
      });
  }
  
  teacherAll(){
      
      if(this.globalObj.teacherAll){
          for(let k in this.displayRecepient){
              this.displayRecepient[k].check = false;
          }
          this.globalObj.teacherAll = false;
      }else{
          for(let k in this.displayRecepient){
              this.displayRecepient[k].check = true;
          }
          this.globalObj.teacherAll = true;
      }
      
      this.displayRecepient = this.displayRecepient;
  }
  
  teacherSelect(index){
      if(this.displayRecepient[index].check){
          this.displayRecepient[index].check = false;
      }else{
          this.displayRecepient[index].check = true;
      }
      
      let flag = true;
      for(let k in this.displayRecepient){
          if(this.displayRecepient[k].check == false){
              flag = false;
          }
      }
      
      if(flag){
          this.globalObj.teacherAll = true;
      }else{
          this.globalObj.teacherAll = false;
      }
  }
  
    classSectionType(){
        this.globalObj.selectClass = "Select Class";
        this.globalObj.selectSection = "Select Section";
        this.globalObj.selectSubject = "Select Subject";
    }
    
    getClass(){ 
        const params = {
            "user_id": this.globalObj.loginId,
            "session_id": this.globalObj.sessionId,
            "school_id": this.globalObj.schoolId,
            "token": this.globalObj.token
          }
          const url = this.globalObj.serverUrl + 'users/assignedclass';
            this.http.post(url, params)
              .subscribe(details => {
                const data: any = details;
                if(data.response){
                  this.globalObj.assignedClassData = data.response.assigned_classes;
                }
                let alert = this.alertCtrl.create();
                alert.setTitle('Select Class');
                for(let i in this.globalObj.assignedClassData){
                    alert.addInput({
                        type: 'radio',
                        label: this.globalObj.assignedClassData[i].class_name,
                        value: this.globalObj.assignedClassData[i].class_id
                    });
                }
                
                alert.addButton({
                    text: 'Ok',
                    handler: data => {
                      this.testRadioOpen = false;
                      this.globalObj.selectedClass = data;
                      for(let i in this.globalObj.assignedClassData){
                          if(this.globalObj.assignedClassData[i].class_id == data){
                              this.globalObj.selectClass = "Class "+this.globalObj.assignedClassData[i].class_name;
                              this.globalObj.selectClassName = this.globalObj.assignedClassData[i].class_name;
                              this.globalObj.selectSection = "Select Section";
                                this.globalObj.selectSubject = "Select Subject";
                          }
                      }
                      
                    }
                  });

                  alert.present().then(() => {
                    this.testRadioOpen = true;

                  });
                
              })
    }
    
    getSection(){
        const params = {
            "user_id": this.globalObj.loginId,
            "session_id": this.globalObj.sessionId,
            "class_id": this.globalObj.selectedClass,
            "token": this.globalObj.token
          }

          const url = this.globalObj.serverUrl + 'users/assignedsection';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              this.globalObj.assignedSectionData = data.response.assigned_sections;
              let alert = this.alertCtrl.create();
                alert.setTitle('Select Section');
                for(let i in this.globalObj.assignedSectionData){
                    alert.addInput({
                        type: 'radio',
                        label: this.globalObj.assignedSectionData[i].section_name,
                        value: this.globalObj.assignedSectionData[i].section_id
                    });
                }
                
                alert.addButton({
                    text: 'Ok',
                    handler: data => {
                      this.testRadioOpen = false;
                      this.globalObj.selectedSection = data;
                      for(let i in this.globalObj.assignedSectionData){
                          if(this.globalObj.assignedSectionData[i].section_id == data){
                                this.globalObj.selectSection = "Section "+this.globalObj.assignedSectionData[i].section_name;
                                this.globalObj.selectSectionName = this.globalObj.assignedSectionData[i].section_name;
                                this.globalObj.selectSubject = "Select Subject";
                          }
                      }
                      
                      if(this.globalObj.selectedType == 'individuals'){
                         this.getStudents(data);
                      }
                      
                    }
                  });
                  alert.present().then(() => {
                    this.testRadioOpen = true;

                  });

              
            })
    }
    
    
    getStudents(sectionId){
        this.displayRecepient = [];
         let params = {
            user_id: this.globalObj.loginId,
            user_type: this.globalObj.userType,
            school_id:this.globalObj.schoolId,
            token: this.globalObj.token,
            session_id: this.globalObj.sessionId
          };
          
        this.http.post(this.globalObj.serverUrl+"communication/getcomposepopdata", params).subscribe(data => {
            const details: any = data;
            var sectionlist = details.response[0].assignClass;
            for(let k in sectionlist){
                if(sectionlist[k].section_id == sectionId){
                    for(let i in sectionlist[k].assignStudent){
                        this.displayRecepient.push({
                            user_id: sectionlist[k].assignStudent[i].user_id,
                            name: sectionlist[k].assignStudent[i].student_name,
                            admissionNo: sectionlist[k].assignStudent[i].admission_no,
                            check: true
                        })
                    }
                    
                }
            }
        });
    }
    
    getSubject(){
        const params = {
            "user_id": this.globalObj.loginId,
            "session_id": this.globalObj.sessionId,
            "section_id": this.globalObj.selectedSection,
            "token": this.globalObj.token
          }

          const url = this.globalObj.serverUrl + 'user_subjects/assignedsubjects';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              this.globalObj.assignedSubjectData = data.response.assigned_subjects
              let alert = this.alertCtrl.create();
                alert.setTitle('Select Subject');
                
                for(let i in this.globalObj.assignedSubjectData){
                    alert.addInput({
                        type: 'radio',
                        label: this.globalObj.assignedSubjectData[i].subject_name,
                        value: this.globalObj.assignedSubjectData[i].subject_id
                    });
                }
                
                alert.addButton({
                    text: 'Ok',
                    handler: data => {
                      this.testRadioOpen = false;
                      this.globalObj.selectedSubject = data;
                      for(let i in this.globalObj.assignedSubjectData){
                          if(this.globalObj.assignedSubjectData[i].subject_id == data){
                                this.globalObj.selectSubject = this.globalObj.assignedSubjectData[i].subject_name;
                                
                          }
                      }
                      if(this.globalObj.selectedType == 'group'){
                          
                          this.assignedGroup();
                          
                      }
                      
                      
                    }
                  });
                  alert.present().then(() => {
                    this.testRadioOpen = true;

                  });
              
            })
    }
    
    assignedGroup(){
        const params = {
            "session_id": this.globalObj.sessionId,
            "section_id":this.globalObj.selectedSection,
            "subject_id":this.globalObj.selectedSubject,
            "user_id":this.globalObj.loginId,
            "token": this.globalObj.token

        };
        
        const url = this.globalObj.serverUrl + 'groups/assignedgroups';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              let groups = data.response.data;
              
              for(let i in groups){
                  this.displayRecepient.push({
                        user_id: groups[i].id,
                        name: groups[i].group_name,
                        admissionNo: '',
                        check: true
                    })
              }
            });
        
    }
    
    okFunction(){
      var finalArr = [];
      for(let k in this.displayRecepient){
          if(this.displayRecepient[k].check == true){
              finalArr.push({
                name: this.displayRecepient[k].name,
                user_id: this.displayRecepient[k].user_id,
                admissionNo: this.displayRecepient[k].admissionNo,
                check: true
              });
          }
      }
      
      var finalObj = {
          receipent: finalArr,
          selectedType: this.globalObj.selectedType,
          className: this.globalObj.selectClassName,
          classId: this.globalObj.selectedClass,
          sectionName: this.globalObj.selectSectionName,
          sectionId: this.globalObj.selectedSection,
          subjectName: this.globalObj.selectSubject,
          subjectId: this.globalObj.selectedSubject,
        };
      
      this.displayRecepient = [];
      this.viewCtrl.dismiss(finalObj);
  }
  
  



}
