import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Nav } from 'ionic-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { CacheModule } from 'ionic-cache';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MyApp } from './app.component';
import {RecepientpopupPageModule} from '../pages/recepientpopup/recepientpopup.module';
import {GroupOptionPageModule} from '../pages/group-option/group-option.module';
import {HomeworkAssigntoPageModule} from '../pages/homework-assignto/homework-assignto.module';
import {NotesrecepientPageModule} from '../pages/notesrecepient/notesrecepient.module';
import {ClassSectionSubjectPageModule} from '../pages/class-section-subject/class-section-subject.module';
import {HomeworkRemarkPageModule} from '../pages/homework-remark/homework-remark.module';
import {MessagesearchPageModule} from '../pages/messagesearch/messagesearch.module';
import {DuedetailspopupPageModule} from '../pages/duedetailspopup/duedetailspopup.module';
import {DatepickercalendarPageModule} from '../pages/datepickercalendar/datepickercalendar.module';
import { CommonProvider } from '../providers/common/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { NgHttpLoaderModule } from 'ng-http-loader/ng-http-loader.module'
import { Device } from '@ionic-native/device'
import { Camera } from '@ionic-native/camera'
import { IonicStorageModule } from '@ionic/storage';
import { CommunicationProvider } from '../providers/communication/communication';
import { WebIntent } from '@ionic-native/web-intent';
import { Market } from '@ionic-native/market';

// import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
// import { VideoPlayer } from '@ionic-native/video-player';
// import { SMS } from '@ionic-native/sms';
// import { Geolocation } from '@ionic-native/geolocation';
// import { File } from '@ionic-native/file'; 
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import {FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { DatePicker } from '@ionic-native/date-picker'
import { DocumentViewer } from '@ionic-native/document-viewer';
import { FileOpener } from '@ionic-native/file-opener';
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppAvailability } from '@ionic-native/app-availability';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MyApp
    
     ],
  imports: [
    BrowserModule,
    NgHttpLoaderModule,
    HttpClientModule,
    ReactiveFormsModule,
    RecepientpopupPageModule,
    GroupOptionPageModule,
    HomeworkAssigntoPageModule,
    ClassSectionSubjectPageModule,
    HomeworkRemarkPageModule,
    FormsModule,
    MessagesearchPageModule,
    DatepickercalendarPageModule,
    DuedetailspopupPageModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    NotesrecepientPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    CacheModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
      ],
  providers: [
    StatusBar,
    SplashScreen,
    Device,
    Camera,
    Market,
    DatePicker,
    AppAvailability,
    PhotoViewer,
    FileTransfer,  
    FileTransferObject,  
    File,  
    DocumentViewer,
    FileOpener,
    AndroidPermissions,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true
    },
       CommonProvider,
        CommunicationProvider,
        WebIntent
        // Contacts,
        // VideoPlayer,
        // SMS,
        // Geolocation
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
