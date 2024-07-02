//#region Imports

import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as $ from 'jquery';
import { BSMService } from '../../../_services/service/bsm.service'
import { BusinessSystem } from '../../../_services/model/system.modal';
import { Rule } from '../../../_services/model/Rule';
import { RuleSet } from '../../../_services/model/Ruleset';
import { RulesService } from '../../../_services/service/rules.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';

import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, SessionStorage } from 'src/app/_services/service';
//#endregion

//#region Rule Builder Component

@Component({
  selector: 'ngx-rulebuilder',
  templateUrl: './rulebuilder.component.html',
  styleUrls: ['./rulebuilder.scss'],

})

//#endregion

export class RuleBuilderComponent implements OnInit {

  //#region variables

  @ViewChild('conditionDiv') condDiv: ElementRef;
  @ViewChild('trueActionDiv') trueActionDiv: ElementRef;
  @ViewChild('falseActionDiv') falseActionDiv: ElementRef;

  loginSessionDetails: LoginResponses;
  roleId: any;
  userId: any;

  currentRule: Rule;
  rulesetId: number;
  ruleSet: RuleSet;

  hideMe: boolean = true;
  isMethodsOpen: boolean = false;
  businessSystem: BusinessSystem;
  businessSystemList: BusinessSystem[];
  // isFirstTimeSecondTabOpened: boolean = true;
  cond: string = "";
  action: string = "";
  elseaction: string = "";
  parentComponent: any;

  selectedDivId: number = 0;
  droppedDivId: number = 1;
  IsFromOtherEntity:boolean=false;
  htmlData: TempHtmlData;

  modalHeader = "Rule Builder";
  //#endregion

