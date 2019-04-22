import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Router, NavigationStart} from '@angular/router';
import {BackendApiService} from './services/backend-api.service';
import {Http} from '@angular/http';
import { environment } from '../environments/environment';
import { PlatformLocation } from '@angular/common';
import 'rxjs/add/operator/toPromise';
import * as $ from 'jquery';
import { SpinnerVisibilityService} from 'ng-http-loader';
import { DeviceDetectorService } from 'ngx-device-detector';
//import { TranslateService } from '@ngx-translate/core';
// import { TranslateService } from '@ngx-translate/core';
 
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent {
    title = 'app';
    public globalObj: any = {};
    public deviceInfo = null;

    constructor(private myService: BackendApiService, private spinner: SpinnerVisibilityService,
    private deviceService: DeviceDetectorService) {
        //this.initTranslate();
        // translate.setDefaultLang('hn');
    }
  
    // switchLanguage(language: string) {
    //     this.translate.use(language);
    //   }
    /*initTranslate() {
        // Set the default language for translation strings, and the current language.
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();

        if (browserLang) {
          if (browserLang === 'zh') {
            const browserCultureLang = this.translate.getBrowserCultureLang();

            if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
              this.translate.use('zh-cmn-Hans');
            } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
              this.translate.use('zh-cmn-Hant');
            }
          } else {
            this.translate.use(this.translate.getBrowserLang());
          }
        } else {
          this.translate.use('en'); // Set your language here
        }
    } */
    

   ngOnInit() {
   
       this.globalObj.move = 1;
       this.deviceInfo = this.deviceService.getDeviceInfo();
        
        if(this.deviceInfo.browser == "firefox" && this.deviceInfo.browser_version < 59){
            alert("For better performance please upgrade your firefox to latest version.")
        }
   //   this.spinner.show();
       
       // this.globalObj.move = 1;
    }
}
