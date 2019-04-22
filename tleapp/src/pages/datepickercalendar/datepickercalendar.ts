import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CalendarComponentOptions } from 'ion2-calendar';

/**
 * Generated class for the DatepickercalendarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-datepickercalendar',
  templateUrl: 'datepickercalendar.html',
})
export class DatepickercalendarPage {
    
    date: string;
    type: 'string';
    optionsMulti: CalendarComponentOptions = {
        from: new Date(1),
        showToggleButtons: true
      };

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DatepickercalendarPage');
  }
  
  onChange($event) {
      
    var date = $event.format('YYYY-MM-DD');
    this.viewCtrl.dismiss({date:date});
  }

}
