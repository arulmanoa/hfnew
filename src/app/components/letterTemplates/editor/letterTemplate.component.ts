import { Component, ViewEncapsulation, OnInit, ElementRef } from "@angular/core";
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import * as FileSaver from 'file-saver';
import { ApplicationService } from 'src/app/_services/service/application.service';
import { ClientService } from 'src/app/_services/service/client.service';
import { Template } from 'src/app/_services/model/template';
import { TemplateService } from 'src/app/_services/service/template.service';
import * as $ from 'jquery';
import { forEach } from "@angular/router/src/utils/collection";
import Swal from "sweetalert2";

import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { LoginResponses, } from '../../../_services/model/Common/LoginResponses';

@Component(
  {
    selector: 'abc',
    templateUrl: './letterTemplate.component.html',
    styleUrls: ['../letterTemplate.component.css'],
    encapsulation: ViewEncapsulation.Emulated
  })

export class LetterTemplateComponent implements OnInit {
  headerValue: string;
  bodyValue: string;
  footerValue: string;

  fileinfo: any;
  disabled: boolean;

  isduplication: boolean;
  templateId: number;

  letterTemplate: Template;

  
  Typename: any;

  implCompCodeList: any[];
  clientCodeList: any[];
  contractCodeList: any[];
  validFrom: any;
  validTo: any;
  cursorPosition: any;

  templateCategoryList: any[];
  filteredCategoryList: any[];
  flagDiv: boolean = false;
  selectedCategory: string;
  fields: any[];
  defalutSmeClientId:any;
  defalutSmeClientContractId:any;
  _companyId:any;
  _businessType:any;

  
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '10rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  }

  constructor(private router: Router, private route: ActivatedRoute, private elementRef: ElementRef, private applicationApi: ApplicationService, private clientApi: ClientService, private templateApi: TemplateService,private sessionService: SessionStorage) 
  {

   
  
      this.headerValue = "Header";
      this.bodyValue = "Body";
      this.footerValue = "Footer";
    

    this.disabled = false;

    if (this.letterTemplate == undefined || this.letterTemplate == null) {
      this.letterTemplate = new Template();
    }
    if (this.clientCodeList == undefined) {
      this.clientCodeList = [];
    }
    if (this.contractCodeList == undefined) {
      this.contractCodeList = [];
    }

    this.applicationApi.GetImplementationCompanyCodesByImplementation()
      .subscribe((data) => {
        this.implCompCodeList = data;
      },
        //error => this.msg = <any>error
      );

      try {
        
      
    this.templateApi.getActiveTemplateCategoriesForAllCompanies()
      .subscribe((data) => {
        
        this.templateCategoryList =  JSON.parse(data);
        console.log("getActiveTemplateCategoriesForAllCompanies",this.templateCategoryList)
        console.log('Parse Data ::', data);
        console.log('RESP : ', JSON.parse(data));
        alert('ssS')
        this.filterCategories(this.letterTemplate.ImplementationCompanyId, this.letterTemplate.ClientId, this.letterTemplate.ClientContractId);
        // this.filteredCategoryList = this.templateCategoryList.slice();
      },
        //error => this.msg = <any>error
      );
    } catch (error) {
        
    }
  }
  
  sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
  clientId=this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType
  
       
 // clientId=this.sessionDetails['ImplementationCompanyId']
  drag(ev) {
    //alert('sdf');
    // ev.preventDefault();
    ev.dataTransfer.setData("dynFd", ev.target.innerText);
    //ev.preventDefault();
    // ev.target.style.background = '#f1f1f1';
    // ev.target.style.boxShadow = '2px 2px 1px 1px rgba(144, 144, 144, 0.39)';
  }

  ngAfterViewInit() {
    var nodelist = this.elementRef.nativeElement.querySelectorAll('.angular-editor-textarea');
    for (var indx = 0; indx < nodelist.length; indx++) {
      nodelist[indx].addEventListener('dragover', this.onDragOver.bind(this));
      nodelist[indx].addEventListener('drop', this.onDrop.bind(this));

      $(nodelist[indx]).css('height', 'unset');
      $(nodelist[indx]).css('max-height', '22rem');
    }
  }

