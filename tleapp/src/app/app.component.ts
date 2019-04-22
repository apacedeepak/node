import { Component ,OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform ,AlertController, ViewController ,App, NavController, Config } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SpinnerVisibilityService } from 'ng-http-loader/services/spinner-visibility.service';
import { Device } from '@ionic-native/device';
//import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { CacheService } from "ionic-cache";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {


  rootPage: any = '';
  unregisterBackButtonAction: any;
  navLogArr: any = []
  current_page: any = ''
  constructor(protected app: App, private platform: Platform, statusBar: StatusBar, 
    splashScreen: SplashScreen,
    private spinner: SpinnerVisibilityService,
    private device: Device,
    private alertCtrl: AlertController,private translate: TranslateService,
   private config: Config,private cache: CacheService
    ) {

    

      platform.ready().then(() => {
        app.viewWillEnter.subscribe(
          () => {
            this.navCtrl.viewDidEnter
            .pipe(
              distinctUntilChanged()
            )
            .subscribe((data) => {
              if(data.instance){
                this.navLogArr.push(data.instance.constructor.name)
                this.current_page = data.instance.constructor.name 
              }
        }); 
      })
      this.initializeBackButtonCustomHandler();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      window.localStorage.setItem("deviceId",this.device.uuid);
     // this.pushSetup();
      if (window.localStorage.getItem('loginId')) {
        this.rootPage = 'LayoutPage';
      }
      else {
        this.rootPage = 'HomePage';
      }
      
      cache.setDefaultTTL(60 * 60 * 12);
      cache.setOfflineInvalidate(false);
      
      
      statusBar.styleDefault();
      splashScreen.hide();
      
    });
    
    this.initTranslate();
  }
  
  initTranslate() {
    // Set the default language for translation strings, and the current language.
//    this.translate.setDefaultLang('en');
//    const browserLang = this.translate.getBrowserLang();

//    if (browserLang) {
//      if (browserLang === 'zh') {
//        const browserCultureLang = this.translate.getBrowserCultureLang();
//
//        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
//          this.translate.use('zh-cmn-Hans');
//        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
//          this.translate.use('zh-cmn-Hant');
//        }
//      } else {
//        this.translate.use(this.translate.getBrowserLang());
//      }
//    } else {
      this.translate.use('en'); // Set your language here
    //}

//    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
//      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
//    });
  }
  

   ngOnInit() {
      //localStorage.clear();
       //this.addData();
       this.spinner.show();
        if(!(window.localStorage.getItem('session_id')||window.localStorage.getItem('school_id'))){
            
                 this.spinner.hide();
            
        }else{
           
            this.spinner.hide();
        }
    }

    ionViewDidLoad() {
      //
    }

    get navCtrl(): NavController {
      return this.app.getActiveNavs()[0];
    }
  

    initializeBackButtonCustomHandler(): void {
      this.unregisterBackButtonAction = this.platform.registerBackButtonAction(event => {
          console.log('Prevent Back Button Page Change');
          
          if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }else{ 
            let second_last = 0, last = 0, page = 'LayoutPage';
            this.navLogArr = Array.from(new Set(this.navLogArr)) 
            
            if(this.navLogArr.length > 2){
              second_last = (this.navLogArr.length-2)
              last = (this.navLogArr.length-1)
              
              if(this.current_page != this.navLogArr[last]){
                delete this.navLogArr[last]
                last = second_last;
                second_last = (this.navLogArr.length-3)
              }
            }else if(this.navLogArr.length == 1 || this.navLogArr.length == 0){
              navigator['app'].exitApp();
              return
            }
            if(page == 'HomePage'){
              delete this.navLogArr[second_last]
              second_last -= 1 
              last -= 1 
            }  
            page = this.navLogArr[second_last]
            delete this.navLogArr[second_last]
            delete this.navLogArr[last]
            this.navLogArr = this.navLogArr.filter(el => el != '' );
            if(second_last == 0) this.navLogArr = []
            if(page=='NotificationPage')
            {
              localStorage.setItem('notificationback','yes');
            }
            this.navCtrl.setRoot(page);
            page = 'LayoutPage'
          }  
      }, 101); 
    }

    ionViewWillLeave(){
      this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    }

    // pushSetup()
    // {
    //   const options: PushOptions = {
    //     android :{
    //       senderID:'961338632552'
    //     },
    //     ios:{},
    //     windows:{}
    //   };
    //   const pushobject: PushObject = this.push.init(options);
    //   pushobject.on('notification').subscribe((notification:any)=> 
    //   {
    //   if(notification.additionalData.foreground){
    //     let alert = this.alertCtrl.create({
    //                     title: 'New Push Notification Received',
    //                     message: notification.message,
    //                     //subTitle: 'Invalid username or password',
    //                     buttons: ['Dismiss']
    //                 });
    //                 alert.present();
    //   }
    //               else{
    //                 alert('elseeee');
    //               }
    //   });
    //   pushobject.on('registration').subscribe((registration:any)=> alert('registration'));
    //   pushobject.on('error').subscribe((error:any)=> alert('registration'));
    // }
}

