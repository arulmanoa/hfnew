import { ListMandates, ListOfMandatesDataSet } from '../Models/ListMandates';
import { LeftNavigationMenu } from '../Models/LeftNavigationMenu';




export const LeftNavigationMenuValues: LeftNavigationMenu[] = [
//   {
//   id: '1',
//   text: 'Dashboard',
//   expanded: false,
//   IconValue: 'fa-home',
//   IconName: 'Dashboard1',
//   IconId: 1,
//   RouterLink: 'home/Dashboard',
//   MenuId: '1',
//   MenuName: 'Dashboard',
//   items: []
// },
// {
//   id: '2',
//   text: 'Client',
//   expanded: false,
//   IconValue: 'fa-users',
//   IconName: 'Client',
//   IconId: 1,
//   RouterLink: 'home/Dashboard',
//   MenuId: '2',
//   MenuName: 'Client',
//   items: []
// },

 {
  id: '3',
  text: 'Mandates',
  expanded: false,
  IconValue: 'fas fa-briefcase',
  IconName: 'Mandates',
  IconId: 1,
  RouterLink: '',
  MenuId: '3',
  MenuName: 'Mandates',
  items: [{
    id: '3_1',
    text: 'Open Mandates',
    expanded: false,
    IconValue: 'fa fa-folder-open ',
    IconName: 'Open Mandates',
    IconId: 2,
    RouterLink: 'home/Dashboard',
    MenuId: '2',
    MenuName: 'Open Mandates',
     items: [
       //{
    //   id: '3_1_1',
    // text: 'Open Mandates',
    // expanded: false,
    // IconValue: ' fa-adjust ',
    // IconName: 'Open',
    // IconId: 1,
    // RouterLink: 'home/Dashboard',
    // MenuId: '1',
    // MenuName: 'Open',
    // items: []
    // }
  ]
  }
  // ,
  // {
  //   id: '3_2',
  //   text: 'Closed Mandates',
  //   expanded: false,
  //   IconValue: ' fa-adjust ',
  //   IconName: 'Closed_Mandates',
  //   IconId: 1,
  //   RouterLink: 'home/Dashboard',
  //   MenuId: '1',
  //   MenuName: 'Closed Mandates',
  //   items: []
  // }
]
} 
,
{
  id: '4',
  text: 'Candidates',
  expanded: false,
  IconValue: 'fas fa-user-friends ',
  IconName: 'Candidates',
  IconId: 4,
  RouterLink: '/home/CandidateList',
  MenuId: '4',
  MenuName: 'Candidates',
  items: []
}
];


/**
export const LeftNavigationMenuValues: LeftNavigationMenu[] = [{
  id: '1',
  text: 'Stores',
  expanded: false,
  IconValue: 'fa-users',
  IconName: 'Mandates ',
  IconId: 1,
  RouterLink: 'Mandates',
  MenuId: '1',
  MenuName: 'Mandates 1',
  items: [{
    id: '1_1',
    text: 'Super Mart of the West',
    expanded: false,
    IconValue: 'fa-check',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 1.1',
    items: [{
      id: '1_1_1',
      text: 'Super Mart of the West',
      expanded: false,
      IconValue: 'fa-users',
      IconName: 'Mandates ',
      IconId: 1,
      RouterLink: 'Mandates',
      MenuId: '1',
      MenuName: 'Mandates 1.1.',
    }]
  }, {
    id: '1_2',
    text: 'Super Mart of the',
    expanded: false,
    IconValue: 'fa-check',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 1.2',
  }]
},
{
  id: '2',
  text: 'Stores',
  expanded: false,
  IconValue: 'fa-check',
  IconName: 'Mandates ',
  IconId: 1,
  RouterLink: 'Mandates',
  MenuId: '1',
  MenuName: 'Mandates 2',
  items: [{
    id: '2_1',
    text: 'Super Mart of the West',
    expanded: false,
    IconValue: 'fa-users',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 2.1',
  }, {
    id: '2_2',
    text: 'Super Mart of the',
    expanded: false,
    IconValue: 'fa-users',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 2.2',
  }]
}];


export const LeftNavigationMenuValues: LeftNavigationMenu[] = [{
  id: '1',
  text: 'Stores',
  expanded: false,
  IconValue: 'fa-users',
  IconName: 'Mandates ',
  IconId: 1,
  RouterLink: 'Mandates',
  MenuId: '1',
  MenuName: 'Mandates 1',
  items: [{
    id: '1_1',
    text: 'Super Mart of the West',
    expanded: false,
    IconValue: 'fa-check',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 1.1',
    items: [{
      id: '1_1_1',
      text: 'Super Mart of the West',
      expanded: false,
      IconValue: 'fa-users',
      IconName: 'Mandates ',
      IconId: 1,
      RouterLink: 'Mandates',
      MenuId: '1',
      MenuName: 'Mandates 1.1.',
    }]
  }, {
    id: '1_2',
    text: 'Super Mart of the',
    expanded: false,
    IconValue: 'fa-check',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 1.2',
  }]
},
{
  id: '2',
  text: 'Stores',
  expanded: false,
  IconValue: 'fa-check',
  IconName: 'Mandates ',
  IconId: 1,
  RouterLink: 'Mandates',
  MenuId: '1',
  MenuName: 'Mandates 2',
  items: [{
    id: '2_1',
    text: 'Super Mart of the West',
    expanded: false,
    IconValue: 'fa-users',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 2.1',
  }, {
    id: '2_2',
    text: 'Super Mart of the',
    expanded: false,
    IconValue: 'fa-users',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 2.2',
  }]
}];

export const LeftNavigationMenuValues: LeftNavigationMenu[] = [{
  id: '1',
  text: 'Stores',
  expanded: false,
  IconValue: 'fa-users',
  IconName: 'Mandates ',
  IconId: 1,
  RouterLink: 'Mandates',
  MenuId: '1',
  MenuName: 'Mandates 1',
  items: [{
    id: '1_1',
    text: 'Super Mart of the West',
    expanded: false,
    IconValue: 'fa-check',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 1.1',
    items: [{
      id: '1_1_1',
      text: 'Super Mart of the West',
      expanded: false,
      IconValue: 'fa-users',
      IconName: 'Mandates ',
      IconId: 1,
      RouterLink: 'Mandates',
      MenuId: '1',
      MenuName: 'Mandates 1.1.',
    }]
  }, {
    id: '1_2',
    text: 'Super Mart of the',
    expanded: false,
    IconValue: 'fa-check',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 1.2',
  }]
},
{
  id: '2',
  text: 'Stores',
  expanded: false,
  IconValue: 'fa-check',
  IconName: 'Mandates ',
  IconId: 1,
  RouterLink: 'Mandates',
  MenuId: '1',
  MenuName: 'Mandates 2',
  items: [{
    id: '2_1',
    text: 'Super Mart of the West',
    expanded: false,
    IconValue: 'fa-users',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 2.1',
  }, {
    id: '2_2',
    text: 'Super Mart of the',
    expanded: false,
    IconValue: 'fa-users',
    IconName: 'Mandates ',
    IconId: 1,
    RouterLink: 'Mandates',
    MenuId: '1',
    MenuName: 'Mandates 2.2',
  }]
}];
 */
