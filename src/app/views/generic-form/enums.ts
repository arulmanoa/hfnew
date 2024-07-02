export enum FormInputControlType 
{
    TextBox = 0,
    DropDown = 1,
    MultiSelectDropDown = 2,
    AutoFillTextBox = 3,
    TextArea = 4,
    RadioButtons = 5,
    CheckBox = 6,
    CommaSeparatedNumbers = 7,
    CommaSeparatedStrings = 8,
    DatePicker = 9
}


export enum GroupType{
    SimpleWithLabel = 0,
    SimpleWithoutLabel = 1,
    Accordian = 2,
    HighlightedBorder = 3 ,
    
}

export enum ElementType{
    ControlElement = 0,
    GroupElement = 1
}

export enum RelationWithParent{
    OnetoOne = 0,
    OnetoMany = 1,
    None = 2
}

export enum DataType {
    String = 0,
    Number = 1,
    Boolean = 2
}