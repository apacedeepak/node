import { Component ,ViewChild,OnInit} from '@angular/core';
import { NavController, NavParams,MenuController,Nav,IonicPage,ModalController, Platform, AlertController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { HttpClient } from '@angular/common/http';
import {HomePage} from '../home/home';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
//import { CommunicationProvider } from '../../providers/communication/communication';

@IonicPage()
@Component({
  selector: 'page-layout',
  templateUrl: 'layout.html',
})
export class LayoutPage  implements OnInit {
   rootPage:any = '';
   public globalObj: any = {};
   shownGroup = null;
   shownGroup1 = null;
   isShow: boolean = false;
   dropToggle: any = [];
   menuname: any = ''
  @ViewChild(Nav) nav: Nav;
 
  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private menu: MenuController,
    private myProvider: CommonProvider,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private transfer: FileTransfer, private file: File,
      private document: DocumentViewer,public platform: Platform,
    private alertCtrl: AlertController
   // private communicationProvider : CommunicationProvider
  ) {
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.subMenu = [];
    this.globalObj.profileName = window.localStorage.getItem('profileName');
    //this.globalObj.ProfileImage = window.localStorage.getItem('ProfileImage');
    this.pingServer();
    this.getLocalStorageValues();
    //this.myProvider.createTables();
    
  }
    openPage(menuname, path, i, type, linkname) {
	this.menuname = menuname;
      if(path=='LogOutPage')
        {
          this.confirmLogout();
          
          
        }
        else
        {
          if(path=='TimeTable'){
            this.timeTable();
           
          }
          else
          {  
        if(path == '')
        {
           path = 'LayoutPage';
        }
        
        //path = 'NativefeaturePage';
    this.globalObj.subMenu = this.globalObj.subMenuList[i]
    
    if(type == 'menu'){
      if(this.globalObj.subMenu.length == 0){
        this.isShow = false;
        this.menu.close();
        this.nav.setRoot(path, {linkname:linkname});
      }
      else{
        this.isShow = true;
      }
    }else{
      this.dropToggle[i] = false;
      this.isShow = false;
      this.nav.setRoot(path);
    }
  }
  }
    }

  
  
  timeTable(){
      
      this.globalObj.classSection = window.localStorage.getItem('class_section');
      
      let param = {
            "userType":"Student",
            "olduserId":"",
            "classSection":this.globalObj.classSection
      }
      this.http.post(this.globalObj.serverUrl + 'studyplans/timetable', param).subscribe(details => {
        let data: any = details;
        let urlPath = data.response.filepath;
        if(urlPath){
            let path = null;
            if(this.platform.is('ios')){
                    path = this.file.documentsDirectory;
                }else{
                    path = this.file.dataDirectory;
                }

            const transfer = this.transfer.create();
            transfer.download(urlPath, path + urlPath).then((entry) => { 
            let url = entry.toURL();
            this.document.viewDocument(url, 'application/pdf', {})
            });
        }else{
            this.myProvider.toasterError("No time table uploaded.");
        }
        
     });
  }

   ngOnInit() {
       
       this.myProvider.currentMessage.subscribe(message => {
           this.globalObj.ProfileImage = message;
       });
       
       this.getMenuList();
       if(this.globalObj.userType.toLowerCase() == "student"){
            this.rootPage = 'StudentDashboardPage';
           
        }
          if(this.globalObj.userType.toLowerCase() == "parent"){
            this.rootPage = 'ParentDashboardPage';
           
        }
          if(this.globalObj.userType.toLowerCase() == "teacher"){
            this.rootPage = 'TeacherDashboardPage';
           
        }
   }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad LayoutPage');
  }

  getMenuList()
    {
          let d = new Date();
          let n = d.getTime();
    
    this.http.get(this.globalObj.serverUrl + 'leftmenu/leftmenu?product_type='+this.globalObj.productType+'&time='+n).subscribe(details => {
        var getMenuData: any = details;
        this.setLeftMenu('online',getMenuData);
         
   }, error => {
      if(window.localStorage.getItem('leftMenu'))
        {
          
          let responsedata: any  = JSON.parse(window.localStorage.getItem('leftMenu'));
          this.setLeftMenu('offline',responsedata);
          
        }
        else
          {
      let errormsg = "Could not connect to server";
      this.myProvider.toasterError(errormsg);
          }
                    });
    }
   getLocalStorageValues()
  {
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.productType = window.localStorage.getItem('productType');
  }
 pingServer()
 {
   let d = new Date();
   let n = d.getTime();
   this.http.get(this.globalObj.serverUrl + 'ctpconfiguration/ping').subscribe(details => {
     var getMenuData: any = details;
     let url =  this.globalObj.serverUrl + '/masteruserlog/lastlogin';
     this.http.post(url, {user_id:window.localStorage.getItem('loginId')})
     .subscribe(details => {
      const data: any = details;
      if(data.response_status.status=='200')
        {
          this.globalObj.lastLogin = data.response.logout_time;
        }
     })
   }, error => {
    //  let errormsg = "Could not connect to server";
    //  this.myProvider.toasterError(errormsg);
   })

 }
  setLeftMenu(mode,getMenuData)
  {
    if(this.globalObj.userType.toLowerCase() == "teacher"){
            this.globalObj.menuList = JSON.parse(getMenuData.response.json_value).teacher;
            this.globalObj.subMenuList = this.globalObj.menuList.map(obj => obj.sub_menu);
            this.dropToggle = Array(this.globalObj.menuList.length).fill(false)
        }
          if(this.globalObj.userType.toLowerCase() == "student"){
            this.globalObj.menuList = JSON.parse(getMenuData.response.json_value).student;
            this.globalObj.subMenuList = this.globalObj.menuList.map(obj => obj.sub_menu);
            this.dropToggle = Array(this.globalObj.menuList.length).fill(false)
        }
          if(this.globalObj.userType.toLowerCase() == "parent"){
            this.globalObj.menuList = JSON.parse(getMenuData.response.json_value).parent;
            this.globalObj.subMenuList = this.globalObj.menuList.map(obj => obj.sub_menu);
            this.dropToggle = Array(this.globalObj.menuList.length).fill(false)
        }
        if(this.globalObj.userType.toLowerCase() == "management"){
            this.globalObj.menuList = JSON.parse(getMenuData.response.json_value).management;
        }
          if(mode=='online')
                    {
                     window.localStorage.setItem('leftMenu',JSON.stringify(getMenuData));
                    } 
  }

  dropToggleFunc(i){
    this.dropToggle[i] = !this.dropToggle[i]
    this.isShow = (this.dropToggle[i]) ? true: false;
  }

  callLogout(userId,deviceId)
  {
    const params ={
                    user_id:userId,
                    device_token:deviceId
                    }
    this.http.post(this.globalObj.serverUrl+"login/logout", params).subscribe(data => {
    });
  }

  openProfile()
  { this.menu.close();
    this.nav.setRoot('ProfilePage');
  }

  confirmLogout(){
    
    let alert = this.alertCtrl.create({
      title: "Do you want to Logout?",
      subTitle: '',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            
          }
        },
        { 
          text: 'Ok',
          handler: () => {
          this.callLogout(window.localStorage.getItem('loginId'),window.localStorage.getItem('deviceId'));  
          localStorage.clear();
          let path = 'HomePage';
          this.navCtrl.setRoot(path);
          }
        }
      ]
    });
    alert.present();
  }
}
