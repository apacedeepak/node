import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { BackendApiService } from "./../../services/backend-api.service";
import { HttpClient } from "@angular/common/http";
import { promise } from "protractor";

@Component({
  selector: "app-center-room",
  templateUrl: "./center-room.component.html",
  styleUrls: ["./center-room.component.css"]
})
export class CenterRoomComponent implements OnInit {
  croomForm: FormGroup;
  equpArr: FormArray;
  public userId: any;
  public schoolId: any;
  public globalObj: any = {};
  public editOrUpadte: any;
  public id: any = '';
  public equipDataArr: any = [];
  public todayDate: any;
  public roomDetails: any;
  public totalRows: any;
  public viewRoomEequipmentList: any = [];
  page: number = 1;

  constructor(private myService: BackendApiService, private http: HttpClient) {
    var today = new Date();
    this.todayDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  getEquipmentDetails() {
    this.totalRows = 0;
    this.roomDetails = [];
    const roomDetailsUrl =
      this.myService.constant.apiURL + 'center_room_masters/list';
    let roomConditions = {
      order: 'id DESC',
      where: { schoolId: this.schoolId }
    };

    this.http
      .post(roomDetailsUrl, roomConditions)
      .subscribe(roomDetailsResult => {
        let roomdata: any = roomDetailsResult;
        this.roomDetails = roomdata.response.data;
        if (this.roomDetails) {
          this.totalRows = this.roomDetails.length;
        }
      });
  }

  ngOnInit() {
    this.userId = window.localStorage.getItem('user_id');
    this.schoolId = window.localStorage.getItem('school_id');
    this.equpArr = new FormArray([]);
    const quipUrl =
    this.myService.constant.apiURL + 'equipment/roomequipmentslist';
    const equipCondition = {
      where: { status: 'Active' },
      order: 'equipment_name ASC'
    };

    this.http.post(quipUrl, equipCondition).subscribe(equpResult => {
      const equipData: any = equpResult;
      this.globalObj.equipmentList = equipData.response;
      if (this.globalObj.equipmentList) {
        this.globalObj.equipmentList.forEach(value => {
          this.equpArr.push(new FormControl(''));
          this.equipDataArr.push(value.id);
        });
        this.getEquipmentDetails();
      }
    });

    this.croomForm = new FormGroup({
      id: new FormControl(""),
      room_name: new FormControl("", Validators.required),
      sitting_capacity: new FormControl("", Validators.required),
      equipment: this.equpArr
    });
  }

  onSubmitDetail(formValue) {
    const toDayYear = this.todayDate.year;
    let toDayMonth = this.todayDate.month;
    if (toDayMonth < 10) {
      toDayMonth = "0" + toDayMonth;
    }
    let toDayDay = this.todayDate.day;
    if (toDayDay < 10) {
      toDayDay = "0" + toDayDay;
    }
    const currentDate = toDayYear + "-" + toDayMonth + "-" + toDayDay;
    this.id = formValue.id > 0 ? formValue.id : 0;
    let roomName = formValue.room_name;
    let sittingCapacity = formValue.sitting_capacity;
    let postEquipData = formValue.equipment;
    var saveData: any;
    saveData = {
      schoolId: this.schoolId,
      room_name: roomName,
      sitting_capacity: sittingCapacity,
      added_by: this.userId,
      added_date: currentDate,
      updated_by: this.userId,
      updated_date: currentDate,
      status: "Active"
    };

    if (this.id > 0) {
      saveData = {
        room_name: roomName,
        sitting_capacity: sittingCapacity,
        updated_by: this.userId,
        updated_date: currentDate,
        status: "Active",
        id: this.id
      };
    }
    var findId = 0;
    let findData: any;
    let findCondition = {
      where: { schoolId: this.schoolId, room_name: roomName, status: "Active" }
    };
    const checkUrl =
      this.myService.constant.apiURL + "center_room_masters/getdata";
    this.http.post(checkUrl, findCondition).subscribe(findDetails => {
      let findResult: any = findDetails;
      findData = findResult.response.data;
      if (findData) {
        findId = findData.id > 0 ? findData.id : 0;
      }
      if (findId > 0 && formValue.id == 0) {
        this.globalObj.errorMessage =
          "This room name is already exist in this center.";
        setTimeout(() => {
          this.globalObj.errorMessage = "";
        }, 3000);
      } else {
        let roomData: any;
        const saveUrl =
          this.myService.constant.apiURL + "center_room_masters/save";
        this.http.post(saveUrl, saveData).subscribe(details => {
          let resultSet: any = details;
          roomData = resultSet.response;
          if (roomData) {
            let roomAutoId = roomData.data.id > 0 ? roomData.data.id : 0;

            if (roomAutoId > 0) {
              this.deleteRoomEquipments(roomAutoId);
              postEquipData.forEach((key, val) => {
                var equipmentId = 0;
                if (key === true) {
                  equipmentId = this.equipDataArr[val];
                  if (equipmentId > 0) {
                    const roomEquipUrl =
                      this.myService.constant.apiURL +
                      "center_room_equipment_details/save";
                    var equipSaveData = {
                      room_id: roomAutoId,
                      equipment_id: equipmentId,
                      status: "Active"
                    };
                    this.http
                      .post(roomEquipUrl, equipSaveData)
                      .subscribe(equipDetails => {
                        let equipResult: any = equipDetails;
                      });
                  }
                }
              });

              if (formValue.id > 0) {
                this.globalObj.message = "Center's room updated succesfully.";
                this.id = 0;
              } else {
                this.globalObj.message = "Center's room added succesfully.";
                this.croomForm.get("room_name").setValue("");
                this.croomForm.get("sitting_capacity").setValue("");
                if (this.equipDataArr.length > 0) {
                  for (let i in this.equipDataArr) {
                    (<FormArray>this.croomForm.get("equipment")).controls[i].setValue(false);
                  }
                }
              }

              this.getEquipmentDetails();
              this.globalObj.message = roomData.message;
              this.clearForm();
            }
          } else {
            this.globalObj.errorMessage = "Something went wrong";
            setTimeout(() => {
              this.globalObj.errorMessage = "";
            }, 3000);
          }
          setTimeout(() => {
            this.globalObj.message = "";
          }, 3000);
        });
      }
    });
  }

  deleteRoomEquipments(roomId) {
    if (roomId > 0) {
      const delEquipUrl =
        this.myService.constant.apiURL +
        "center_room_equipment_details/updatedetails";
      const updateData = {
        whereConditons: { room_id: roomId },
        updateParams: { status: "Inactive" }
      };
      this.http.post(delEquipUrl, updateData).subscribe(delEqpDetails => {
        let delResult: any = delEqpDetails;
        let deleteRes = delResult.response;
      });
    }
  }

  roomStatusUpdate(roomId, statusFlag, roomName) {
    let vstatus = "";
    if (statusFlag === 1) {
      vstatus = "Active";
    } else {
      vstatus = "Inactive";
    }

    if (
      confirm(
        "Are you sure to " + vstatus + " '" + roomName.split("T")[0] + "'"
      )
    ) {
      if (roomId > 0) {
        let statusUpdate = { id: roomId, status: vstatus };
        this.http
          .post(
            this.myService.constant.apiURL + "center_room_masters/save",
            statusUpdate
          )
          .subscribe(details => {
            const data: any = details;

            this.globalObj.message =
              "Room details " + vstatus + "ed  successfully";
            this.getEquipmentDetails();
            setTimeout(() => {
              this.globalObj.message = "";
            }, 3000);
          });
      } else {
        this.globalObj.message = "Something went wrong";
        setTimeout(() => {
          this.globalObj.errorMessage = "";
        }, 3000);
      }
    }
  }

  roomMasterEdit(roomId) {
    if (roomId) {
      this.http
        .get(this.myService.constant.apiURL + 'center_room_masters/getrowdata?id=' + roomId).subscribe(detail => {
          const data: any = detail;
          const roomData = data.response;
          this.id = roomData.id;
          this.croomForm.patchValue({
            id: roomData.id,
            room_name: roomData.room_name,
            sitting_capacity: roomData.sitting_capacity
          });

          var eqlist = [];
          let whereList = { where: { room_id: roomId, status: 'Active' } };
          this.http
            .post(
              this.myService.constant.apiURL + 'center_room_equipment_details/list',
              whereList
            )
            .subscribe(eqdetail => {
              let eqdata: any = eqdetail;
              let eqListData = eqdata.response.data;

              eqListData.forEach((key, value) => {
                eqlist.push(key.equipment_id);
              });

              if (this.equipDataArr.length > 0) {
                for (let i in this.equipDataArr) {
                  (<FormArray>this.croomForm.get("equipment")).controls[
                    i
                  ].setValue(false);
                  if (eqlist.indexOf(this.equipDataArr[i]) >= 0) {
                    (<FormArray>this.croomForm.get("equipment")).controls[
                      i
                    ].setValue(true);
                  }
                }
              }
            });
        });
    }
  }

  clearForm() {
    this.id = 0;
    this.croomForm.patchValue(
      {
        id: 0,
        room_name: '',
        batch_start_date_id: '',
        sitting_capacity: ''
      });

    if (this.equipDataArr.length > 0) {
      for (let i in this.equipDataArr) {
        (<FormArray>this.croomForm.get("equipment")).controls[i].setValue(false);
      }
    }
  }

  viewEquipments(roomId) {
    if (roomId > 0) {
      let eqpInputs = {
        where: { room_id: roomId, status: 'Active' },
        include: {
          relation: 'equipmentData', scope: { fields: ['equipment_name'] }
        }
      };
      let equrl = this.myService.constant.apiURL + 'center_room_equipment_details/list';
      this.http.post(equrl, eqpInputs).subscribe(eqdetail => {
        let eqpdata: any = eqdetail;
        this.viewRoomEequipmentList = eqpdata.response.data;
        console.log(this.viewRoomEequipmentList);
      });
    } else {
      this.viewRoomEequipmentList = [];
    }
    (<any>$("#showpopup")).modal("show");
  }
}
