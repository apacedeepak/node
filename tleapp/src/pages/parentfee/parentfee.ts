import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { DuedetailspopupPage } from '../duedetailspopup/duedetailspopup';

/**
 * Generated class for the ParentfeePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-parentfee',
  templateUrl: 'parentfee.html',
})
export class ParentfeePage {
    
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private http: HttpClient,private myProvider: CommonProvider,
      private transfer: FileTransfer, private file: File,
      private document: DocumentViewer,public platform: Platform,
      private popCtrl: PopoverController) {
      this.globalObj.tabSelected = 'duedetails'; 
      
      this.globalObj.userType = window.localStorage.getItem('userType');
        this.globalObj.loginId = window.localStorage.getItem('loginId');
        this.globalObj.sessionId = window.localStorage.getItem('sessionId');
        this.globalObj.schoolId = window.localStorage.getItem('schoolId');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
        this.globalObj.studentUserId = window.localStorage.getItem('studentUserId');
        
        this.globalObj.paidFee = [];
    }

  ionViewDidLoad() {
    this.dueFee();
    this.getPaidFee();
  }
  
  
  getPaidFee(){
      const params = {
            "user_id":this.globalObj.studentUserId,
            "session_id":this.globalObj.sessionId,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token
        }; 
       
        this.http.post(this.globalObj.serverUrl+"receipts/studentreceipts", params).subscribe(data => {
            let details: any  = data;
            let paidFee = details.response.receiptDetails;
            for(let i in paidFee){
                let paymentMode = 'Cash';
                if(paidFee[i].payment_type.toLowerCase() == 'dd'){
                    paymentMode = 'Demand Draft';
                }else if(paidFee[i].payment_type.toLowerCase() == 'ch'){
                    paymentMode = 'Cheque';
                }else if(paidFee[i].payment_type.toLowerCase() == 'ol'){
                    paymentMode = 'Online';
                }
                
                this.globalObj.paidFee.push({
                    receipt_id: paidFee[i].receipt_id,
                    receiptno: paidFee[i].receiptno,
                    receipt_date: paidFee[i].receipt_date,
                    term_name: paidFee[i].term_name,
                    totalAmount: paidFee[i].total_amount,
                    paymentMode: paymentMode
                });
            }
        });
  }
  
  
  dueFee(){
      const params = {
            "user_id":this.globalObj.studentUserId,
            "session_id":this.globalObj.sessionId,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token
        }; 
       
        this.http.post(this.globalObj.serverUrl+"fee_defaulters/duefee", params).subscribe(data => {
            let details: any  = data;
            this.globalObj.dueList  = details.response.dueList;
            for(let k in this.globalObj.dueList){
                this.globalObj.dueList[k]['status'] = 'checkmark';
            }
            this.globalObj.dueList = this.globalObj.dueList;
        });
  }
  
  viewReceipt(receiptId){
      const params = {
            "user_id":this.globalObj.studentUserId,
            "session_id":this.globalObj.sessionId,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token,
            "receipt_id": receiptId
        }; 
       
        this.http.post(this.globalObj.serverUrl+"receipts/receiptdetail", params).subscribe(data => {
            let details: any  = data;
            let path = null;
            
            if(this.platform.is('ios')){
                path = this.file.documentsDirectory;
            }else{
                path = this.file.dataDirectory;
            }
            
            var receiptUrl = details.response.pdf;
            const transfer = this.transfer.create();
            transfer.download(receiptUrl, path + receiptUrl).then((entry) => { 
            let url = entry.toURL();
            this.document.viewDocument(url, 'application/pdf', {})
            });
        });
  }
  
  changeStatus(i){
      if(this.globalObj.dueList[i].status == 'close'){
          this.globalObj.dueList[i].status = 'checkmark'
      }else{
          this.globalObj.dueList[i].status = 'close';
      }
  }
  
  getduedetails(){
      
      var termSelect = [];
      
      for(let k in this.globalObj.dueList){
            if(this.globalObj.dueList[k].status == 'checkmark'){
                termSelect.push(this.globalObj.dueList[k].term_id)
            }
       }
       
       const params = {
            "user_id":this.globalObj.studentUserId,
            "session_id":this.globalObj.sessionId,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token,
            "term_id": termSelect
        }; 
       
        this.http.post(this.globalObj.serverUrl+"fee_defaulters/termwiseduefee", params).subscribe(data => {
            let details: any = data;
            let modal = this.popCtrl.create(DuedetailspopupPage,{selectedTermData:  details.response},{cssClass: 'contact-popover', showBackdrop: false});
                modal.onDidDismiss(data => {

                });
                modal.present();
        });
       
       
      
      
      
  }
  siblingChange(){
                
    this.dueFee();
    this.getPaidFee();
  }

}