  // editorchange() {
  //   this.elementRef.nativeElement.querySelector('.angular-editor-textarea')
  //   .addEventListener('click', this.mouseUp.bind(this));
  // }

  // mouseUp()
  // {
  //   alert('x');
  // }

  onDragOver(ev) {
    ev.preventDefault();
  }

  insertAfter(referenceNode, newNode) {
    //referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  onDrop(ev) {
    // this.cursorPosition = window.getSelection().getRangeAt(0);
    if (document.caretRangeFromPoint) { // Chrome
      this.cursorPosition = document.caretRangeFromPoint(ev.clientX, ev.clientY);
    }
    else {
      return;
    }
    // var editableDiv = document.getElementById("txtHeader");
    if (this.cursorPosition.commonAncestorContainer.parentNode.className == "angular-editor-textarea"
      || (this.cursorPosition.commonAncestorContainer.parentNode.localName != "span" &&
        this.cursorPosition.commonAncestorContainer.parentNode.parentNode.className == "angular-editor-textarea")) {
      var data = ev.dataTransfer.getData("dynFd");
      if (data != undefined) {
        var div = document.createElement('div');
        div.innerHTML = '<span contenteditable="false" style=" border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;">~~' + data + '~~</span>';

        //ev.target.appendChild(div.firstChild);
        this.cursorPosition.insertNode(div.firstChild);
        //this.insertAfter(div.firstChild, document.createTextNode('\u00A0'));
      }
    }
    ev.preventDefault();
  }

  ngOnInit() {
    var self = this;
    this.defalutSmeClientId=this.sessionService.getSessionStorage("default_SME_ClientId");
    this.defalutSmeClientContractId=this.sessionService.getSessionStorage("default_SME_ContractId");
    this._companyId=this.sessionDetails.Company.Id
    this._businessType=this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType
    
    this.templateId = JSON.parse(this.route.snapshot.paramMap.get('templateId'));
    if (this.templateId == undefined) {
      // alert('If you want to add a template, please do it from the template listing UI');
      this.router.navigate(['/app/masters/templatelist'], { skipLocationChange: false });
      return;
    }


    if (this.templateId != undefined && this.templateId > 0) {
      
      setTimeout(() => {
        this.do_Edit();
      }, 3000);


    }

    // if (this.templateId != undefined && this.templateId > 0) {
    //   this.isduplication = JSON.parse(this.route.snapshot.paramMap.get('isDup'));

    //   this.templateApi.getTemplateById(this.templateId)
    //     .subscribe((data) => {
    //       this.letterTemplate = data;
    //       this.Typename = this.letterTemplate.Type;
    //       this.headerValue = data.Header;
    //       this.bodyValue = data.Body;
    //       this.footerValue = data.Footer;

    //       this.selectCategory(this.templateCategoryList.find(x=>x.Id == data.TemplateCategoryId));

    //       if (data.ValidFrom != undefined
    //         && data.ValidFrom != null) 
    //         {
    //           var vf = new Date(data.ValidFrom);
    //         // this.validFrom = { "year": 2019, "month": 6, "day": 5 };
    //         this.validFrom = { "year": vf.getFullYear(), "month": vf.getMonth() + 1, "day": vf.getDate() };
    //       }

    //       if (data.ValidTill != undefined
    //         && data.ValidTill != null) 
    //         {
    //           var vt = new Date(data.ValidTill);
    //         // this.validTo = { "year": 2019, "month": 6, "day": 5 };
    //         this.validTo = { "year": vt.getFullYear(), "month": vt.getMonth() + 1, "day": vt.getDate() };
    //       }

    //     },
    //       //error => this.msg = <any>error
    //     );
    // }

    $(document).ready(function () {
      $('legend.togvis').click(function () {
        $(this).siblings().toggle();
        return false;
      });
    });
  }


