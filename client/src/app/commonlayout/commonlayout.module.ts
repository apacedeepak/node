import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { RouterModule, Routes } from '@angular/router';
import { RouterLink } from '@angular/router';
import {NgxPaginationModule} from 'ngx-pagination';
import {BackendApiService} from './../services/backend-api.service';
import { CommonlayoutComponent } from './commonlayout.component';
import { Layout1Component } from './layout1/layout1.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpModule} from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CustompipeModule} from './../custompipe/custompipe.module';
import * as $ from 'jquery';
import { LoginlayoutComponent } from './loginlayout/loginlayout.component';
import { SharedModule } from '../shared/shared.module';
import { PortalloginComponent } from './../login/portallogin/portallogin.component';
//import { MainComponent as  DashboardMainComponent} from './../dashboard/main/main.component';
import { DashboardComponent } from './../dashboard/dashboard.component';
//import { MainComponent as  CommunicationMainComponent } from './../communication/main/main.component';
import { CommunicationComponent } from './../communication/communication.component';
import { CommdetailComponent } from './../communication/commdetail/commdetail.component';
import { ComposeComponent } from './../communication/compose/compose.component';
import { AttendanceComponent } from './../attendance/attendance.component';
//import { MainComponent as  AttendanceMainComponent } from './../attendance/main/main.component';
import { FullcalendarComponent } from './../attendance/fullcalendar/fullcalendar.component';
import { TakeattendanceComponent } from './../attendance/takeattendance/takeattendance.component';
import { BatchattendanceComponent } from './../attendance/batchattendance/batchattendance.component';
import { ViewallComponent } from './../attendance/viewall/viewall.component';
import { StaffattendanceComponent } from './../attendance/staffattendance/staffattendance.component';
import { ApplyleaveComponent } from './../attendance/applyleave/applyleave.component';
import { ApplyleavestatusComponent } from './../attendance/applyleavestatus/applyleavestatus.component';
import { ClassrecordComponent } from './../classrecord/classrecord.component';
//import { MainComponent as ClassrecordMainComponent } from './../classrecord/main/main.component';
import { ViewprofileComponent } from './../classrecord/viewprofile/viewprofile.component';
import { CoverageComponent } from './../coverage/coverage.component';
import{TransferComponent} from  './../transfer/transfer/transfer.component';
//import { MainComponent as CoverageMainComponent } from './../coverage/main/main.component';
import { ExaminationComponent } from './../examination/examination.component';
//import { MainComponent as ExaminationMainComponent } from './../examination/main/main.component';
import { TeachermarkentryComponent } from './../examination/teachermarkentry/teachermarkentry.component';
import { FeeComponent } from './../fee/fee.component';
//import { MainComponent as FeeMainComponent } from './../fee/main/main.component';
import { ImprestComponent } from './../fee/imprest/imprest.component';
import { TermmasterComponent } from './../fee/termmaster/termmaster.component';
import { AddtermComponent } from './../fee/addterm/addterm.component';
import { FeedbackComponent } from './../feedback/feedback.component';
import { AddremovebehaviourComponent } from './../feedback/addremovebehaviour/addremovebehaviour.component';
import { AddremarkComponent } from './../feedback/addremark/addremark.component';
import { FeedbackgiveComponent } from './../feedback/feedbackgive/feedbackgive.component';
import { FeedbackformComponent } from './../feedback/feedbackform/feedbackform.component';
import { StudentfeedbackComponent } from './../feedback/studentfeedback/studentfeedback.component';
import { GroupComponent } from './../group/group.component';
//import { MainComponent as GroupMainComponent } from './../group/main/main.component';
import { GrouplistComponent } from './../group/grouplist/grouplist.component';
import { CreategroupComponent } from './../group/creategroup/creategroup.component';
import { UpdategroupComponent } from './../group/updategroup/updategroup.component';
import { HomeworkComponent } from './../homework/homework.component';
//import { MainComponent as HomeworkMainComponent } from './../homework/main/main.component';
import { CreatehomeworkComponent } from './../homework/createhomework/createhomework.component';
import { HomeworkdetailsComponent } from './../homework/homeworkdetails/homeworkdetails.component';
import { ReplyhomeworkComponent } from './../homework/replyhomework/replyhomework.component';
import { TeacherdetailComponent } from './../homework/teacherdetail/teacherdetail.component';
import { CheckhomeworkComponent } from './../homework/checkhomework/checkhomework.component';
import { RemarkhomeworkComponent } from './../homework/remarkhomework/remarkhomework.component';
import { TeacherhomeworkdraftComponent } from './../homework/teacherhomeworkdraft/teacherhomeworkdraft.component';
//import { MainComponent as  MedicalMainComponent} from './../medical/main/main.component';
//import { MainComponent as ProfileMainComponent } from './../profile/main/main.component';
import { ProfileComponent } from './../profile/profile.component';
import { TimetableComponent } from './../timetable/timetable.component';
//import { MainComponent as TimetableMainComponent } from './../timetable/main/main.component';
import { TrackerComponent } from './../usagetracker/tracker/tracker.component';
import { ReportComponent } from './../report/report.component';


@NgModule({
  declarations: [
    CommonlayoutComponent,
    Layout1Component,
    LoginlayoutComponent
    
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule,
    CustompipeModule,
    SharedModule,
    FormsModule, ReactiveFormsModule,
    //RouterModule.forChild(appRoutes)
  ],
  providers: [BackendApiService],
  bootstrap: [CommonlayoutComponent],
  exports:[CommonlayoutComponent,RouterModule, Layout1Component, LoginlayoutComponent]
})
export class CommonlayoutModule { }
