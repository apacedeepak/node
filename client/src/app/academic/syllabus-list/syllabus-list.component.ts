import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, FormControlName } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { element } from 'protractor';
import { TreeviewModule, TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-syllabus-list',
  templateUrl: './syllabus-list.component.html',
  styleUrls: ['./syllabus-list.component.css']
})

export class SyllabusListComponent implements OnInit {
  public syllabusData: any;
  public sub: any;
  public id: any;
  public subjectId: any;

  dropdownEnabled = true;
  items: TreeviewItem[];
  values: number[];

  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false
    //maxHeight: 400
  });

  constructor(private route: ActivatedRoute, private http: HttpClient, private myService: BackendApiService, private router: Router) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number

      if (this.id) {
        console.log("test");
        this.getWholeSyllabusDetails(this.id);
      }
    });
  }

  getWholeSyllabusDetails(rowId = 0) {
    if (rowId > 0) {
      const micUrl = this.myService.constant.apiURL + 'microschedule_masters/getrowdata?id=' + rowId;
      this.http.get(micUrl).subscribe(micDetails => {
        const micResult: any = micDetails;
        if (micResult.response) {
          let subjId = micResult.response.subject_id;
          let boardId = micResult.response.board_id;
          if (boardId) {
            let boardStr = { id: boardId };
            const csBoardUrl = this.myService.constant.apiURL + 'boards/findOne?id=' + boardId;
            this.http.get(csBoardUrl).subscribe(cdBoardDetails => {
              const csBoardResult: any = cdBoardDetails;
              let customBoardId = csBoardResult.boardId;
              if (subjId > 0 && customBoardId) {
                this.subjectId = subjId;
                const syllabusUrl = this.myService.constant.apiURL + 'lmsapis/syllabusData';
                const syllabusInputs = { subject_id: subjId, board_id: customBoardId };
                this.http.post(syllabusUrl, syllabusInputs).subscribe(syllabusDetails => {
                  const syllabusResult: any = syllabusDetails;
                  if (syllabusResult.response.status == '200') {
                    this.syllabusData = syllabusResult.response.data;
                    this.items = this.getSyllabus(this.syllabusData);
                  }
                });
              }
            });
          }
        }
      });
    }



  }


  getSyllabus(syllabusData): TreeviewItem[] {
    var syllabusArr: any = [];
    var chapterArr: any = [];
    var topicArr: any = [];
    var subtopicArr: any = [];
    syllabusData.forEach((val, key) => {
      syllabusArr[key] = [];
      if (val.children) {
        chapterArr[key] = [];
        val.children.forEach((cval, ckey) => {
          var chapterName = cval.text.replace(',', ' ');
          var chapterId = cval.value;
          if (cval.children) {
            topicArr[key][ckey] = [];
            cval.children.forEach((ccval, cckey) => {
              var topicName = ccval.text.replace(',', ' ');
              var topicId = ccval.value;

              if (ccval.children) {
                subtopicArr[key][ckey][cckey] = [];
                ccval.child.forEach((cccval, ccckey) => {
                  var subtopicName = cccval.text.replace(',', ' ');
                  var subtopicId = cccval.value;
                  subtopicArr[key][ckey][cckey].push({ text: subtopicName, value: subtopicId });
                });
                topicArr[key][ckey].push({ text: topicName, value: topicId, children: subtopicArr[key][ckey][cckey] });
              } else {
                topicArr[key][ckey].push({ text: topicName, value: topicId });
              }

            });

            chapterArr[key].push({ text: chapterName, value: chapterId, children: topicArr[key][ckey] });
          } else {
            chapterArr[key].push({ text: chapterName, value: chapterId });
          }
        });
        syllabusArr[key] = new TreeviewItem({ text: val.text, value: val.value, children: chapterArr[key], collapsed: true });
      } else {
        syllabusArr[key] = new TreeviewItem({ text: val.text, value: val.value, collapsed: true });
      }
    });
    return syllabusArr;
  }

}