  do_Edit(){

    if (this.templateId != undefined && this.templateId > 0) {
      this.isduplication = JSON.parse(this.route.snapshot.paramMap.get('isDup'));

      this.templateApi.getTemplateById(this.templateId)
        .subscribe((data) => {
          this.letterTemplate = data;
          // this.letterTemplate.push({
          //   ImplementationCompanyId : })
          console.log('letter template',this.letterTemplate)
          this.Typename = this.letterTemplate.Type;
          this.headerValue = data.Header;
          // this.bodyValue = data.Body;
          
          if(this.letterTemplate.Type == 3){
            data.Body = data.Body.replace(/%0a/g, '<br>');
            // data.Body = data.Body.replace(/ /g, '&nbsp;');
            this.bodyValue = data.Body;
          }
          else{
            this.bodyValue = data.Body;
          }
          this.footerValue = data.Footer;

          console.log('body',this.bodyValue);
console.log(data.TemplateCategoryId);
console.log(this.templateCategoryList);

          this.selectCategory(this.templateCategoryList.find(x=>x.Id == data.TemplateCategoryId));

          if (data.ValidFrom != undefined
            && data.ValidFrom != null) 
            {
              var vf = new Date(data.ValidFrom);
            // this.validFrom = { "year": 2019, "month": 6, "day": 5 };
            this.validFrom = { "year": vf.getFullYear(), "month": vf.getMonth() + 1, "day": vf.getDate() };
          }

          if (data.ValidTill != undefined
            && data.ValidTill != null) 
            {
              var vt = new Date(data.ValidTill);
            // this.validTo = { "year": 2019, "month": 6, "day": 5 };
            this.validTo = { "year": vt.getFullYear(), "month": vt.getMonth() + 1, "day": vt.getDate() };
          }

        },
          //error => this.msg = <any>error
        );
    }

  }


  // goToListing() {
  //   this.router.navigate(['/home/templatelist'], { skipLocationChange: true });
  // }

