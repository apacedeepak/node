import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommunicationComponent } from './communication.component';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import { StudentComponent } from './student/student.component';
import { ParentComponent } from './parent/parent.component';
import { OutermenuComponent } from './outermenu/outermenu.component';
import { MessagelistComponent } from './messagelist/messagelist.component';
import { NgxEditorModule } from 'ngx-editor';
import { InputFileModule } from 'ngx-input-file';
import { ManagementComponent } from './management/management.component';
import { SharedModule } from '../shared/shared.module';
import {CommunicationRoutingModule} from './communication-routing.module';
import { CenterheadComponent } from './centerhead/centerhead.component';
import { ContacthoComponent } from './contactho/contactho.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { AnnouncementlistComponent } from './announcementlist/announcementlist.component';
import {NgxPaginationModule} from 'ngx-pagination';
 

@NgModule({
  imports: [
    CommonModule,
    CustompipeModule,
    CommonlayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEditorModule,
    InputFileModule,
    SharedModule,
    NgbModule.forRoot(),
    CommunicationRoutingModule,
    NgxPaginationModule
  ],
  declarations: [
    CommunicationComponent,
     MainComponent,
      TeacherComponent,
       StudentComponent,
        ParentComponent,
         OutermenuComponent,
          MessagelistComponent,
          ManagementComponent,
          CenterheadComponent,
          ContacthoComponent,
          AnnouncementComponent,
          AnnouncementlistComponent 
                 ],
  bootstrap: [CommunicationComponent],
  exports :[MessagelistComponent,OutermenuComponent]
})
export class CommunicationModule { }
