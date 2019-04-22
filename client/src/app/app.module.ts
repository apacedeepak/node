import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { BackendApiService } from './services/backend-api.service';
import { AuthLoginGuard } from './auth-login.guard';
import { RouterLink } from '@angular/router';
import * as $ from 'jquery';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { CustompipeModule } from './custompipe/custompipe.module';
import { LoginModule } from './login/login.module';
import { ProfileModule } from './profile/profile.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExaminationModule } from './examination/examination.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TimetableModule } from './timetable/timetable.module';
import { HomeworkModule } from './homework/homework.module';
import { FeedbackModule } from './feedback/feedback.module';
import { SharedModule } from './shared/shared.module';
import { FeeModule } from './fee/fee.module';
//import {CommonlayoutModule} from './commonlayout/commonlayout.module';
import { CommunicationModule } from './communication/communication.module';
import { NgClass, CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { CoverageModule } from './coverage/coverage.module';
import { TransferModule } from './transfer/transfer.module';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

//import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
//import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxEditorModule } from 'ngx-editor';
import { InputFileModule, InputFileConfig } from 'ngx-input-file';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgHttpLoaderModule } from 'ng-http-loader'
import 'hammerjs';
import { GroupModule } from './group/group.module';
import { MedicalModule } from './medical/medical.module';
import { ClassrecordModule } from './classrecord/classrecord.module';
import { ViewprofileComponent } from './classrecord/viewprofile/viewprofile.component';
import { CommdetailComponent } from './communication/commdetail/commdetail.component';
import { ComposeComponent } from './communication/compose/compose.component';
import { CreatehomeworkComponent } from './homework/createhomework/createhomework.component';
import { HomeworkdetailsComponent } from './homework/homeworkdetails/homeworkdetails.component';
import { ReplyhomeworkComponent } from './homework/replyhomework/replyhomework.component';
import { TeacherdetailComponent } from './homework/teacherdetail/teacherdetail.component';
import { CheckhomeworkComponent } from './homework/checkhomework/checkhomework.component';
import { RemarkhomeworkComponent } from './homework/remarkhomework/remarkhomework.component';
import { TeacherhomeworkdraftComponent } from './homework/teacherhomeworkdraft/teacherhomeworkdraft.component';
//import { FullcalendarComponent } from './attendance/fullcalendar/fullcalendar.component';
import { CreategroupComponent } from './group/creategroup/creategroup.component';
// import { GrouplistComponent } from './group/grouplist/grouplist.component';
import { UpdategroupComponent } from './group/updategroup/updategroup.component';
import { FeedbackgiveComponent } from './feedback/feedbackgive/feedbackgive.component';
import { FeedbackformComponent } from './feedback/feedbackform/feedbackform.component';
import { FullCalendarModule } from 'ng-fullcalendar';
import { FullcalendarComponent } from './attendance/fullcalendar/fullcalendar.component';
import { TakeattendanceComponent } from './attendance/takeattendance/takeattendance.component';
import { BatchattendanceComponent } from './attendance/batchattendance/batchattendance.component';
import { SchoolcalendarComponent } from './attendance/schoolcalendar/schoolcalendar.component';
import { ViewallComponent } from './attendance/viewall/viewall.component';
import { FullcalendarDirective } from './fullcalendar.directive';
import { ImprestComponent } from './fee/imprest/imprest.component';
import { ApplyleaveComponent } from './attendance/applyleave/applyleave.component';
import { ApplyleavestatusComponent } from './attendance/applyleavestatus/applyleavestatus.component';
import { StaffattendanceComponent } from './attendance/staffattendance/staffattendance.component';
import { environment } from '../environments/environment';
import { UsagetrackerModule } from './usagetracker/usagetracker.module';
import { TrackerComponent } from './usagetracker/tracker/tracker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TeachermarkentryComponent } from './examination/teachermarkentry/teachermarkentry.component';
import { StudentwisemarkentryComponent } from './examination/studentwisemarkentry/studentwisemarkentry.component';
import { SubjectwisemarkentryComponent } from './examination/subjectwisemarkentry/subjectwisemarkentry.component';
import { FeedbackComponent } from './feedback/feedback/feedback.component'
import { AddremarkComponent } from './feedback/addremark/addremark.component'
import { AddremovebehaviourComponent } from './feedback/addremovebehaviour/addremovebehaviour.component';
import { StudentfeedbackComponent } from './feedback/studentfeedback/studentfeedback.component';
import { ContactComponent } from './contact/contact.component';
import { ContactusComponent } from './contactus/contactus.component';
import { ReportModule } from './report/report.module';
import { ChartService } from './services/chart.service';
import { AdminModule } from './admin/admin.module';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { DoubtModule } from './doubt/doubt.module';
import { BusinessplanModule } from './businessplan/businessplan.module';
import { LoginlayoutComponent } from './loginlayout/loginlayout.component';
import { BatchManagerModule } from './batch-manager/batch-manager.module';
import { InventoryModule } from './inventory/inventory.module';
import { AcademicModule } from './academic/academic.module';
import { TreeviewModule } from 'ngx-treeview';
import { ExpenseModule } from './expense/expense.module';
import { UsermanagementModule } from './usermanagement/usermanagement.module';
import { DirectivesModule } from './directives/directives.module';
import { ExcelService } from './services/excel.service';
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http);
// }
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// import { PortalloginComponent } from './login/portallogin/portallogin.component'
const config: InputFileConfig = { fileAccept: '*', fileLimit: 5 };