  goToListing() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.router.navigate(['/app/masters/templatelist']); 
   
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
       
      }
    })


  }


  saveTemplate() {
    var errMsg = this.validateTemplate();
    if (errMsg != undefined && errMsg != null) {
      alert(errMsg);
      return;
    }

    if (window.confirm('Are you sure you want to save this template?')) {
      if (this.letterTemplate.Id == undefined || this.letterTemplate.Id == 0) {
        this.letterTemplate.CreatedBy = "sandeep";//get from session
      }

      this.letterTemplate.LastUpdatedBy = "sandeep";
      this.letterTemplate.Status = 1;

      this.letterTemplate.TemplateCategoryId = this.templateCategoryList.find(x => x.Code == this.selectedCategory).Id;
      if (this.validFrom != undefined && this.validFrom != null) {
        this.letterTemplate.ValidFrom = new Date(this.validFrom.year, this.validFrom.month - 1, this.validFrom.day + 1);
      }
      if (this.validTo != undefined && this.validTo != null) {
        this.letterTemplate.ValidTill = new Date(this.validTo.year, this.validTo.month - 1, this.validTo.day + 1);
      }

      this.letterTemplate.Header = document.getElementById("txtHeader").children[0].children[1].children[0].innerHTML;
      if(this.letterTemplate.Type == 3){
        this.letterTemplate.Body = document.getElementById("txtBody").children[0].children[1].children[0].innerHTML.replace(/<br>/g, "%0a");
        // this.letterTemplate.Body = document.getElementById("txtBody").children[0].children[1].children[0].innerHTML.replace(/&nbsp;/g, " ");
        // console.log('html',this.letterTemplate.Body);
        // var str = this.letterTemplate.Body; 
        // this.letterTemplate.Body = str.replace(/&nbsp;/i, " ");
        // this.letterTemplate.Body = this.letterTemplate.Body.replace(/&nbsp;/g, " ");
      }
      else{
        this.letterTemplate.Body = document.getElementById("txtBody").children[0].children[1].children[0].innerHTML;
      }
      
      console.log('html',this.letterTemplate.Body);
      console.log('letter',this.letterTemplate);
      this.letterTemplate.Footer = document.getElementById("txtFooter").children[0].children[1].children[0].innerHTML;
      this.letterTemplate.CreatedOn = new Date();

      // alert(JSON.stringify(this.letterTemplate));
      // console.log(JSON.stringify(this.letterTemplate));

      if (this._businessType !== 3) {
        this.letterTemplate.ClientId=this.defalutSmeClientId;
        this.letterTemplate.ClientContractId=this.defalutSmeClientContractId;
        this.letterTemplate.CompanyId=this._companyId;
      }
      this.templateApi.upsertTemplate(this.letterTemplate).subscribe(res => {
        if (res.Error == null) {
          if (res.InsertedId > 0) {
            this.letterTemplate.Id = res.InsertedId;
          }
          //this.activeModal.close(true);
        }
        else {
          alert(res.Error.ErrorMessage);
          return;
        }

      }, err => {
          alert(JSON.stringify(err));

        });
    }


  }

  validateTemplate() {
    if (this.letterTemplate.Code == undefined || this.letterTemplate.Code.trim().length == 0) {
      return 'Please give a code to your template.';
    }

    if (this.letterTemplate.Name == undefined || this.letterTemplate.Name.trim().length == 0) {
      return 'Please give a name to your template.';
    }

    if (this.selectedCategory == undefined || this.selectedCategory == "") {
      return 'Please choose a category to which your template belongs to';
    }

    //do validations for other fields

  }


  filterCategories(implCompId, clientId, contractId) {
    this.filteredCategoryList = this.templateCategoryList.filter(function (el) {
      return (el.ImplementationCompanyId == 0 || el.ImplementationCompanyId == implCompId) &&
        (el.ClientId == 0 || el.ClientId == clientId) &&
        (el.ClientContractId == 0 || el.ClientContractId == contractId);
    });
    this.selectedCategory = null;
  }

  HideShow() {
    if(!this.flagDiv)
    {
      this.filterCategories(this.letterTemplate.ImplementationCompanyId, this.letterTemplate.ClientId, this.letterTemplate.ClientContractId);
    }
    this.flagDiv = !this.flagDiv;
  }

  fieldClick(tag) {
    this.getCaretPosition(document.getElementById("txtHeader"), tag);
    // this.insertAtCaret(tag);
  }

  getCaretPosition(editableDiv, textToInsert) {
    var caretPos = 0,
      sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode.parentNode == editableDiv.children[0] ||
          range.commonAncestorContainer.parentNode.parentNode == editableDiv.children[0].children[1]
          || range.commonAncestorContainer.parentNode.parentNode == editableDiv.children[0].children[1].children[0]
          || range.commonAncestorContainer.parentNode.parentNode.parentNode.parentNode == editableDiv.children[0] ||
          range.commonAncestorContainer.parentNode.parentNode.parentNode.parentNode == editableDiv.children[0].children[1]
          || range.commonAncestorContainer.parentNode.parentNode.parentNode.parentNode == editableDiv.children[0].children[1].children[0]) {
          caretPos = range.endOffset;

          if (editableDiv.id == "txtHeader") {
            this.headerValue = this.headerValue.replace('&nbsp;', ' ');

            this.headerValue = this.headerValue.replace(range.endContainer.textContent,
              range.endContainer.textContent.substring(0, caretPos)
              // + '<span contenteditable="false" style=" border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;" class="dynLtrFld">~~' + textToInsert + '~~</span>' 
              + '~~' + textToInsert + '~~'
              + range.endContainer.textContent.substring(caretPos, this.headerValue.length));

            // var front = (this.headerValue).substring(0, caretPos);
            // var back = (this.headerValue).substring(caretPos, this.headerValue.length);
            // this.headerValue = front + '~~' + textToInsert + '~~' + back;
          }
        }
      }
    }
    // else if (document.selection && document.selection.createRange) 
    // {
    //   range = document.selection.createRange();
    //   if (range.parentElement() == editableDiv) 
    //   {
    //     var tempEl = document.createElement("span");
    //     editableDiv.insertBefore(tempEl, editableDiv.firstChild);
    //     var tempRange = range.duplicate();
    //     tempRange.moveToElementText(tempEl);
    //     tempRange.setEndPoint("EndToEnd", range);
    //     caretPos = tempRange.text.length;
    //   }
    // }
    // alert(caretPos);
    // return caretPos;
  }

  insertAtCaret(text) {
    var eltxtarea = document.getElementById("txtHeader");
    if (!eltxtarea) {
      return;
    }

    var txtarea = <HTMLInputElement>eltxtarea;

    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    //alert(txtarea.selectionStart);
    var br = ((txtarea.selectionStart || txtarea.selectionStart == 0) ?
      "ff" : false);
    // "ff" : (document.selection ? "ie" : false));
    // if (br == "ie") {
    //   txtarea.focus();
    //   var range = document.selection.createRange();
    //   range.moveStart('character', -txtarea.value.length);
    //   strPos = range.text.length;
    // } else
    if (br == "ff") {
      strPos = txtarea.selectionStart;
    }

    var front = (this.headerValue).substring(0, strPos);
    var back = (this.headerValue).substring(strPos, this.headerValue.length);
    this.headerValue = front + text + back;
    strPos = strPos + text.length;
    // if (br == "ie") {
    //   txtarea.focus();
    //   var ieRange = document.selection.createRange();
    //   ieRange.moveStart('character', -txtarea.value.length);
    //   ieRange.moveStart('character', strPos);
    //   ieRange.moveEnd('character', 0);
    //   ieRange.select();
    // } 
    // else 
    if (br == "ff") {
      txtarea.selectionStart = strPos;
      txtarea.selectionEnd = strPos;
      txtarea.focus();
    }

    txtarea.scrollTop = scrollPos;
  }

  selectCategory(item) {
    this.selectedCategory = item.Code;
    this.flagDiv = false;

    if (item.Query != undefined && item.Query != null && item.Query != '') {
      if (item.Fields != undefined && item.Fields != null && item.Fields != '') {
        this.fields = [];
        this.fields = item.Fields;
      }
      else {
        alert('This category does not have any fields to configure in your template.');
      }
    }
    else {
      alert('This category is not bound to any data source.');
    }
  }

  onCompanyChange(implCompId) {
    //alert(implCompId);
    this.letterTemplate.ImplementationCompanyId = implCompId;
    this.clientApi.GetClientBaseCodesByImplementationCompany(implCompId).subscribe((data) => {
      this.clientCodeList = data;

    },
      //error => this.msg = <any>error
    );
    this.filterCategories(this.letterTemplate.ImplementationCompanyId, this.letterTemplate.ClientId, this.letterTemplate.ClientContractId);
  }

  onClientChange(clientId) {
    this.letterTemplate.ClientId = clientId;
    this.clientApi.GetClientContractBaseCodesByClientId(clientId).subscribe((data) => {
      this.contractCodeList = data;
    },
      //error => this.msg = <any>error
    );
    this.filterCategories(this.letterTemplate.ImplementationCompanyId, this.letterTemplate.ClientId, this.letterTemplate.ClientContractId);
  }

  onContractChange(contractId) {
    this.letterTemplate.ClientContractId = contractId;
    this.filterCategories(this.letterTemplate.ImplementationCompanyId, this.letterTemplate.ClientId, this.letterTemplate.ClientContractId);
  }

  onOFEChange(ofeId)
  {
    this.letterTemplate.OutputFileExtension = ofeId;
  }

  onTypechange(typeid){
    // console.log(event);
    // if(event != undefined){
    //   this.Typename = event.id
    // }
     console.log(typeid);
    this.letterTemplate.Type = typeid;
    this.Typename = typeid;

  }

}