  //#region Methods

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    //this.stopPropagation(ev);
    ev.preventDefault();
    ev.dataTransfer.setData("text", ev.target.id);

  }

  drop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));

  }

  preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  closeModal() {
    this.activeModal.close(false);
  }

  showHide(h) {
    // if(h.data.event != undefined)
    // {
    h.stopPropagation();
    if (h.target.dataset != undefined && (h.target.dataset.type == "Method" || h.target.dataset.type == undefined)) {
      return;
    }
    // }

    if (h.data != undefined && h.data.isEnter) {
      h.data.divElement.hidden = true;
      h.data.inputElement.hidden = false;
      h.data.inputElement.height = "10px";
      h.data.inputElement.focus();
    }
    else if (h.keyCode == 13) {
      h.data.divElement.hidden = false;
      h.data.inputElement.hidden = true;
      h.data.divElement.innerText = h.data.inputElement.value;
    }

  }

  showInsertEdit(h) {
    // h.stopPropagation();
    // if (h.data != undefined && h.data.isEnter) 
    // {
    //   $(this)[0].innerHTML = '<input data-type="ParameterInputHolder" type="text" value="' +  $(this)[0].innerText + '">';
    //   $(this)[0].children[0].focus();
    //   $(this)[0].style.width="auto"; 
    //   $(this)[0].className="divOperatorInsert";
    //   // h.data.inputElement.focus();
    // }
    // else if (h.keyCode == 13) 
    // {
    //   $(this)[0].innerHTML =  $(this)[0].children[0].value;
    //   // h.data.inputElement.hidden = true;
    //   // h.data.divElement.innerText = h.data.inputElement.value;
    // }

  }

  testalert() {
    alert('sdfsdf');
  }

  showInsert(h) {

    h.stopPropagation();
    // if (h.target.dataset != undefined && (h.target.dataset.type == "Method" || h.target.dataset.type == undefined)) {
    //   return;
    // }


    if (h.data != undefined && h.data.isEnter) {
      h.data.divElement[0].innerHTML = '<input data-type="ParameterInputHolder" type="text" value="' + h.data.divElement[0].innerText + '">';
      h.data.divElement[0].children[0].focus();
      h.data.divElement[0].style.width = "auto";
      h.data.divElement[0].className = "divOperatorInsert";
      // h.data.inputElement.focus();
    }
    else if (h.keyCode == 13) {
      h.data.divElement[0].innerHTML = h.data.divElement[0].children[0].value;
      // h.data.inputElement.hidden = true;
      //  h.data.divElement.innerText = h.data.inputElement.value;
    }

  }

  toggleAccordion(event) {

    event.stopPropagation();
    if (event.target.className != "section-title" && event.target.className != "") {
      this.BindDraggableEvent();
      return;
    }

    if (this.isMethodsOpen == true && event.target.className == "section-title") {
      $(event.currentTarget).removeClass('active');
      this.isMethodsOpen = false;
    }
    else if (event.target.className == "section-title") {
      $(event.currentTarget).addClass('active');
      this.isMethodsOpen = true;
    }
    // var section = $('li');
    // section.removeClass('active');
  }

  BindDraggableEvent() {
    (<any>$(".divDropper")).draggable(
      {
        helper: 'clone',
        cursor: 'move',
        revert: 'invalid'
      });
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  saveRule(event) {
    this.stopPropagation(event);

    var conditionNodes = $('#condition').children();
    var trueActionNodes = $('#trueaction').children();
    var falseActionNodes = $('#falseaction').children();

    this.cond = "";
    this.action = "";
    this.elseaction = "";

    //this.trueActionDiv.nativeElement.innerHTML =  this.condDiv.nativeElement.innerHTML
    for (var i = 0; i < conditionNodes.length; i++) {
      this.getConditionPhrase(conditionNodes[i]);
    }

    for (var i = 0; i < trueActionNodes.length; i++) {
      this.getTrueActionPhrase(trueActionNodes[i]);
    }

    for (var i = 0; i < falseActionNodes.length; i++) {
      this.getFalseActionPhrase(falseActionNodes[i]);
    }

    if (this.currentRule == undefined) {
      this.currentRule = new Rule();
    }

    if (this.cond.length > 0) {
      this.cond = "(" + this.cond + ")";
    }
    else {
      this.cond = "('True')";
    }


    if (this.action.length > 0) {
      this.action = "(" + this.action + ")";
    }
    else {
      this.action = "('')";
    }

    if (this.elseaction.length > 0) {
      this.elseaction = "(" + this.elseaction + ")";
    }
    else {
      this.elseaction = "('')";
    }

    this.currentRule.FormattedPhrase = this.cond + "?" + this.action + ":" + this.elseaction;

    this.htmlData = new TempHtmlData();
    this.htmlData.Condition = this.condDiv.nativeElement.innerHTML;
    this.htmlData.TrueAction = this.trueActionDiv.nativeElement.innerHTML;
    this.htmlData.FalseAction = this.falseActionDiv.nativeElement.innerHTML;
    this.currentRule.HtmlData = JSON.stringify(this.htmlData);

    this.currentRule.RuleSetId = this.rulesetId;

    // console.log(JSON.stringify(this.currentRule));
    this.saveAndClose();
  }

  getConditionPhrase(element) {
    if (element == undefined || element.dataset.type == undefined) {
      if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getConditionPhrase(element.children[i]);
        }
      }
    }
    else if (element.dataset.type == "Method") {
      this.cond = this.cond + (element.parentElement != undefined && element.parentElement.dataset.type != undefined &&
        this.cond.trim().endsWith("(") == false ? "," : "") + (this.cond.trim().endsWith(")") == true ? " ;" : "") + "#" + element.dataset.fullname + "(";
      if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getConditionPhrase(element.children[i]);
        }
      }
      this.cond = this.cond + ")"
    }
    else if (element.dataset.type == "Parameter") {
      for (var i = 0; i < element.children.length; i++) {
        this.getConditionPhrase(element.children[i]);
      }
    }
    else if (element.dataset.type == "ParameterNameHolder") {
      if (element.children.length == 0 && element.innerText != "") {
        this.cond = this.cond +
          (this.cond.trim().endsWith("(") ? element.innerText : "," + element.innerText);
      }
      else if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getConditionPhrase(element.children[i]);
        }
      }
    }
    else if (element.dataset.type == "ParameterInputHolder") {

    }
    else if (element.dataset.type == "Operator") {
      if (element.dataset.identifier == "insert") {
        this.cond = this.cond + element.innerText;
      }
      else {
        this.cond = this.cond + " " + element.innerText + " ";
      }
    }
  }

  getTrueActionPhrase(element) {
    if (element == undefined || element.dataset.type == undefined) {
      if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getTrueActionPhrase(element.children[i]);
        }
      }
    }
    else if (element.dataset.type == "Method") {
      //alert(element.dataset.fullname);
      //alert(element.dataset.fullname.replace('.', '_'));

      this.action = this.action + (element.parentElement != undefined && element.parentElement.dataset.type != undefined &&
        this.action.trim().endsWith("(") == false ? "," : "") + (this.action.trim().endsWith(")") == true ? " ;" : "") + "#" + element.dataset.fullname + "(";
      if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getTrueActionPhrase(element.children[i]);
        }
      }
      this.action = this.action + ")"
    }
    else if (element.dataset.type == "Parameter") {
      for (var i = 0; i < element.children.length; i++) {
        this.getTrueActionPhrase(element.children[i]);
      }
    }
    else if (element.dataset.type == "ParameterNameHolder") {
      if (element.children.length == 0 && element.innerText != "") {
        this.action = this.action +
          (this.action.trim().endsWith("(") ? element.innerText : "," + element.innerText);
      }
      else if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getTrueActionPhrase(element.children[i]);
        }
      }
    }
    else if (element.dataset.type == "ParameterInputHolder") {

    }
    else if (element.dataset.type == "Operator") {
      if (element.dataset.identifier == "insert") {
        this.action = this.action + element.innerText;
      }
      else {
        this.action = this.action + " " + element.innerText + " ";
      }
    }
  }

  getFalseActionPhrase(element) {
    if (element == undefined || element.dataset.type == undefined) {
      if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getFalseActionPhrase(element.children[i]);
        }
      }
    }
    else if (element.dataset.type == "Method") {
      this.elseaction = this.elseaction + (element.parentElement != undefined && element.parentElement.dataset.type != undefined &&
        this.elseaction.trim().endsWith("(") == false ? "," : "") + (this.elseaction.trim().endsWith(")") == true ? " ;" : "") + "#" + element.dataset.fullname + "(";
      if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getFalseActionPhrase(element.children[i]);
        }
      }
      this.elseaction = this.elseaction + ")"
    }
    else if (element.dataset.type == "Parameter") {
      for (var i = 0; i < element.children.length; i++) {
        this.getFalseActionPhrase(element.children[i]);
      }
    }
    else if (element.dataset.type == "ParameterNameHolder") {
      if (element.children.length == 0 && element.innerText != "") {
        this.elseaction = this.elseaction +
          (this.elseaction.trim().endsWith("(") ? element.innerText : "," + element.innerText);
      }
      else if (element.children.length > 0) {
        for (var i = 0; i < element.children.length; i++) {
          this.getFalseActionPhrase(element.children[i]);
        }
      }
    }
    else if (element.dataset.type == "ParameterInputHolder") {

    }
    else if (element.dataset.type == "Operator") {
      if (element.dataset.identifier == "insert") {
        this.elseaction = this.elseaction + element.innerText;
      }
      else {
        this.elseaction = this.elseaction + " " + element.innerText + " ";
      }
    }
  }

  undoRuleChanges(event) {
    this.stopPropagation(event);

  }

  getFullMethodName(fn) {
    //let re = /\./gi;
    return (fn.AssemblyName != undefined ? fn.AssemblyName.replace(".dll", "_").replace(".", "_") : '') + fn.ClassFullyQualifiedName.replace('.', '_') + '.' + fn.Name;
  }

  getJsonString(obj) {
    return JSON.stringify(obj);
  }

  loadBusinessSystems() {
    this.rest.GetBusinessSystemById(this.ruleSet.BusinessSystemId)
      .subscribe((data) => {
        this.businessSystemList = data;
        // console.log(this.businessSystemList);
        this.businessSystem = this.businessSystemList[0];
        //console.log(data);
      },
        //error => this.msg = <any>error
      );
  }

  getDroppedDivId() {
    this.droppedDivId = this.droppedDivId + 1;
    return this.droppedDivId;
  }

  deleteItem() {
    if (this.selectedDivId > 0) {
      if (window.confirm("Are you sure you want to delete the selected item?")) {
        $('#' + this.selectedDivId).remove();
      }
    }
  }

  clearDiv(itemName) {
    if (window.confirm("Are you sure you want to delete the '" + itemName + "'?")) {
      if (itemName == "Condition") {
        $('#condition').empty();
      }
      else if (itemName == "Action: If True") {
        $('#trueaction').empty();
      }
      else if (itemName == "Action: If False") {
        $('#falseaction').empty();
      }
    }
  }

  saveAndClose() {
    if (window.confirm('Are you sure you want to save this rule?')) {
      if (this.currentRule.Id == undefined || this.currentRule.Id == 0) {
        this.currentRule.CreatedBy = this.userId; //get from session
      }
      this.currentRule.LastUpdatedBy = this.userId;
      this.currentRule.Status = 1;
    
      if(this.IsFromOtherEntity)
      {
        let uuid : any;
        uuid = UUID.UUID();
        this.currentRule.Id = this.currentRule.Id == undefined ? uuid : this.currentRule.Id;
        if (this.currentRule.FormattedPhrase == undefined || this.currentRule.HtmlData == undefined) {
          var conditionNodes = $('#condition').children();
          var trueActionNodes = $('#trueaction').children();
          var falseActionNodes = $('#falseaction').children();
      
          this.cond = "";
          this.action = "";
          this.elseaction = "";
      
          //this.trueActionDiv.nativeElement.innerHTML =  this.condDiv.nativeElement.innerHTML
          for (var i = 0; i < conditionNodes.length; i++) {
            this.getConditionPhrase(conditionNodes[i]);
          }
      
          for (var i = 0; i < trueActionNodes.length; i++) {
            this.getTrueActionPhrase(trueActionNodes[i]);
          }
      
          for (var i = 0; i < falseActionNodes.length; i++) {
            this.getFalseActionPhrase(falseActionNodes[i]);
          }
      
          if (this.currentRule == undefined) {
            this.currentRule = new Rule();
          }
      
          if (this.cond.length > 0) {
            this.cond = "(" + this.cond + ")";
          }
          else {
            this.cond = "('True')";
          }
      
      
          if (this.action.length > 0) {
            this.action = "(" + this.action + ")";
          }
          else {
            this.action = "('')";
          }
      
          if (this.elseaction.length > 0) {
            this.elseaction = "(" + this.elseaction + ")";
          }
          else {
            this.elseaction = "('')";
          }
      
          this.currentRule.FormattedPhrase = this.cond + "?" + this.action + ":" + this.elseaction;
      
          this.htmlData = new TempHtmlData();
          this.htmlData.Condition = this.condDiv.nativeElement.innerHTML;
          this.htmlData.TrueAction = this.trueActionDiv.nativeElement.innerHTML;
          this.htmlData.FalseAction = this.falseActionDiv.nativeElement.innerHTML;
          this.currentRule.HtmlData = JSON.stringify(this.htmlData);  
        }
        this.currentRule.RuleSetId = this.rulesetId;
        this.activeModal.close(this.currentRule);
      }
      else{
      this.rulesApi.upsertRule(this.currentRule).subscribe(res => {
        if (res.Error == null) {
          if (res.InsertedId > 0) {
            this.currentRule.Id = res.InsertedId;
          }

          // this.activeModal.close({ Object: this.currentRule, Result: true, Component: this.parentComponent });
          this.activeModal.close(true);
        }
        else {
          alert(res.Error.ErrorMessage);
          return;
        }

      }, err => {
        alert(err);

      });
    }
    }
  }

  //#endregion

  //#region Constructor and Init

  constructor(public rest: BSMService, private rulesApi: RulesService, private activeModal: NgbActiveModal, private sessionService: SessionStorage) {


  }

  ngOnInit() {

    //#region Load Systems and bind Rule (if edit mode)

    this.loadBusinessSystems();

    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userId = this.loginSessionDetails.UserSession.UserId;
    this.roleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    
    if (this.currentRule != undefined && this.currentRule.Id > 0) {
      this.htmlData = new TempHtmlData();
      this.htmlData = JSON.parse(this.currentRule.HtmlData);
    
      // let result = Array.from(this.currentRule.HtmlData.matchAll(/(id=)/));
      // console.log(result);

      this.condDiv.nativeElement.innerHTML = this.htmlData.Condition;
      this.trueActionDiv.nativeElement.innerHTML = this.htmlData.TrueAction;
      this.falseActionDiv.nativeElement.innerHTML = this.htmlData.FalseAction;
    }

    if (this.currentRule != undefined && this.currentRule.Id === 0 && this.IsFromOtherEntity) {
      this.htmlData = new TempHtmlData();
      this.htmlData = this.currentRule && this.currentRule.HtmlData ? JSON.parse(this.currentRule.HtmlData) : this.htmlData;
      this.condDiv.nativeElement.innerHTML = this.htmlData.Condition;
      this.trueActionDiv.nativeElement.innerHTML = this.htmlData.TrueAction;
      this.falseActionDiv.nativeElement.innerHTML = this.htmlData.FalseAction;
    }


    if (this.currentRule != undefined && this.currentRule.Id === 0 && this.IsFromOtherEntity) {
      this.htmlData = new TempHtmlData();
      this.htmlData = this.currentRule && this.currentRule.HtmlData ? JSON.parse(this.currentRule.HtmlData) : this.htmlData;
      this.condDiv.nativeElement.innerHTML = this.htmlData.Condition;
      this.trueActionDiv.nativeElement.innerHTML = this.htmlData.TrueAction;
      this.falseActionDiv.nativeElement.innerHTML = this.htmlData.FalseAction;
    }

    var self = this;

    //#endregion

    $(document).ready(function () {
      var x;
      var hoveredObj;

      //#region Styles

      function setCSS(x) {
        x.css('position', 'relative');
        x.css('float', 'unset');
        x.css('left', '0');
        x.css('top', '0');
        x.css('display', 'inline-block');

        // x.css('border-style', 'solid');
        // x.css('border-color', 'grey');
        // x.css('border-radius', '10px');
        x.css('padding-left', '3px');
        x.css('padding-right', '3px');
        x.css('padding-top', '1px');
        x.css('padding-bottom', '1px');
        // x.css('border-width', 'thin');
        // x.css('margin-left', '2px');
        // x.css('margin-right', '2px');
        // x.css('margin-top', '1px');
        // x.css('margin-bottom', '1px');
        // x.css('background-color', 'aliceblue');
        x.addClass("droppedStyle");
        x.children().first().css('display', 'inline-block');
        $(x).attr('id', self.getDroppedDivId());





        // x.children().first().children().first().click({param1: 'lll'}, self.showHide);
        // [].slice.call(x.children().first().children()).forEach(element => {
        //   element.click(self.showHide);

        // });
        // x.children().first().addEventListener('click', 'showHide.bind(this)');
      }

      // (<any>$("div[data-identifier]")).click(function () {
      //   this.children[0].hidden = false;
      //   this.children[0].focus();
      // });

      // (<any>$("div[data-identifier]").bind('keyup', function (e) {
      //   if (e.which == 13) {
      //     e.stopPropagation();
      //     e.preventDefault();
      //     this.children[0].hidden  = true;
      //     // this.innerText += this.children[0].value;
      //   }
      // }));

      //#region Double Click and Drop related functions for newly dropped elements

      function setDblClick(x, event) {
        if (x == undefined || x[0] == undefined || x[0].children == undefined || x[0].children.length == 0 || x[0].children[0].children == undefined) {
          return;
        }

        for (var i = 0; i < x[0].children[0].children.length; i++) {
          // var ele = x[0].children[0].children[i].children[0];
          // (<any>$(ele)).dblclick({ divElement: ele.childNodes[0], inputElement: ele.childNodes[1], isEnter: true }, self.showHide);
          // (<any>$(ele.childNodes[1])).bind('keyup', { divElement: ele.childNodes[0], inputElement: ele.childNodes[1], isEnter: false, keyCode: this }, self.showHide);

          var ele = x[0].children[0].children[i];
          (<any>$(ele)).dblclick({ divElement: ele.children[0], inputElement: ele.children[1], isEnter: true, event: event }, self.showHide);
          (<any>$(ele.children[1])).bind('keyup', { divElement: ele.children[0], inputElement: ele.children[1], isEnter: false, keyCode: this, event: event }, self.showHide);


        }
        // var arrr = Array.from(x.children().first().children());
        // for (var i = 0; i < arrr.length; i++) {
        //   var ele = arrr[i];
        //   if ((<any>ele).tagName == 'DIV') 
        //   {
        // $(ele).dblclick({ divElement: ele.childNodes[0], inputElement: ele.childNodes[1], isEnter: true }, self.showHide);
        // $(ele.childNodes[1]).bind('keyup', { divElement: ele.childNodes[0], inputElement: ele.childNodes[1], isEnter: false, keyCode: this }, self.showHide);
        // $(ele).dblclick({ divElement: ele.childNodes[0], inputElement: ele.childNodes[1], isEnter: true }, self.showHide);
        // $(ele.childNodes[1]).bind('keyup', { divElement: ele.childNodes[0], inputElement: ele.childNodes[1], isEnter: false, keyCode: this }, self.showHide);

        // }
        // else {
        //   //$(ele).bind('keyup', { divElement: arrr[i - 1], inputElement: ele, isEnter: false, keyCode: this },self.showHide);
        //   // {
        //   //   if (e.keyCode == 13) {
        //   //     self.showHide({ divElement: arrr[i - 1], inputElement: ele, isEnter: false })
        //   //   }
        //   // });
        // }
        // }
      }

      function dropFunction(x, dropElement, event) {
        x.draggable({
          helper: 'original',

          tolerance: 'fit',
          cursor: 'pointer',
          revert: 'true',
          greedy: 'true'
        });

        setCSS(x);
        setDblClick(x, event);

        // var hasComma = dropElement[0].innerText.indexOf(',') !== -1;
        dropElement.text('');
        dropElement.removeClass("droppedStyle");
        dropElement.css('padding', '0px');
        // dropElement.innerHTML('');

        x.appendTo(dropElement);
        // if(hasComma)
        // {
        //   dropElement.append(',&nbsp;');
        // }
      }

      function getid(obj) {
        hoveredObj = obj;
      }

      //#endregion

      function highlightSection(event) {
        event.stopPropagation();

        if (event.target.dataset.type == "Method" || event.target.dataset.type == "Operator") {
          $("#condition div").removeClass("highlights");
          $("#trueaction div").removeClass("highlights");
          $("#falseaction div").removeClass("highlights");
          $(event.target).addClass("highlights");
          self.selectedDivId = event.target.id;
        }
      }

      //#endregion

      //#region Event Binding

      (<any>$(document)).bind('keyup', function (e) {
        if (e.which == 46) {
          e.stopPropagation();
          e.preventDefault();
          //console.log(e);
          if (self.selectedDivId > 0) {
            if (window.confirm("Are you sure you want to delete the selected item?")) {
              $('#' + self.selectedDivId).remove();
            }
          }
        }
      });

      (<any>$(".accordion")).click(function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
        event.stopPropagation();
        event.preventDefault();
      });

      (<any>$(".divDropper")).draggable(
        {
          helper: 'clone',
          cursor: 'move',
          revert: 'invalid'
        });

      (<any>$(".divOperators")).draggable(
        {
          helper: 'clone',
          cursor: 'move',
          revert: 'invalid'
        });

      (<any>$(".divOperatorInsert")).draggable(
        {
          helper: 'clone',
          cursor: 'move',
          revert: 'invalid'
        });

      ((<any>$(".divOperatorInsert")).dblclick({ divElement: $(this), inputElement: null, isEnter: true, event: event }, self.showInsertEdit));

      ((<any>$(".divOperatorInsert")).bind('keyup', { divElement: $(this), inputElement: null, isEnter: false, keyCode: this, event: event }, self.showInsertEdit));

      (<any>$(".divCondition, .divTrue, .divFalse")).droppable(
        {
          greedy: true,
          // accept: "#products-area .ui-draggable", //Must come from this dragged element
          drop: function (event, ui) {
            // alert("You dropped to div ID "+$(this).attr('id'));
            // $(ui.helper[0].dataset.json)
            event.preventDefault();
            event.stopPropagation();
            x = ui.helper.clone();
            setCSS(x);
            // if (x[0].attributes['data-identifier'] != undefined) 
            // {
            //   ((<any>$(x[0])).dblclick({ divElement: x[0], inputElement: null, isEnter: true, event: event }, self.showInsert));

            //   ( (<any>$(x[0])).bind('keyup', { divElement: x[0], inputElement: null, isEnter: false, keyCode: this, event: event }, self.showInsert));
            // }

            if (event.target != event.originalEvent.target
              && event.originalEvent.target.className != "divOperators ui-draggable ui-draggable-handle ui-draggable-dragging"
              && event.originalEvent.target.className != "divOperatorInsert ui-draggable ui-draggable-handle ui-draggable-dragging"
              && event.originalEvent.target.className != "divOperatorInsert ui-draggable-dragging"
              && event.originalEvent.target.className != "divDropper ng-star-inserted ui-draggable ui-draggable-handle ui-droppable ui-draggable-dragging"
            ) {
              //if (event.originalEvent.target.parentNode != undefined && event.originalEvent.target.parentNode.className != "param ng-star-inserted") {
              return;
              //}
            }
            //divCondition ui-droppable
            //  x = ui.helper.clone();    // Store cloned div in x
            ui.helper.remove();
            // var isInternalMove = x.parentElement != undefined && (x.parentElement.className.indexOf('divCondition') != -1 ||
            //   x.parentElement.className.indexOf('divTrue') != -1 ||
            //   x.parentElement.className.indexOf('divFalse') != -1) &&
            //   (x.parentElement.className! = event.target.className);
            // ui.draggable.closest("div").closest("div")
            // if (!isInternalMove) {

            x.draggable(
              {
                helper: 'original',
                // containment: '#section',
                tolerance: 'fit',
                cursor: 'pointer',
                revert: 'invalid'
              });
            // }
            // else {

            //   x.draggable(
            //     {
            //       helper: 'clone',
            //       cursor: 'move',
            //       revert: 'invalid'
            //     });
            // }

            if (x[0].attributes['data-identifier'] != undefined) {

              ((<any>$(x[0])).dblclick({ divElement: x, inputElement: null, isEnter: true, event: event }, self.showInsert));
              ((<any>$(x[0])).bind('keyup', { divElement: x, inputElement: null, isEnter: false, keyCode: this, event: event }, self.showInsert));

            }
            else {
              setDblClick(x, event);
            }


            if (x != undefined && x[0] != undefined && x[0].dataset.type == "Operator") {
              (<any>$(x)).click(highlightSection);

            }

            if (x != undefined && x[0] != undefined && x[0].children != undefined && x[0].children.length > 0 &&
              x[0].children[0].children != undefined) {
              if (x[0].dataset.type == "Method") {
                (<any>$(x)).click(highlightSection);

              }
              for (var i = 0; i < x[0].children[0].children.length; i++) {

                (<any>$(x[0].children[0].children[i].children[0])).droppable(
                  {
                    greedy: true,
                    drop: function (e, u) {
                      if (e.originalEvent.target.innerHTML == ",&nbsp;") {
                        return;
                      }

                      var y;
                      y = u.helper.clone();
                      u.helper.remove();
                      y.draggable({
                        helper: 'original',
                        // containment: '#section',
                        tolerance: 'fit',
                        cursor: 'pointer',
                        revert: 'true'
                      });
                      // $('.div_2 .div_1 .param')

                      dropFunction(y, $(e.originalEvent.target), e);
                      return;
                    }

                  }
                );
              }
            }

            x.appendTo(this);
            // dropFunction(x, $('#section'));

          }
        });

      //#endregion

      //#region Edit fixes

      (<any>$(".param")).keyup(function (h) {
        if (h.keyCode == 13) {
          $(this)[0].children[0].hidden = false;
          $(this)[0].children[1].hidden = true;
          $(this)[0].children[0].innerText = $(this)[0].children[1].value;
        }
      });

      (<any>$(".divDropper")).click(highlightSection);

      (<any>$(".param")).dblclick(function () {

        $(this)[0].children[0].hidden = true;
        $(this)[0].children[1].hidden = false;
        $(this)[0].children[1].height = "10px";
        $(this)[0].children[1].focus();

      });

      (<any>$(".param")).droppable(
        {
          greedy: true,
          drop: function (e, u) {
            if (e.originalEvent.target.innerHTML == ",&nbsp;") {
              return;
            }

            var y;
            y = u.helper.clone();
            u.helper.remove();
            y.draggable({
              helper: 'original',
              // containment: '#section',
              tolerance: 'fit',
              cursor: 'pointer',
              revert: 'true'
            });
            // $('.div_2 .div_1 .param')

            dropFunction(y, $(e.originalEvent.target), e);
            return;
          }

        }
      );

      var max = 0;
      (<any>$(".divDropper")).each(function () {
        max = Math.max(this.id, max);
      });
      self.droppedDivId = max;

      //#endregion

    });

  }

  //#endregion
}

//#region Temp Models

export class TempHtmlData {
  Condition: string;
  TrueAction: String;
  FalseAction: string;
}

//#endregion
