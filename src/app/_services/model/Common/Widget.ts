
export class MultiButtonWidget {
    modalTitle: any;
    modalSubTitle: any;
    parentScreenName: any;
    parentScreenNavigator: any;
    modalDesciption : any;
    buttonWidgetList: ButtonWidgetList[];
}

export class ButtonWidgetList {
    buttonTitle: any;
    buttonSubTitle: any;
    pageNavigator: any;
    buttonDescription: any;
    icon : any;
    isRequired: boolean;
    isNavigationRequired : boolean;
    pageName : string;

}

export enum NoticeCategory
{
    Information = 1,
    Alert = 2,
    Celebration = 3,
    Cheers = 4,
    Reminder = 5,
    Task = 6
}