@NgModule({
    declarations: [
        AddremovebehaviourComponent,
        AppComponent,
        PagenotfoundComponent,
        CommdetailComponent,
        ComposeComponent,
        CreatehomeworkComponent,
        HomeworkdetailsComponent,
        ReplyhomeworkComponent,
        TeacherdetailComponent,
        CheckhomeworkComponent,
        RemarkhomeworkComponent,
        TeacherhomeworkdraftComponent,
        CreategroupComponent,
        FeedbackgiveComponent,
        FeedbackformComponent,
        UpdategroupComponent,
        FullcalendarComponent,
        TakeattendanceComponent,
        BatchattendanceComponent,
        SchoolcalendarComponent,
        FullcalendarDirective,
        ViewprofileComponent,
        ImprestComponent,
        ViewallComponent,
        TrackerComponent,
        TeachermarkentryComponent,
        StudentwisemarkentryComponent,
        SubjectwisemarkentryComponent,
        ApplyleaveComponent,
        ApplyleavestatusComponent,
        StaffattendanceComponent,
        FeedbackComponent,
        AddremarkComponent,
        StudentfeedbackComponent,
        ContactComponent,
        AppLayoutComponent,
        ContactusComponent
        // PortalloginComponent
    ],
    imports: [
        HttpClientModule,
        TransferModule,
        NgHttpLoaderModule,
        BrowserModule,
        BrowserAnimationsModule,
        CustompipeModule,
        //CommonlayoutModule,
        AttendanceModule,
        FeeModule,
        FeedbackModule,
        TimetableModule,
        FullCalendarModule,
        NgxEditorModule,

        ProfileModule,
        ExaminationModule,
        FormsModule,
        MedicalModule,
        DashboardModule,
        //HomeworkModule,
        CommunicationModule,
        GroupModule,
        HomeworkModule,
        ClassrecordModule,
        CoverageModule,
        //TeacherModule,
        ReactiveFormsModule,
        CommonModule,
        LoginModule,
        UsagetrackerModule,
        ReportModule,
        AdminModule,
        BatchManagerModule,
        AppRoutingModule,
        DoubtModule,
        InventoryModule,
        BusinessplanModule,
        AcademicModule,
        ExpenseModule,
        UsermanagementModule,
        DirectivesModule,
        InputFileModule.forRoot(config),
        NgbModule.forRoot(),
        SharedModule.forRoot(),
        NgHttpLoaderModule.forRoot(),
        //  RouterModule.forRoot(appRoutes),
        DeviceDetectorModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),
        TreeviewModule.forRoot()
        /* TranslateModule.forRoot({
              loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
              }
          }) */
    ],

    providers: [BackendApiService, AuthLoginGuard, ChartService ,ExcelService, {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
    }],
    bootstrap: [AppComponent],
    //exports: [RouterModule]
})
export class AppModule { }
