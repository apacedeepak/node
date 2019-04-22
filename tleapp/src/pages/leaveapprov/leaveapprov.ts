import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the LeaveapprovPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leaveapprov',
  templateUrl: 'leaveapprov.html',
})
export class LeaveapprovPage {
    
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController) {
      this.globalObj.approveReject = '';
      this.globalObj.rejectReason = '';
      this.globalObj.option = navParams.get('option');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeaveapprovPage');
  }
  
  statusApply(status){
      
      this.viewCtrl.dismiss({status:status});
  }
  
  rejectReason(reason){
      this.viewCtrl.dismiss({rejectedFlag :reason,rejectedReason: this.globalObj.rejectReason});
  }

}
