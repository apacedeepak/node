import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params } from "@angular/router";
import { TreeviewModule, TreeviewItem, TreeviewConfig, TreeviewHelper } from 'ngx-treeview';


@Component({
  selector: 'app-menuassignment',
  templateUrl: './menuassignment.component.html',
  styleUrls: ['./menuassignment.component.css']
})
export class MenuassignmentComponent implements OnInit {

  dropdownEnabled = true;
  items: TreeviewItem[];
  values: number[];

  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: false,
    decoupleChildFromParent: false
    //maxHeight: 400
  });

  mylang: any = '';
  roleForm: FormGroup;
  public errorMessage: any = {};
  public successMessage: any = {};
  public editOrUpadte = 0;
  public userTypeList: any = {};
  public roleList: any = {};
  public roleArr: any = {};
  public roleData = [];
  public menuListArr: any = {};
  public mainMenu: any = {};
  public menuArr: any = [];
  public roleWiseMenu: any = {};


  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService, private activatedRoute: ActivatedRoute) {
    this.mylang = window.localStorage.getItem('language');
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang('en');
    }
  }

  ngOnInit() {
    this.editOrUpadte = 0;
    this.getFromSet();

    this.getAllUserType();

    //this.menuList();
  }

  getFromSet() {
    this.roleForm = new FormGroup({
      user_type: new FormControl('', Validators.required),
      role_name: new FormControl('', Validators.required),
      id: new FormControl('')
    });
  }

  /*
  * Get All User Type
  */

  getAllUserType() {
    this.http.get(this.myService.constant.apiURL + "leftmenu/usertypelist").subscribe(data => {
      const userTypeList: any = data;
      this.userTypeList = userTypeList.user_type;
    });
  }

  /*
  * Get User Type Wise role
  */
  getRole(userType) {
    this.http.get(this.myService.constant.apiURL + "leftmenu/userrolelist").subscribe(data => {
      const roleList: any = data;
      this.roleList = roleList.user_role;
      this.roleList = this.roleList[userType]
    });
  }

 /* Role wise menu assignment */
 menuAssignment(rolePost) {
    
    var roleName = rolePost.role_name;
    var menuArr = this.menuListArr.filter(data=>data.parentId==0);
   
    var submitVal = this.values;
    
    roleName = roleName.replace(/ +/g, "").toLowerCase();
    
    //create the role wise menu JSON
    var menuObj = new Object();
    var masterMenu = [];
    menuObj[roleName] = Array();
    submitVal.map(menu => {
      let arr = menu.toString().split("_");
      let menuMain = this.menuListArr.filter(data => data.id==arr[0]).pop()
      
      if(masterMenu.includes(menuMain.id)){
        menuObj[roleName][menuObj[roleName].length - 1].sub_menu.push(this.menuListArr.filter(data=>data.id==arr[1]).pop())
      }else{
        masterMenu.push(menuMain.id)
        menuMain["sub_menu"] = Array();
        let subMenuData = this.menuListArr.filter(data=>data.id==arr[1]).pop();
        if(subMenuData == undefined){
          menuMain["sub_menu"] = [];
        }else{
          menuMain["sub_menu"].push(subMenuData);
        }
        menuObj[roleName].push(menuMain)
      }
    });
    
    
    var menuJson = JSON.stringify(menuObj);    
    let today = new Date();
    let leftMenuJson = {
      product_type: roleName,
      json_value: menuJson,
      created_date: today
    }

    let param = {product_type:roleName};
    this.http.post(this.myService.constant.apiURL + "leftmenu/getproductwiseleftmenu", param).subscribe(detail => {
      const dataDetail: any = detail;
       if(dataDetail.response == null){
        
        this.http.post(this.myService.constant.apiURL + "leftmenu/createleftmenu", leftMenuJson).subscribe(data => {
          this.successMessage.message = "Created Successfully.";
          setTimeout(() => { this.successMessage.message = ''; }, 3000);
          //this.getFromSet();
        });

       }else{
        this.http.post(this.myService.constant.apiURL + "leftmenu/createupdate", leftMenuJson).subscribe(data => {
          this.successMessage.message = "Updated Successfully.";
          setTimeout(() => { this.successMessage.message = ''; }, 3000);
          //this.getFromSet();
        });
       }
    });
    
  }

  menuList() {
    this.http.get(this.myService.constant.apiURL + "menumasters/menulist").subscribe(data => {
      const menuList: any = data;
      this.menuListArr = menuList.response;
      this.items = this.menuTree(this.menuListArr);

    });
  }

  menuTree(menuListArr): TreeviewItem[] { 
    var roleDataArr = [];
   
    if (typeof this.roleWiseMenu != 'object') {
      roleDataArr = JSON.parse(this.roleWiseMenu);
      let  jsonKey=Object.keys(roleDataArr).pop()
      var roleData  = roleDataArr[jsonKey]
    }
     
    this.mainMenu = menuListArr.filter(data => data.parentId == 0);

    var dataArr = [];
    var daataObj = {};
    var objArray = [];
    
    var subMenuList: any = [];
    var menuId = 0;
    var menuName = '';
    var subMenuId = 0;
    var subMenuName = '';
    var checkedValue ;

    this.mainMenu.forEach((element, key) => {
      menuId = element.id;
      menuName = element.menu_name;
      subMenuList[menuId] = [];

      subMenuList[menuId] = menuListArr.filter(data => data.parentId == element.id);
      if (subMenuList[menuId].length > 0) {
        objArray[menuId] = [];
        subMenuId = 0;
        subMenuName = '';
        subMenuList[menuId].forEach((subMenuObj, childKey) => {
          subMenuId = subMenuObj.id;
          subMenuName = subMenuObj.menu_name;
          
          checkedValue=false;
          if(roleData != undefined){
            roleData.forEach((menu) =>{   
              if(menu.sub_menu.some(subMenu=>subMenu.id==subMenuId)){
                checkedValue = true; 
              }
            });
          }
  
          if (subMenuId > 0) {
            objArray[menuId].push({ text: subMenuName, value: element.id+"_"+subMenuId, checked: checkedValue });
          }
        });

        this.menuArr[key] = new TreeviewItem({ text: menuName, value: menuId, collapsed: true, children: objArray[menuId] });
      } else {
        if(roleData != undefined){
          checkedValue= roleData.some(menu=>menu.id==menuId)?true:false;
        }
        this.menuArr[key] = new TreeviewItem({ text: menuName, value: menuId, checked: checkedValue});
      }
    });
    return this.menuArr;
  }

  /* */
  getRoleWiseData(roleName){
    roleName = roleName.replace(/ +/g, "").toLowerCase();
    let param = {product_type:roleName};
    this.http.post(this.myService.constant.apiURL + "leftmenu/getproductwiseleftmenu", param).subscribe(detail => {
      const dataDetail: any = detail;
      
      if(dataDetail.response != null){
        this.roleWiseMenu = dataDetail.response.json_value;
      }
      this.menuList();
      
    });
  }

}
