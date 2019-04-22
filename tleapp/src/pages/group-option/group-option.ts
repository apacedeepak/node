import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';

/**
 * Generated class for the GroupOptionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group-option',
  templateUrl: 'group-option.html',
})
export class GroupOptionPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
   // console.log('ionViewDidLoad GroupOptionPage');
  }

  redirectTo(action)
  {
    let data = {action:action};
    this.viewCtrl.dismiss(data);
  }

}
