import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform } from 'ionic-angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';

/**
 * Generated class for the ImageviewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-imageviewer',
  templateUrl: 'imageviewer.html',
})
export class ImageviewerPage {
    
    private fileTransfer: FileTransferObject; 
    
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private transfer: FileTransfer, private file: File,
      public toastCtrl: ToastController,private document: DocumentViewer,
      public platform: Platform, private photoViewer: PhotoViewer) {
      
      //console.log(file)
      
      this.globalObj.path = navParams.get('path');
      
      
      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageviewerPage');
  }
  
  download(){
      
      
      let path = null;
            
      if(this.platform.is('ios')){
          path = this.file.documentsDirectory;
      }else{
          path = this.file.dataDirectory;
      }
      
      //this.presentToast("Download")
      
      const transfer = this.transfer.create();
      
      var splitPath = this.globalObj.path.split('.');
      var totalLength = splitPath.length;
      
      var extension = splitPath[totalLength-1]
      
      transfer.download(this.globalObj.path, path + this.globalObj.path).then((entry) => { 
          let url = entry.toURL();
          if(extension.toLowerCase() == 'jpg' || extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'png' || extension.toLowerCase() == 'gif'){
              this.photoViewer.show(url);
          }
          if(extension.toLowerCase() == 'pdf'){
            this.document.viewDocument(url, 'application/pdf', {})
          }
          //this.photoViewer.show(url);
          
      });
      

  }
  
  presentToast(url) {
    const toast = this.toastCtrl.create({
      message: url,
      duration: 3000,
      position:  "middle"
    });
    toast.present();
  }

}
