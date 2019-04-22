import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController ,Platform} from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';

/**
 * Generated class for the ModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {
  data: any = {};
  globalObj: any = {};
  constructor(public navCtrl: NavController, private navParams: NavParams,
             private view: ViewController,private myProvider: CommonProvider,
             private transfer: FileTransfer, private file: File,
             private document: DocumentViewer,private platform: Platform, private photoViewer: PhotoViewer) {
    this.globalObj.downloadUrl = this.myProvider.globalObj.constant.domainUrl+"/";
  }

  ionViewDidLoad() {
  }

  ionViewWillLoad(){
    this.data = this.navParams.get('data')
  }
//   viewImage(item){
          
//     let path = this.globalObj.downloadUrl+item;
//     this.navCtrl.push('ImageviewerPage',{path:path});

// }

viewImage(item){
  let filePath = this.globalObj.downloadUrl+item;
   //    this.navCtrl.push('ImageviewerPage',{path:path});
       
       
let path = null;
   
if(this.platform.is('ios')){
   path = this.file.documentsDirectory;
}else{
   path = this.file.dataDirectory;
}

//this.presentToast("Download")

const transfer = this.transfer.create();

var splitPath = filePath.split('.');
var totalLength = splitPath.length;

var extension = splitPath[totalLength-1]

transfer.download(filePath, path + filePath).then((entry) => { 
   let url = entry.toURL();
   if(extension.toLowerCase() == 'jpg' || extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'png' || extension.toLowerCase() == 'gif'){
       this.photoViewer.show(url);
   }
   if(extension.toLowerCase() == 'pdf'){
     this.document.viewDocument(url, 'application/pdf', {})
   }
   if(extension.toLowerCase() == 'xlsx'){
       this.document.viewDocument(url, 'application/xlsx', {})
   }
   if(extension.toLowerCase() == 'xls'){
       this.document.viewDocument(url, 'application/vnd.ms-excel', {})
   }
   //this.photoViewer.show(url);

});
 
}

  closeModal(){
    this.view.dismiss()
  }

}
