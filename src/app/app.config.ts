import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Injectable } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { SessionDetails } from './components/Models/SessionDetails';

export const TREE_DATA = JSON.stringify({
  Applications: {
    Calendar: 'app',
    Chrome: 'app',
    Webstorm: 'app'
  },
  Documents: {
    angular: {
      src: {
        compiler: 'ts',
        core: 'ts'
      }
    },
    material2: {
      src: {
        button: 'ts',
        checkbox: 'ts',
        input: 'ts'
      }
    }
  },
  Downloads: {
    October: 'pdf',
    November: 'pdf',
    Tutorial: 'html'
  },
  Pictures: {
    'Photo Booth Library': {
      Contents: 'dir',
      Pictures: 'dir'
    },
    Sun: 'png',
    Woods: 'jpg'
  }
});
export class FileNode {
  children: FileNode[];
  filename: string;
  type: any;
}
@Injectable()
export class FileDatabase {
  dataChange = new BehaviorSubject<FileNode[]>([]);
  get data(): FileNode[] { return this.dataChange.value; }
  constructor() {
    this.initialize();
  }
  initialize() {
    // Parse the string to json object.
    const dataObject = JSON.parse(TREE_DATA);
    // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
    //     file node as children.
    const data = this.buildFileTree(dataObject, 0);
    // Notify the change.
    this.dataChange.next(data);
  }
  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `FileNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): FileNode[] {
    return Object.keys(obj).reduce<FileNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new FileNode();
      node.filename = key;
      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.type = value;
        }
      }
      return accumulator.concat(node);
    }, []);
  }
}



export const MintLeftNavConfig = {
  skin: 'blue',
  // isSidebarLeftCollapsed: false,
  // isSidebarLeftExpandOnOver: false,.
  // isSidebarLeftMouseOver: false,
  // isSidebarLeftMini: true,
  // sidebarRightSkin: 'dark',
  // isSidebarRightCollapsed: true,
  // isSidebarRightOverContent: true,
  // layout: 'normal',
  sidebarLeftMenu: [
    { label: 'MAIN NAVIGATION', separator: true },
    // { label: 'Get Started', route: '/', iconClasses: 'fa fa-road',
    // pullRights: [{ text: 'New', classes: 'label pull-right bg-green' }] },
    {
      label: 'Layout', iconClasses: 'fa fa-th-list', children: [
        { label: 'Configuration', route: 'layout/configuration' },
        { label: 'Custom', route: 'layout/custom' },
        { label: 'Header', route: 'layout/header' },
        { label: 'Sidebar Left', route: 'layout/sidebar-left' },
        { label: 'Sidebar Right', route: 'layout/sidebar-right' },
        { label: 'Content', route: 'layout/content' }
      ]
    },
    { label: 'COMPONENTS', separator: true },
    { label: 'Accordion', route: 'accordion', iconClasses: 'fa fa-tasks' },
    { label: 'Alert', route: 'alert', iconClasses: 'fa fa-exclamation-triangle' },
    {
      label: 'Boxs', iconClasses: 'fa fa-files-o', children: [
        { label: 'Default Box', route: 'boxs/box' },
        { label: 'Info Box', route: 'boxs/info-box' },
        { label: 'Small Box', route: 'boxs/small-box' }
      ]
    },
    { label: 'Dropdown', route: 'dropdown', iconClasses: 'fa fa-arrows-v' },
    {
      label: 'Form', iconClasses: 'fa fa-files-o', children: [
        { label: 'Input Text', route: 'form/input-text' }
      ]
    },
    { label: 'Tabs', route: 'tabs', iconClasses: 'fa fa-th' }
  ]
};

export const CountryCofig = 'India';

class GlobalConfiguration {
  ErrorTypeValue: string;
  ErrorMessage: string;
}
export const GlobalConfigurationValues: GlobalConfiguration = {
  ErrorTypeValue: 'ConnectionIssue',
  ErrorMessage: 'Please check your internet connection'
};

export const SessionKeys: SessionDetails = {
  userName: 'userName',
  grant_type: 'grant_type',
  LstClient: 'LstClient',
  LstCountry: 'LstCountrySession',
  LstFunctionalAreas: 'LstFunctionalAreasSession',
  LstGenericCode: 'LstGenericCodeSession',
  LstMandateStatus: 'LstMandateStatusSession',
  LstMandateTypes: 'LstMandateTypesSession',
  LstQualification: 'LstQualificationSession',
  LstTargetIndustries: 'LstTargetIndustriesSession',
  LstMandateStage: 'LstMandateStage',
  LocalSessionDetails: 'LocalSessionDetails',
  AccessToken: 'AccessToken',
  TokenType: 'TokenType',
  TokenExpiresIn: 'TokenExpiresIn',
  LstUser: 'LstUser',
  MandatesDetials: 'MandatesDetials',
  Api_endpoints: 'api_endpoints',
  GridLayoutEnable: 'GridLayoutEnable',
  LstCityBusinessPartners: 'LstCityBusinessPartners',
  LstBusinessPartners: 'LstBusinessPartners',
  LstBranch: 'LstBranch'
};


