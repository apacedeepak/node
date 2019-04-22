import { Component, OnInit, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
import {Router} from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit ,AfterContentInit {
  public globalObj: any = {};
  data: any;
  dashboarddataarr : any = {};
  dashboardpercentarr: any = {};
  attendancearr : any = [];
  feearr: any = [];
  commarr: any = [];
  doubtarr:any=[];
  switchFlag: boolean = true;
  commdata: any = [];
  feedata: any = [];
  defaulterdata: any;
  attendata: any;
  presentdata: any;
  leavedata: any;
  absentdata: any;
  nottakendata: any;
  date: any;
  viewtype: any = "table";
  moduletype: any = 'all';
  from_date: any;
  to_date: any;
  range: any = 5;
  dropdowntype: any = 'days';
  fromrange: any = '';
  torange: any = '';
  showdaterange: boolean = false;
  hoveredDate: any;
  showcal: boolean = false;
  delayFlag : boolean = false;
  moduleviewall: boolean = false;
  moduleviewtype: any;
  individualtype: any = '';
  commcount: number = 0;
  attendBool: boolean = false;
  overallBool: boolean = false;
  presentBool: boolean = false;
  absentBool: boolean = false;
  leaveBool: boolean = false;  
  nottakenBool: boolean = false;
  chartOptions: any; 
  pieoptions: any;
  doughnoutoptionsoverall: any; 
  doughnoutoptionspresent: any;
  doughnoutoptionsabsent: any;
  doughnoutoptionsleave: any;
  doughnoutoptionsnottaken: any; 
  defaulterBool: boolean = false;
  miscBool: boolean = false;
  feecollectBool: boolean = false;
  fulldatearr: any = [];
  mylang:any="";
  public menuList: any;
  menuArr: any = [];
  public navUrl:any;
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }

  constructor(private router: Router, private myService: BackendApiService, private http: HttpClient, calendar: NgbCalendar,private translate: TranslateService) {    
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
    this.navUrl=this.router.url;

    var d = new Date();
    var n = d.getTime();
    var schoolId = window.localStorage.getItem('school_id');
    var utype = window.localStorage.getItem('user_type').toLowerCase();
    var productType = window.localStorage.getItem('product_type').toLowerCase();
    let roleNameArr = window.localStorage.getItem('role_name');
    let roleName = roleNameArr.toLowerCase().replace(/ +/g, "");
    
    this.http.get(this.myService.constant.apiURL + 'leftmenu/leftmenu?product_type='+roleName+'&time='+n).subscribe(details => {
        const getData: any = details;

        this.menuList = JSON.parse(getData.response.json_value);
         var key= Object.keys(this.menuList)
       let  jsonKey=key.pop()
       this.menuList  = this.menuList[jsonKey]
       this.menuList.forEach(menu =>{
            if(menu.sub_menu.find(subMenu=>subMenu.path==this.navUrl)){
            menu.navUrl="show"
            }
        })
    });
    

    Chart.pluginService.register({
        beforeRender: function (chart) {
            if (chart.config.options.showAllTooltips) {
                // create an array of tooltips
                // we can't use the chart tooltip because there is only one tooltip per chart
                chart.pluginTooltips = [];
                chart.config.data.datasets.forEach(function (dataset, i) {
                    chart.getDatasetMeta(i).data.forEach(function (sector, j) {
                        chart.pluginTooltips.push(new Chart.Tooltip({
                            _chart: chart.chart,
                            _chartInstance: chart,
                            _data: chart.data,
                            _options: chart.options.tooltips,
                            _active: [sector]
                        }, chart));
                    });
                });
        
                // turn off normal tooltips
                chart.options.tooltips.enabled = false;
            }
        },
          afterDraw: function (chart, easing) {
            if (chart.config.options.showAllTooltips) {
                // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
                if (!chart.allTooltipsOnce) {
                    if (easing !== 1)
                        return;
                    chart.allTooltipsOnce = true;
                }
        
                // turn on tooltips
                chart.options.tooltips.enabled = true;
                Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
                    tooltip.initialize();
                    tooltip.update();
                    // we don't actually need this since we are not animating tooltips
                    tooltip.pivot();
                    tooltip.transition(easing).draw();
                });
                chart.options.tooltips.enabled = false;
            }
          },
        beforeDraw: function (chart) {
          if (chart.config.options.elements.center) {
            //Get ctx from string
            var ctx = chart.chart.ctx;
      
            //Get options from the center object in options
            var centerConfig = chart.config.options.elements.center;
            var fontStyle = centerConfig.fontStyle || 'Arial';
            var txt = centerConfig.text;
            var color = centerConfig.color || '#000';
            var sidePadding = centerConfig.sidePadding || 20;
            var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
            //Start with a base font of 30px
            ctx.font = "30px " + fontStyle;
      
            //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
            var stringWidth = ctx.measureText(txt).width;
            var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
      
            // Find out how much the font can grow in width.
            var widthRatio = elementWidth / stringWidth;
            var newFontSize = Math.floor(30 * widthRatio);
            var elementHeight = (chart.innerRadius * 2);
      
            // Pick a new font size so it will not be larger than the height of label.
            var fontSizeToUse = Math.min(newFontSize, elementHeight);
      
            //Set font settings to draw it correctly.
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
            var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
            ctx.font = fontSizeToUse+"px " + fontStyle;
            ctx.fillStyle = color;
      
            //Draw text in center
            ctx.fillText(txt, centerX, centerY);
          }
        }
      });
    this.globalObj.sessionid = window.localStorage.getItem('session_id');  
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    this.globalObj.user_type = window.localStorage.getItem('user_type');
    this.globalObj.token = window.localStorage.getItem('token');
    this.date = new Date(); 
    this.getdashboard();
  }

  selectData(event){ 
      this.commcount = this.commdata.datasets[event.element._datasetIndex].data[event.element._index];
      let label = this.commdata.datasets[event.element._datasetIndex].label.toLowerCase();
      
      window.localStorage.setItem('fromDateGraph', this.fulldatearr[event.element._index].toString());
      window.localStorage.setItem('toDateGraph', this.fulldatearr[event.element._index].toString());
      this.router.navigate(['communication/main'], { queryParams: { type: label, flag: 'range' } });
  }

  onDateChange(date: NgbDateStruct) {
    if (!this.from_date && !this.to_date) {
      this.from_date = date;
    }  else if (this.from_date && !this.to_date && equals(date, this.from_date)) {
      this.to_date = this.from_date;
    }
    else if (this.from_date && !this.to_date && after(date, this.from_date)) {
      this.to_date = date;
    } else {
      this.to_date = null;
      this.from_date = date;
    }
    if (this.from_date != null && this.from_date != null != undefined && this.to_date != null && this.to_date != undefined) {
      this.showdaterange = true;
      let f_year = this.from_date.year;
      let f_month = this.from_date.month < 10 ? '0' + this.from_date.month : this.from_date.month;
      let f_day = this.from_date.day < 10 ? '0' + this.from_date.day : this.from_date.day;
      this.fromrange = f_year + "-" + f_month + "-" + f_day;
      let t_year = this.to_date.year;
      let t_month = this.to_date.month < 10 ? '0' + this.to_date.month : this.to_date.month;
      let t_day = this.to_date.day < 10 ? '0' + this.to_date.day : this.to_date.day;
      this.torange = t_year + "-" + t_month + "-" + t_day;

      this.range = this.datediff(this.fromrange, this.fromrange);
      this.to_date = new Date(this.torange).toISOString();  
      this.from_date = new Date(this.fromrange).toISOString();
      this.getdashboard();
    }

  }
  isHovered = date => this.from_date && !this.to_date && this.hoveredDate && after(date, this.from_date) && before(date, this.hoveredDate);
  isInside = date => after(date, this.from_date) && before(date, this.to_date);
  isFrom = date => equals(date, this.from_date);
  isTo = date => equals(date, this.to_date);

  dropdownfilter(e, type){
      e.preventDefault();
      this.dropdowntype = type;
      this.moduletype = 'all'; 
      if(type == "days"){
        this.range = 5; /* for 5 days */
      }
      else if(type == "month"){
         this.range = this.date.getDate();
      }
      this.calcdateRange(this.date.toISOString(), this.moduletype);
  }
  removerange(){
    let dateobj = new Date();
    this.to_date = dateobj.toISOString();
    this.from_date = dateobj.setDate(dateobj.getDate()-(5-1)); 
    this.from_date = new Date(this.from_date).toISOString();
    this.showdaterange = false;
    this.fromrange = '';
    this.torange = '';
    this.getdashboard();
  }
  

  calcdateRange(date, type){
    this.moduletype = type;
    let dateobj = new Date(date);
    this.to_date = date;
    this.from_date = dateobj.setDate(dateobj.getDate()-(this.range-1)); 
    this.from_date = new Date(this.from_date).toISOString();
    this.getdashboard();
  }

  datediff(d1, d2){
    var date1 = new Date(d1);
    var date2 = new Date(d2);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

    return diffDays;
  }

  nextFilter(e, type){
    e.preventDefault();
    var today = new Date();
    var nextDay = new Date(this.date);
    nextDay.setDate(this.date.getDate()+this.range);
   // nextDay.setDate(this.date.getDate()+5);
   
    if(today.getTime() < nextDay.getTime()){ console.log("dsfd");
        $("#"+type+"next").removeAttr("href");
        return;
    }
    this.date = nextDay;

    this.calcdateRange(nextDay.toISOString(), type);
  }

  prevFilter(e, type){
    e.preventDefault();
    $("#"+type+"next").attr("href", "#");
    var yesterday = new Date(this.date);
    yesterday.setDate(this.date.getDate()-this.range);
    //yesterday.setDate(this.date.getDate()-5);
    this.date = yesterday;

    this.calcdateRange(yesterday.toISOString(), type);
  }

  switchFlagFunc(){
    this.switchFlag = !this.switchFlag;
    if(this.switchFlag == true){
        this.viewtype = "table";
        this.delayFlag = false;
        this.moduleviewall = false;
        this.getdashboard();
    }   
    else{
        this.viewtype = "graph";
        this.calcdateRange(this.date.toISOString(), 'all'); 
    }      
  }

  viewall(type){
    if(type == 'attend') this.falsyattedbool();
    this.moduleviewall = true;
    this.moduleviewtype = type;
    this.individualtype = '';
    this.getdashboard();
    if ($('.cmclass').hasClass('btn-info'))  $(".cmclass").removeClass('btn-info');
    $("#"+type).addClass('btn-info');
  }

  backviewall(){
    this.moduleviewall = false; 
    this.switchFlag = false;
    this.individualtype = '';
    this.getdashboard();
  }
  falsyattedbool(){
    this.attendBool = false;
    this.overallBool = false;
    this.presentBool = false;
    this.absentBool = false;
    this.leaveBool = false;
    this.nottakenBool = false;
    this.feecollectBool = false;
    this.miscBool = false;
    this.defaulterBool = false;
  }

  individualview(type){        
    this.falsyattedbool();  
    switch(type){
        case 'attend':
        this.attendBool = true;
        break;
        case 'overall':
        this.overallBool = true;
        break;
        case 'present':
        this.presentBool = true;
        break;
        case 'absent':
        this.absentBool = true;
        break;
        case 'leave':
        this.leaveBool = true;
        break;
        case 'nottaken':
        this.nottakenBool = true;
        break;
        case 'defaulter':
        this.defaulterBool = true;
        break;
        case 'misc':
        this.miscBool = true;
        break;
        case 'feecollect':
        this.feecollectBool = true;
        break;
        case 'default':{
           this.falsyattedbool();
           break;
        }
    }
    this.individualtype = type;
    
    this.getdashboard();
    if ($('.cmclass').hasClass('btn-info'))  $(".cmclass").removeClass('btn-info');
    $("#"+type).addClass('btn-info');  
  }

  getdashboard() { 
    let params = {
      "session_id": this.globalObj.sessionid,
      "school_id": this.globalObj.school_id,
      "user_type": this.globalObj.user_type,
      "callfrom": "web",
    };
    const url = this.myService.constant.apiURL + "dashboards/dashboard";
    params['viewtype'] = this.viewtype;

    if(this.viewtype == "table"){ 
        this.attendancearr.length = 0; 
        this.feearr.length = 0;
        this.commarr.length = 0;
        this.http.post(url, params).subscribe( response => {
            const data: any = response;  
            if(data.response_status.status == "200"){
              this.dashboarddataarr = data.response;
              this.dashboarddataarr.forEach(element => {
                if(element.attendance){

                    this.globalObj.todaypresentCount = element.attendance.todaypresentCount;
                    this.globalObj.todayabsentCount = element.attendance.todayabsentCount;
                    this.globalObj.todayleaveCount = element.attendance.todayleaveCount;
                    this.globalObj.todayAttNotTakenCount = element.attendance.todayAttNotTakenCount;
                    this.globalObj.currentMonthpresentCount = element.attendance.currentMonthpresentCount;
                    this.globalObj.currentMonthabsentCount = element.attendance.currentMonthabsentCount;
                    this.globalObj.currentMonthleaveCount = element.attendance.currentMonthleaveCount;
                    this.globalObj.currentMonthAttNotTAkenCount = element.attendance.currentMonthAttNotTAkenCount;

                    this.globalObj.lastMonthpresentCount = element.attendance.lastMonthpresentCount;
                    this.globalObj.lastMonthabsentCount = element.attendance.lastMonthabsentCount;
                    this.globalObj.lastMonthleaveCount = element.attendance.lastMonthleaveCount;
                    this.globalObj.lastMonthAttNotTakenCount = element.attendance.lastMonthAttNotTakenCount;
                    this.globalObj.tillPresentCount = element.attendance.tillPresentCount;
                    this.globalObj.tillAbsentCount = element.attendance.tillAbsentCount;
                    this.globalObj.tillLeaveCount = element.attendance.tillLeaveCount;
                    this.globalObj.tillDateAttNotTakenCount = element.attendance.tillDateAttNotTakenCount;
                }
                else if(element.fee){
                  this.feearr.push({type: "fc", key: "Fee Collection", value: element.fee.fee_collection},
                  {type: "mc", key: "Misc Collection", value: element.fee.misc_collection},
                  {type: "d", key: "No. of Defaulters", value: element.fee.defaulter});
                }
                else if(element.communication){
                  this.commarr.push({type: "msg", key: "Message", value: element.communication.message},
                  {type: "notice", key: "Notice", value: element.communication.notice},
                  {type: "circular", key: "Circular", value: element.communication.circular});
                } else if(element.doubt) {
                 this.doubtarr.push({type: "doubt", key: "Doubt Asked", value: element.doubt.doubtAsked},
                  {type: "doubt", key: "Average Ownership Time", value: element.doubt.avgOwnershipTime},
                  {type: "doubt", key: "Average Response Time", value: element.doubt.avgResponseTime});
                }
              });
            }
        });
    
    }
    else if(this.viewtype == "graph"){ 
    params['moduletype'] = this.moduletype;
    params['from_date'] = this.from_date;
    params['to_date'] = this.to_date;    
    
    this.http.post(url, params).subscribe( response => {
      const data: any = response;  
      if(data.response_status.status == "200"){
        this.dashboardpercentarr = data.response;
        this.dashboardpercentarr.forEach(element => { 

            if(element.attendancepercent){ 
                let leaveper = parseFloat(element.attendancepercent.leave).toFixed(2);
                let notleaveper = 100 - parseFloat(leaveper);
                let colorarr = [];
                
                    colorarr = [ "#0195ff","#dddddd"]
                    this.leavedata = {
                    labels: [this.translate.instant('leave'), this.translate.instant("Not leave")],
                    datasets: [
                        {
                            data: [leaveper, notleaveper],
                            backgroundColor: colorarr,
                            hoverBackgroundColor: colorarr
                        }]    
                    };
                    
                    this.doughnoutoptionsleave ={
                        cutoutPercentage: 70,
                        legend: {
                            display: false
                        },
                        responsive: true,
                        elements: {
                            center: {
                                text: (parseInt(leaveper))+"%",
                                color: '#000000', 
                                fontStyle: 'Arial', 
                                sidePadding: 60,
                                fontSize: 16
                            }
                        }
                    };
                    
                     
                    colorarr = ["#676767","#dddddd"]
                    let absentper = parseFloat(element.attendancepercent.absent).toFixed(2);
                    let notabsentper = 100 - parseFloat(absentper);
                    this.absentdata = {
                    labels: [this.translate.instant('absent'), this.translate.instant("Not Absent")],
                    datasets: [
                        {
                            data: [absentper, notabsentper],
                            backgroundColor: colorarr,
                            hoverBackgroundColor: colorarr
                        }]    
                    };
                    this.doughnoutoptionsabsent ={
                        cutoutPercentage: 70,
                        legend: {
                            display: false
                        },
                        responsive: true,
                        elements: {
                            center: {
                                text: (parseInt(absentper))+"%",
                                color: '#000000', 
                                fontStyle: 'Arial', 
                                sidePadding: 60,
                                fontSize: 16
                            }
                        }
                    };

                    colorarr = [ "#f0bb1d","#dddddd"]
                    let not_takenper = parseFloat(element.attendancepercent.not_taken).toFixed(2);
                    let notnot_takenper = 100 - parseFloat(not_takenper);
                    this.nottakendata = {
                        labels: [this.translate.instant('attendance_not_taken'), this.translate.instant("Other")],
                        datasets: [
                            {
                                data: [not_takenper, notnot_takenper],
                                backgroundColor: colorarr,
                                hoverBackgroundColor: colorarr
                            }]    
                        };  
                        this.doughnoutoptionsnottaken ={
                            cutoutPercentage: 70,
                            legend: {
                                display: false
                            },
                            responsive: true,
                            elements: {
                                center: {
                                    text: (parseInt(not_takenper))+"%",
                                    color: '#000000', 
                                    fontStyle: 'Arial', 
                                    sidePadding: 60,
                                    fontSize: 16
                                }
                            }
                        };  

                    colorarr = [ "#f08a37","#dddddd"]
                    let overallper = parseFloat(element.attendancepercent.overall).toFixed(2);
                    let notoverallper = 100 - parseFloat(overallper);
                    this.attendata = {
                            labels: [this.translate.instant('Overall Attendance'),this.translate.instant('Other') ],
                            datasets: [
                                {
                                    data: [overallper, notoverallper],
                                    backgroundColor: colorarr,
                                    hoverBackgroundColor: colorarr
                                }]    
                        };
                        this.doughnoutoptionsoverall ={
                            cutoutPercentage: 70,
                            legend: {
                                display: false
                            },
                            responsive: true,
                            elements: {
                                center: {
                                    text: (parseInt(overallper))+"%",
                                    color: '#000000', 
                                    fontStyle: 'Arial', 
                                    sidePadding: 60,
                                    fontSize: 16
                                }
                            }
                        };    

                    colorarr = [ "#844fe8","#dddddd"]
                    let presentper = parseFloat(element.attendancepercent.present).toFixed(2);
                    let notpresentper = 100 - parseFloat(presentper);
                    this.presentdata = {
                            labels: [this.translate.instant('present'), this.translate.instant('Not Present')],
                            datasets: [
                                {
                                    data:[presentper, notpresentper],
                                    backgroundColor: colorarr,
                                    hoverBackgroundColor: colorarr
                                }]    
                        };
                     
                        this.doughnoutoptionspresent ={
                            cutoutPercentage: 70,
                            legend: {
                                display: false
                            },
                            responsive: true,
                            elements: {
                                center: {
                                    text: (parseInt(presentper))+"%",
                                    color: '#000000', 
                                    fontStyle: 'Arial', 
                                    sidePadding: 60,
                                    fontSize: 16
                                }
                            }
                        };  
                
                /* attendance graph data */
          /* ends */   
            }
            else if(element.feepercent){ 
                 /* Fee and defaulter graph data */ 
                    let total = element.feepercent.fee_collection + element.feepercent.misc_collection; 
                    let fee_collection = 0, misc_collection = 0;
                    if(total != 0){
                        fee_collection = (element.feepercent.fee_collection/total) * 100;
                        misc_collection = (element.feepercent.misc_collection/total) * 100;
                    }
                    if(fee_collection)
                        fee_collection = parseFloat(fee_collection.toFixed(2));
                    if(misc_collection)    
                        misc_collection = parseFloat(misc_collection.toFixed(2));
                    let defaulter = 0;
                    if(element.feepercent.defaulter)
                        defaulter = element.feepercent.defaulter.toFixed(2);
                    let labelarr = [], dataarr = [];
                    let colorarr = [
                        "#874ce2",
                        "#676767"
                    ];
                    if(this.individualtype == 'feecollect'){
                        labelarr = ['Fee Collection'];
                        dataarr = [fee_collection];
                        colorarr = [
                            "#874ce2"
                        ];
                    }
                    else if(this.individualtype == 'misc'){
                        labelarr = ['Misc Collection'];
                        dataarr = [misc_collection];
                        colorarr = [
                            "#676767"
                        ];
                    }
                    else{
                        labelarr = ['Fee Collection', 'MiscFee Collection'];
                        dataarr = [fee_collection, misc_collection];
                    }
                    if(this.individualtype == 'defaulter' && this.individualtype != ''){
                        dataarr = [0]; 
                        labelarr = ['']
                        colorarr = ['#FFFFFF']
                    }
                    if (!isNaN(fee_collection) && !isNaN(misc_collection)){
                        this.feedata = {
                            labels: labelarr,
                            datasets: [
                                { 
                                    data: dataarr,
                                    backgroundColor: colorarr,
                                    hoverBackgroundColor: colorarr
                                }]    
                            }

                            if(fee_collection == 0 && misc_collection == 0) {
                                let nocollection = 100;
                                this.feedata = {
                                    labels: ['No collection'],
                                    datasets: [
                                        {
                                            data: [nocollection],
                                            backgroundColor: ['#D4D4D4'],
                                            hoverBackgroundColor: ['#D4D4D4']
                                        }]    
                                    };     
                            }
                    }
                    labelarr = ['Defaulter']
                    colorarr = [
                        "#0195ff"
                    ]
                    if(this.individualtype != 'defaulter' && this.individualtype != ''){
                        defaulter = 0; 
                        labelarr = ['']
                        colorarr = ['#FFFFFF']
                    }
                    if (!isNaN(defaulter)){ 
                    this.defaulterdata = {
                        labels: labelarr,
                        datasets: [
                            {
                                data: [defaulter],
                                backgroundColor: colorarr,
                                hoverBackgroundColor: colorarr
                            }]    
                        };
                        
                        this.pieoptions = {
                            legend: {
                                display: false
                            },
                            responsive: true,
                            showAllTooltips: true, 
                            tooltips: {
                                callbacks: {
                                    label: function(tooltipItem, data) {
                                        var allData = data.datasets[tooltipItem.datasetIndex].data;
                                        var tooltipLabel = data.labels[tooltipItem.index];
                                        var tooltipData = allData[tooltipItem.index];
                                        
                                        return tooltipData + '%';
                                    }
                                }
                            }
                        }

                        if(defaulter == 0) {
                            let notdefaulter = 100;
                            this.defaulterdata = {
                                labels: ['No defaulters'],
                                datasets: [
                                    {
                                        data: [notdefaulter],
                                        backgroundColor: ['#D4D4D4'],
                                        hoverBackgroundColor: ['#D4D4D4']
                                    }]    
                                };     
                        }
                    }
                    
                    /* ends */  
            }
            else if(element.communicationpercent){ 
                let messagearr = [], datearr = [], circulararr = [], noticearr = [];
                this.fulldatearr = [];
                element.communicationpercent.message.forEach(val => { 
                    messagearr.push(val.messagecount);
                    datearr.push(val.date);
                    this.fulldatearr.push(val.fullDate);
                })
                element.communicationpercent.circular.forEach(val => { 
                    circulararr.push(val.circularcount);
                    datearr.push(val.date);
                    this.fulldatearr.push(val.fullDate);
                })
                element.communicationpercent.notice.forEach(val => {
                    noticearr.push(val.noticecount);
                    datearr.push(val.date);
                    this.fulldatearr.push(val.fullDate);
                })
                
                datearr = Array.from(new Set(datearr));
                this.fulldatearr = Array.from(new Set(this.fulldatearr));
                let maxcountarr = [], maxcount = 0;
                maxcountarr.push(Math.max.apply(null, messagearr));
                maxcountarr.push(Math.max.apply(null, circulararr));
                maxcountarr.push(Math.max.apply(null, noticearr));
                maxcount = Math.max.apply(null, maxcountarr);
               
                let datasetarr = [];
                switch(this.individualtype){
                    case 'message':
                    {
                        datasetarr = [
                            {
                                label: this.translate.instant('message'),
                                data: messagearr,
                                fill: false,
                                borderColor: '#c10e62'
                            }
                        ]
                        break;
                    }
                    case 'circular':
                    {
                        datasetarr = [
                            {
                                label: this.translate.instant('circular'),
                                data: circulararr,
                                fill: false,
                                borderColor: '#2ebf60'
                            }
                        ]
                        break
                    }
                    case 'notice':
                    {
                        datasetarr = [
                            {
                                label: this.translate.instant('notice'),
                                data: noticearr,
                                fill: false,
                                borderColor: '#824de6'
                            }
                        ]
                        break
                    }
                    default:{
                        datasetarr = [
                            {
                                label: this.translate.instant('message'),
                                data: messagearr,
                                fill: false,
                                borderColor: '#c10e62'
                            },
                            {
                                label:  this.translate.instant('notice'),
                                data: noticearr,
                                fill: false,
                                borderColor: '#824de6'
                            },
                            {
                                label: this.translate.instant('circular'),
                                data: circulararr,
                                fill: false,
                                borderColor: '#2ebf60'
                            }
                        ];
                        break;
                    }  
                }
                
                /* communication data */
                    this.commdata = {
                        labels: datearr,
                        datasets: datasetarr
                    }
                  
                    this.chartOptions = {
                        legend: {
                            display: false
                        },
                        tooltips: {
                            mode: 'label'
                        },
                        responsive: true,
                        scales: {
                          yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "----------" +this.translate.instant("count") +"----------" 
                            }, 
                            ticks: { 
                                min: 0,
                                max: maxcount+1,
                                userCallback: function(label, index, labels) {
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
               
                                },
                            }
                          }],
                          xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "----------" +this.translate.instant("date_range") +"----------"  
                            }
                          }]
                        },
                        elements: {
                            line: {
                                tension: 0, 
                            }
                        }
                      }
                      
                    this.delayFlag = true;
                    /* ends */
           }
        });
      }
    });
    }
  }

  attNotTaken(flag){
      window.localStorage.setItem('view_token', 'dashboard');
      window.localStorage.setItem('view_flag', flag);
      this.router.navigate(["/attendance/viewall"]);
  }
}
