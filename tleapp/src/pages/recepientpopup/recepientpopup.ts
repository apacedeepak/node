import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { SpinnerVisibilityService } from 'ng-http-loader/services/spinner-visibility.service';
/**
 * Generated class for the RecepientpopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recepientpopup',
  templateUrl: 'recepientpopup.html',
})
export class RecepientpopupPage {
    
    public globalObj: any = {};
    public admindata: any = [];
    public sectionlists: any = [];
    public sectionlist: any = [];
    public teacherList: any = [];
    public classTeacherList: any = [];
    public displayRecepient: any = [];
    public staffList: any = [];
    public secIdParent: any = [];
    public secIdStudent: any = [];
    public checkedItems:boolean[];
    
  constructor(public navCtrl: NavController, public navParams: NavParams,
      private http: HttpClient,private myProvider: CommonProvider,
      public viewCtrl: ViewController,private spinner: SpinnerVisibilityService) {
      
      this.globalObj.receipent = navParams.get('receipent');
      this.globalObj.selectedType = navParams.get('selectedType');
      this.globalObj.selectedSection = navParams.get('selectedSection');
      this.globalObj.adminData = navParams.get('adminData');
      this.globalObj.parentData = navParams.get('parentData');
      this.globalObj.studentData = navParams.get('studentData');
      this.globalObj.teacherData = navParams.get('teacherData');
      this.globalObj.groupAll = [];
      this.globalObj.groupFlag = false;
  }

  ionViewDidLoad() {
      
      this.spinner.show();
      
      switch(this.globalObj.selectedType)
      {
        case 'classteach':
            this.globalObj.selectedTypes = 'Class Teacher';
            break;
        case 'subteach': 
            this.globalObj.selectedTypes = 'Subject Teacher';
            break;
        case 'admin': 
            this.globalObj.selectedTypes = 'Admin';
            break;
        case 'parent': 
            this.globalObj.selectedTypes = 'Parent';
            break;
        case 'student': 
            this.globalObj.selectedTypes = 'Student';
            break;
        case 'staff': 
            this.globalObj.selectedTypes = 'Staff';
            break;
        case 'group': 
            this.globalObj.selectedTypes = 'Group';
            break;
        default:
            this.globalObj.selectedTypes = '';
      }
      
//      if(this.globalObj.selectedType == 'classteach'){
//          this.globalObj.selectedType = 'Class Teacher';
//      }else if(this.globalObj.selectedType == 'subteach'){
//          this.globalObj.selectedType = "Subject Teacher";
//      }else if(this.globalObj.selectedType == 'subteach'){
//          this.globalObj.selectedType = "Subject Teacher";
//      }else if(this.globalObj.selectedType == 'subteach'){
//          this.globalObj.selectedType = "Subject Teacher";
//      }else if(this.globalObj.selectedType == 'subteach'){
//          this.globalObj.selectedType = "Subject Teacher";
//      }else if(this.globalObj.selectedType == 'subteach'){
//          this.globalObj.selectedType = "Subject Teacher";
//      }
      
      this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.parentStud = false;
    this.globalObj.parentStudBoth = false;
    this.globalObj.userFlag = '';
    this.globalObj.parentStudCheck = false;
    this.globalObj.receipentArr = [];
    this.globalObj.groupSubject = [];
    this.globalObj.groupAll = [];
    this.checkedItems = new Array();
    
    this.globalObj.selectClassSec = '';
    this.globalObj.selectSub = '';
    
    
    
    
    
    let params = {
        user_id: this.globalObj.loginId,
        user_type: this.globalObj.userType,
        school_id:this.globalObj.schoolId,
        token: this.globalObj.token,
        session_id: this.globalObj.sessionId
      };
      
      
//    this.http.post(this.globalObj.serverUrl+"communication/getcomposepopdata", params).subscribe(data => {
//        const details: any = data;
        this.admindata = this.globalObj.adminData
        var sectionlist = this.globalObj.studentData
        var sectionlists = this.globalObj.parentData
        
        console.log(sectionlist)
        
        for(let i in sectionlist){
            if(this.globalObj.selectedType == 'student' && this.globalObj.selectedSection.length > 0){
                if(this.globalObj.selectedSection.indexOf(sectionlist[i].section_id) != -1){
                     this.sectionlist.push({
                        section_id: sectionlist[i].section_id,
                        section_name: sectionlist[i].section_name,
                        check: false,
                        assignStudent:[]
                    });

                    for(let k in sectionlist[i].assignStudent){
                        this.sectionlist[i].assignStudent.push({
                            user_id: sectionlist[i].assignStudent[k].user_id,
                            old_user_id: sectionlist[i].assignStudent[k].old_user_id,
                            student_name: sectionlist[i].assignStudent[k].student_name,
                            admission_no: sectionlist[i].assignStudent[k].admission_no,
                            parent_userId: sectionlist[i].assignStudent[k].parent_userId,
                            check: true
                        })
                    }
                }else{
                     this.sectionlist.push({
                        section_id: sectionlist[i].section_id,
                        section_name: sectionlist[i].section_name,
                        check: false,
                        assignStudent:[]
                    });

                    for(let k in sectionlist[i].assignStudent){
                        this.sectionlist[i].assignStudent.push({
                            user_id: sectionlist[i].assignStudent[k].user_id,
                            old_user_id: sectionlist[i].assignStudent[k].old_user_id,
                            student_name: sectionlist[i].assignStudent[k].student_name,
                            admission_no: sectionlist[i].assignStudent[k].admission_no,
                            parent_userId: sectionlist[i].assignStudent[k].parent_userId,
                            check: true
                        })
                    }
                }
                   
            }else{
                this.sectionlist.push({
                    section_id: sectionlist[i].section_id,
                    section_name: sectionlist[i].section_name,
                    check: false,
                    assignStudent:[]
                });
                this.checkedItems.push(false);

                for(let k in sectionlist[i].assignStudent){
                    this.sectionlist[i].assignStudent.push({
                        user_id: sectionlist[i].assignStudent[k].user_id,
                        old_user_id: sectionlist[i].assignStudent[k].old_user_id,
                        student_name: sectionlist[i].assignStudent[k].student_name,
                        admission_no: sectionlist[i].assignStudent[k].admission_no,
                        parent_userId: sectionlist[i].assignStudent[k].parent_userId,
                        check: true
                    })
                }
            }
            
        }
        
        
        for(let i in sectionlists){
             if(this.globalObj.selectedType == 'parent' && this.globalObj.selectedSection.length > 0){
                if(this.globalObj.selectedSection.indexOf(sectionlists[i].section_id) != -1){
                     this.sectionlists.push({
                        section_id: sectionlists[i].section_id,
                        section_name: sectionlists[i].section_name,
                        check: false,
                        assignStudent:[]
                    });

                    for(let k in sectionlists[i].assignStudent){
                        this.sectionlists[i].assignStudent.push({
                            user_id: sectionlists[i].assignStudent[k].user_id,
                            old_user_id: sectionlists[i].assignStudent[k].old_user_id,
                            student_name: sectionlists[i].assignStudent[k].student_name,
                            admission_no: sectionlists[i].assignStudent[k].admission_no,
                            parent_userId: sectionlists[i].assignStudent[k].parent_userId,
                            check: true
                        })
                    }
                }else{
                     this.sectionlists.push({
                        section_id: sectionlists[i].section_id,
                        section_name: sectionlists[i].section_name,
                        check: false,
                        assignStudent:[]
                    });

                    for(let k in sectionlists[i].assignStudent){
                        this.sectionlists[i].assignStudent.push({
                            user_id: sectionlists[i].assignStudent[k].user_id,
                            old_user_id: sectionlists[i].assignStudent[k].old_user_id,
                            student_name: sectionlists[i].assignStudent[k].student_name,
                            admission_no: sectionlists[i].assignStudent[k].admission_no,
                            parent_userId: sectionlists[i].assignStudent[k].parent_userId,
                            check: true
                        })
                    }
                }
                   
            }else{
                this.sectionlists.push({
                    section_id: sectionlists[i].section_id,
                    section_name: sectionlists[i].section_name,
                    check: false,
                    assignStudent:[]
                });
                this.checkedItems.push(false);

                for(let k in sectionlists[i].assignStudent){
                    this.sectionlists[i].assignStudent.push({
                        user_id: sectionlists[i].assignStudent[k].user_id,
                        old_user_id: sectionlists[i].assignStudent[k].old_user_id,
                        student_name: sectionlists[i].assignStudent[k].student_name,
                        admission_no: sectionlists[i].assignStudent[k].admission_no,
                        parent_userId: sectionlists[i].assignStudent[k].parent_userId,
                        check: true
                    })
                }
            }
            
        }
        
        const teacherList = this.globalObj.teacherData;
        for(let key in teacherList){
            if(teacherList[key].class_teacher == 'No'){
              this.teacherList.push({
                    name: teacherList[key].name,
                    user_id: teacherList[key].user_id
                  });
            }else{
               this.classTeacherList.push({
                    name: teacherList[key].name,
                    user_id: teacherList[key].user_id
                  });
            }
        }
        
        this.http.post(this.globalObj.serverUrl+"staffs/stafflistbyschoolid", params).subscribe(data => {
        const details: any = data;
        this.staffList = details.response;
        
        this.globalObj.userFlag = this.globalObj.selectedType;
        
        if(this.globalObj.selectedType){
            this.recepientList(this.globalObj.selectedType);
        }
        
        
        
        
    if(this.globalObj.selectedType == 'admin'){
        this.globalObj.adminRadioCheck = true;
        this.globalObj.parentRadioCheck = false;
        this.globalObj.studentRadioCheck = false;
        this.globalObj.staffRadioCheck = false;
        this.globalObj.classteachRadioCheck = false;
        this.globalObj.subteachRadioCheck = false;
        this.recepientList('admin');
    }else if(this.globalObj.selectedType == 'parent'){
        this.globalObj.adminRadioCheck = false;
        this.globalObj.parentRadioCheck = true;
        this.globalObj.studentRadioCheck = false;
        this.globalObj.staffRadioCheck = false;
        this.globalObj.classteachRadioCheck = false;
        this.globalObj.subteachRadioCheck = false;
        
        this.globalObj.parentStud = true;
        this.globalObj.parentStudBoth = true;
        this.secIdStudent = [];
        //this.secIdParent = this.globalObj.selectedSection;
       // this.selectedStudent();
        
    }else if(this.globalObj.selectedType == 'student'){
        this.globalObj.adminRadioCheck = false;
        this.globalObj.parentRadioCheck = false;
        this.globalObj.studentRadioCheck = true;
        this.globalObj.staffRadioCheck = false;
        this.globalObj.classteachRadioCheck = false;
        this.globalObj.subteachRadioCheck = false;
        
        this.globalObj.parentStud = true;
        this.globalObj.parentStudBoth = false;
        this.secIdParent = [];
        //this.secIdStudent = this.globalObj.selectedSection;
       // this.selectedStudent();
        
    }else if(this.globalObj.selectedType == 'staff'){
        this.globalObj.adminRadioCheck = false;
        this.globalObj.parentRadioCheck = false;
        this.globalObj.studentRadioCheck = false;
        this.globalObj.staffRadioCheck = true;
        this.globalObj.classteachRadioCheck = false;
        this.globalObj.subteachRadioCheck = false;
        this.recepientList('staff');
    }else if(this.globalObj.selectedType == 'classteach'){
        this.globalObj.adminRadioCheck = false;
        this.globalObj.parentRadioCheck = false;
        this.globalObj.studentRadioCheck = false;
        this.globalObj.staffRadioCheck = false;
        this.globalObj.classteachRadioCheck = true;
        this.globalObj.subteachRadioCheck = false;
        this.recepientList('classteach');
    }else if(this.globalObj.selectedType == 'subteach'){
        this.globalObj.adminRadioCheck = true;
        this.globalObj.parentRadioCheck = false;
        this.globalObj.studentRadioCheck = false;
        this.globalObj.staffRadioCheck = false;
        this.globalObj.classteachRadioCheck = false;
        this.globalObj.subteachRadioCheck = true;
        this.recepientList('subteach');
    }else{
        this.globalObj.adminRadioCheck = false;
        this.globalObj.parentRadioCheck = false;
        this.globalObj.studentRadioCheck = false;
        this.globalObj.staffRadioCheck = false;
        this.globalObj.classteachRadioCheck = false;
        this.globalObj.subteachRadioCheck = false;
    }
        
   // })
    //this.spinner.hide();
    });
    
    
    
  }
  
  recepientList(flag){ 
      this.globalObj.userFlag = flag;
      this.displayRecepient = [];
      
      this.globalObj.receipentArr = [];
      
      for(let j in this.globalObj.receipent){
          this.globalObj.receipentArr.push(this.globalObj.receipent[j].user_id);
      }
      
      
      if(flag == 'admin'){
          this.globalObj.parentStud = false;
          this.globalObj.parentStudBoth = false;
          this.secIdStudent = [];
          this.secIdParent = [];

          for(let k in this.admindata){
              if(this.globalObj.adminRadioCheck){
                  
                      if(this.globalObj.receipentArr.indexOf(this.admindata[k].user_id) != -1){
                          this.displayRecepient.push({
                            user_id: this.admindata[k].user_id,
                            name: this.admindata[k].name,
                            admissionNo: '',
                            check: true
                        })
                      }else{
                          this.displayRecepient.push({
                            user_id: this.admindata[k].user_id,
                            name: this.admindata[k].name,
                            admissionNo: '',
                            check: false
                        })
                      }
                 
                  
              }else{
                  this.displayRecepient.push({
                    user_id: this.admindata[k].user_id,
                    name: this.admindata[k].name,
                    admissionNo: '',
                    check: false
                })
              }
          }
      }else if(flag == 'parent'){
            this.globalObj.parentStud = true;
            this.globalObj.parentStudBoth = true;
            this.secIdStudent = [];
            

      }else if(flag == 'student'){
            this.globalObj.parentStud = true;
            this.globalObj.parentStudBoth = false;
            this.secIdParent = [];
            

      }else if(flag == 'staff'){
        this.globalObj.parentStud = false;
        this.globalObj.parentStudBoth = false;
        this.secIdStudent = [];
        this.secIdParent = [];
      
        for(let k in this.staffList){
            
            if(this.globalObj.staffRadioCheck){
                
                if(this.globalObj.receipentArr.indexOf(this.staffList[k].userId) != -1){
                    this.displayRecepient.push({
                      user_id: this.staffList[k].userId,
                      name: this.staffList[k].name,
                      admissionNo: '',
                      check: true
                  })
                }else{
                    this.displayRecepient.push({
                      user_id: this.staffList[k].userId,
                      name: this.staffList[k].name,
                      admissionNo: '',
                      check: false
                  })
                }
               
            }else{
                this.displayRecepient.push({
                    user_id: this.staffList[k].userId,
                    name: this.staffList[k].name,
                    admissionNo: '',
                    check: false
                })
            }
        }
          
      }else if(flag == 'classteach'){
        this.globalObj.parentStud = false;
        this.globalObj.parentStudBoth = false;
        this.secIdStudent = [];
        this.secIdParent = [];
        
        for(let k in this.classTeacherList){
            
            if(this.globalObj.classteachRadioCheck){
                if(this.globalObj.receipentArr.indexOf(this.classTeacherList[k].user_id) != -1){
                          this.displayRecepient.push({
                            user_id: this.classTeacherList[k].user_id,
                            name: this.classTeacherList[k].name,
                            admissionNo: '',
                            check: true
                        }) 
                      }else{
                          this.displayRecepient.push({
                            user_id: this.classTeacherList[k].user_id,
                            name: this.classTeacherList[k].name,
                            admissionNo: '',
                            check: false
                        }) 
                      }
            }else{
               this.displayRecepient.push({
                    user_id: this.classTeacherList[k].user_id,
                    name: this.classTeacherList[k].name,
                    admissionNo: '',
                    check: false
                }) 
            }
            
        }
        
      }else if(flag == 'subteach'){
        this.globalObj.parentStud = false;
        this.globalObj.parentStudBoth = false;
        this.secIdStudent = [];
        this.secIdParent = [];
          for(let k in this.teacherList){
              
              if(this.globalObj.subteachRadioCheck){
                  if(this.globalObj.receipentArr.indexOf(this.teacherList[k].user_id) != -1){
                          this.displayRecepient.push({
                            user_id: this.teacherList[k].user_id,
                            name: this.teacherList[k].name,
                            admissionNo: '',
                            check: false
                        })
                      }else{
                          this.displayRecepient.push({
                            user_id: this.teacherList[k].user_id,
                            name: this.teacherList[k].name,
                            admissionNo: '',
                            check: false
                        })
                      }
              }else{
                  this.displayRecepient.push({
                    user_id: this.teacherList[k].user_id,
                    name: this.teacherList[k].name,
                    admissionNo: '',
                    check: false
                })
              }
            
        }
      }
  }
  
  
  selectedStudent(){
      this.globalObj.receipentArr = [];
      
      for(let j in this.globalObj.receipent){
          this.globalObj.receipentArr.push(this.globalObj.receipent[j].user_id);
      }
      
      if(this.globalObj.selectedType == 'parent'){ 
          this.secIdStudent = [];
            for(let ind in this.sectionlists){
                    if(this.secIdParent.indexOf(this.sectionlists[ind].section_id) != -1){
                        for(let index in this.sectionlists[ind].assignStudent){
                            if(this.globalObj.receipentArr.indexOf(this.sectionlists[ind].assignStudent[index].user_id) != -1){
                                this.displayRecepient.push({
                                    name: this.sectionlists[ind].assignStudent[index].student_name+ ' (P)',
                                    user_id: this.sectionlists[ind].assignStudent[index].user_id,
                                    admissionNo: this.sectionlists[ind].assignStudent[index].admission_no,
                                    check: true
                                  });
                            }else{
                                this.displayRecepient.push({
                                    name: this.sectionlists[ind].assignStudent[index].student_name+ ' (P)',
                                    user_id: this.sectionlists[ind].assignStudent[index].user_id,
                                    admissionNo: this.sectionlists[ind].assignStudent[index].admission_no,
                                    check: false
                                  });
                            }
                            
                        }
                    }
                }
           

        }else if(this.globalObj.selectedType == 'student'){
          this.secIdParent = [];
        
            for(let ind in this.sectionlist){  
                if(this.secIdStudent.indexOf(this.sectionlist[ind].section_id) != -1){ 

                    for(let index in this.sectionlist[ind].assignStudent){
                        if(this.globalObj.receipentArr.indexOf(this.sectionlist[ind].assignStudent[index].user_id) != -1){
                          
                            this.displayRecepient.push({
                              name: this.sectionlist[ind].assignStudent[index].student_name,
                              user_id: this.sectionlist[ind].assignStudent[index].user_id,
                              admissionNo: this.sectionlist[ind].assignStudent[index].admission_no,
                              check: true
                            }); 
                        }else{
                            this.displayRecepient.push({
                              name: this.sectionlist[ind].assignStudent[index].student_name,
                              user_id: this.sectionlist[ind].assignStudent[index].user_id,
                              admissionNo: this.sectionlist[ind].assignStudent[index].admission_no,
                              check: false
                            });
                        }
                            
                    }
                }
            }
      }
  }
  
  
  
  getStudent(flag,sectionId,index){
      this.displayRecepient = [];
      this.globalObj.checkBox = true;
      
      
      if(flag == true){ 
          if(this.checkedItems[index]){
                this.checkedItems[index]=false;
            }else{
                this.checkedItems[index]=true;
            }
          
          this.secIdStudent = [];
            if(this.secIdParent.indexOf(sectionId) == -1){
                this.secIdParent.push(sectionId);

                for(let ind in this.sectionlists){
                    if(this.secIdParent.indexOf(this.sectionlists[ind].section_id) != -1){
                        this.sectionlists[ind].check = true;
                        for(let index in this.sectionlists[ind].assignStudent){
                            if(this.sectionlists[ind].assignStudent[index].check){
                                this.displayRecepient.push({
                                  name: this.sectionlists[ind].assignStudent[index].student_name+ ' (P)',
                                  user_id: this.sectionlists[ind].assignStudent[index].user_id,
                                  admissionNo: this.sectionlists[ind].assignStudent[index].admission_no,
                                  check: true
                                });
                            }
                        }
                    }
                }
            }else{
            
                let index = this.secIdParent.indexOf(sectionId);
                
                this.secIdParent.splice(index, 1);
            
                for(let ind in this.sectionlists){
                    if(this.sectionlists[ind].section_id == sectionId){ 
                        this.sectionlists[ind].check = false;
                     }
                    if(this.secIdParent.indexOf(this.sectionlists[ind].section_id) != -1){
                        for(let index in this.sectionlists[ind].assignStudent){
                            if(this.sectionlists[ind].assignStudent[index].check){
                                this.displayRecepient.push({
                                  name: this.sectionlists[ind].assignStudent[index].student_name+ ' (P)',
                                  user_id: this.sectionlists[ind].assignStudent[index].user_id,
                                  admissionNo: this.sectionlists[ind].assignStudent[index].admission_no,
                                  check: false
                                });
                            }
                        }
                    }
                }

            }

        }else{
            if(this.checkedItems[index]){
                this.checkedItems[index]=false;
            }else{
                this.checkedItems[index]=true;
            }
            this.secIdParent = [];
            if(this.secIdStudent.indexOf(sectionId) == -1){
                this.secIdStudent.push(sectionId);

                for(let ind in this.sectionlist){  
                    if(this.secIdStudent.indexOf(this.sectionlist[ind].section_id) != -1){  
                        this.sectionlist[ind].check = true;
                        for(let index in this.sectionlist[ind].assignStudent){ 
                            if(this.sectionlist[ind].assignStudent[index].check){
                                this.displayRecepient.push({
                                  name: this.sectionlist[ind].assignStudent[index].student_name,
                                  user_id: this.sectionlist[ind].assignStudent[index].user_id,
                                  admissionNo: this.sectionlist[ind].assignStudent[index].admission_no,
                                  check: true
                                });
                            }
                        }
                    }
                }
                this.sectionlist = this.sectionlist;
            }else{
                let index = this.secIdStudent.indexOf(sectionId);
                
                this.secIdStudent.splice(index, 1);
            
                for(let ind in this.sectionlist){
                    if(this.sectionlist[ind].section_id == sectionId){ 
                        this.sectionlist[ind].check = false;
                     }
                        if(this.secIdStudent.indexOf(this.sectionlist[ind].section_id) != -1){
                            
                            for(let index in this.sectionlist[ind].assignStudent){

                                    this.displayRecepient.push({
                                      name: this.sectionlist[ind].assignStudent[index].student_name,
                                      user_id: this.sectionlist[ind].assignStudent[index].user_id,
                                      admissionNo: this.sectionlist[ind].assignStudent[index].admission_no,
                                      check: false
                                    });

                            }
                        }
                   
                }
                this.sectionlist = this.sectionlist;
            }
      }
  }
  
  checkedStudent(flag, userId, indexSec, indexStud){
      
            for(let ind in this.displayRecepient){
                if(this.displayRecepient[ind].user_id == userId){
                    
                    if(this.displayRecepient[ind].check){
                        this.displayRecepient[ind].check = false;
                    }else{
                        this.displayRecepient[ind].check = true;
                    }
                    
                  //  this.checkedItems[index]=false;
                }
            }
            
            if(flag){
                if(this.sectionlists[indexSec].assignStudent[indexStud].check){
                    this.sectionlists[indexSec].assignStudent[indexStud].check=false;
                }else{
                    this.sectionlists[indexSec].assignStudent[indexStud].check=true;
                }

                var checkAllFlag = true;
                for(let ind in this.sectionlists){
                    for(let k in this.sectionlists[ind].assignStudent){
                        if(this.sectionlists[ind].assignStudent[k].check == false){
                            checkAllFlag = false;
                        }
                    }
                }

                if(checkAllFlag){
                    this.checkedItems[indexSec]=true;
                }else{
                    this.checkedItems[indexSec]=false;
                }
            }else{
                if(this.sectionlist[indexSec].assignStudent[indexStud].check){
                    this.sectionlist[indexSec].assignStudent[indexStud].check=false;
                }else{
                    this.sectionlist[indexSec].assignStudent[indexStud].check=true;
                }

                var checkAllFlag = true;
                for(let ind in this.sectionlist){
                    for(let k in this.sectionlist[ind].assignStudent){
                        if(this.sectionlist[ind].assignStudent[k].check == false){
                            checkAllFlag = false;
                        }
                    }
                }

                if(checkAllFlag){
                    this.checkedItems[indexSec]=true;
                }else{
                    this.checkedItems[indexSec]=false;
                }
            }
            
            
            
     
  }
  
   dismiss() {
       
        var finalObj = {
          receipent: this.globalObj.receipent,
          parentStudCheck: this.globalObj.parentStudCheck,
          selectedType: this.globalObj.selectedType,
          selectedSection: this.globalObj.selectedSection
        };
    this.viewCtrl.dismiss(finalObj);
  }
  
  sendToStud(check){
      if(check == true){
          this.globalObj.parentStudCheck = false;
      }else{
          this.globalObj.parentStudCheck =  true;
      }
  }
  
  
  addFinalReceipent(userId, index, ischeck){
      if(ischeck){
          this.displayRecepient[index].check = false;
      }else{
          this.displayRecepient[index].check = true;
      }
      
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
      
      var selectedSection = [];
      if(this.globalObj.userFlag == 'parent'){
          selectedSection = this.secIdParent;
      }else if(this.globalObj.userFlag == 'student'){
          selectedSection = this.secIdStudent;
      }
      
      var finalObj = {
          receipent: finalArr,
          parentStudCheck: this.globalObj.parentStudCheck,
          selectedType: this.globalObj.userFlag,
          selectedSection: selectedSection
      };
      
      this.displayRecepient = [];
      
      this.viewCtrl.dismiss(finalObj);
  }
  
  allSelandUnsel(flag, sectionId,index){
      if(flag){
          if(this.checkedItems[index]){
                for(let ind in this.sectionlists){
                    if(index == ind){
                        for(let k in this.sectionlists[ind].assignStudent){
                            this.sectionlists[ind].assignStudent[k]['check'] = true;
                        }
                    }
                }
                for(let ind in this.displayRecepient){
                    this.displayRecepient[ind].check = true;
                }
            }else{
                for(let ind in this.sectionlists){
                    if(index == ind){
                        for(let k in this.sectionlists[ind].assignStudent){
                            this.sectionlists[ind].assignStudent[k]['check'] = false;
                        }
                    }
                }
                for(let ind in this.displayRecepient){
                    this.displayRecepient[ind].check = false;
                }
            }
            this.sectionlists = this.sectionlists;
            
      }else{
          if(this.checkedItems[index]){
                for(let ind in this.sectionlist){
                    if(index == ind){
                        for(let k in this.sectionlist[ind].assignStudent){
                            this.sectionlist[ind].assignStudent[k]['check'] = true;
                        }
                    }
                }
                for(let ind in this.displayRecepient){
                    this.displayRecepient[ind].check = true;
                }
            }else{
                for(let ind in this.sectionlist){
                    if(index == ind){
                        for(let k in this.sectionlist[ind].assignStudent){
                            this.sectionlist[ind].assignStudent[k]['check'] = false;
                        }
                    }
                }
                for(let ind in this.displayRecepient){
                    this.displayRecepient[ind].check = false;
                }
            }
            this.sectionlist = this.sectionlist;
            
      }
  }
  
  getSubject(){
      this.globalObj.groupSubject = [];
      this.globalObj.groupAll = [];
      this.globalObj.groupFlag = false;
      let params = {
            "user_id":this.globalObj.loginId,
            "session_id":this.globalObj.sessionId,
            "section_id":this.globalObj.selectClassSec,
            "token":this.globalObj.token
      }
      this.http.post(this.globalObj.serverUrl+"user_subjects/assignedsubjects", params).subscribe(data => {
        const details: any = data;
        this.globalObj.groupSubject = details.response.assigned_subjects;
      });
  }
  
  
  getGroup(){
      
      this.globalObj.groupAll= [];
      this.globalObj.groupFlag = false;
      let params = {
            "user_id":this.globalObj.loginId,
            "session_id":this.globalObj.sessionId,
            "section_id":this.globalObj.selectClassSec,
            "token":this.globalObj.token,
            "subject_id":this.globalObj.selectSub,
      }
      this.http.post(this.globalObj.serverUrl+"groups/assignedgroups", params).subscribe(data => {
        const details: any = data;
        this.globalObj.groupAll = details.response.data;
        
        for(let i in this.globalObj.groupAll){
            this.globalObj.groupAll['check'] = false;
        }
        this.globalObj.groupFlag = true;
      });
  }
  
  groupSelect(index){
        
      let params = {
          "group_id":this.globalObj.groupAll[index].id,
            "user_type":"Student",
            "token":this.globalObj.token
      }
      
      this.http.post(this.globalObj.serverUrl+"groups/assignedgroupbyid", params).subscribe(data => {
        const details: any = data;
         
        
        if(this.globalObj.groupAll[index].check == true){
          
          for(let k in this.displayRecepient){
              if(this.displayRecepient[k].groupId == this.globalObj.groupAll[index].id){ 
                  this.displayRecepient[k].check = false;
              }
          }
          this.globalObj.groupAll[index].check = false;
        }else{
            for(let ind in details.response){
                this.displayRecepient.push({
                    name: details.response[ind].userName,
                    user_id: details.response[ind].userId,
                    admissionNo: '',
                    check: true,
                    groupId: this.globalObj.groupAll[index].id,
                });
            }
            this.globalObj.groupAll[index].check = true;
        }
        
        
       
      })
      
  }

}
