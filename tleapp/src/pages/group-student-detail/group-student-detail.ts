import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the GroupStudentDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group-student-detail',
  templateUrl: 'group-student-detail.html',
})
export class GroupStudentDetailPage {
  globalObj : any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.globalObj.groupName = navParams.get('groupName');
    this.globalObj.memberList = navParams.get('memberList');
    this.globalObj.teacherName = navParams.get('teacherName');
  }

  ionViewDidLoad() {
    
  }

}
