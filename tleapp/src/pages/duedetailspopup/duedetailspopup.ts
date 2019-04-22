import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the DuedetailspopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-duedetailspopup',
  templateUrl: 'duedetailspopup.html',
})
export class DuedetailspopupPage {
    
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController) {
        this.globalObj.dueDeatils = navParams.get('selectedTermData');
        
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DuedetailspopupPage');
  }
  
  close(){
      this.viewCtrl.dismiss();
  }

}
