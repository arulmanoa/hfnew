export interface NavItem {
    id: number;
    text: string;
    url?: string;
    icon:string;
    subMenu?: NavItem[];
    displayOrder : number;
  }