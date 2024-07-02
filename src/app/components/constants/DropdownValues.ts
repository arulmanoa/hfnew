import {
      Confidential, SelfAllocate, Category, MandateType, Client, LstContract,
      FunctionalArea, City, State, TargetIndustry,
      Gender, GenricCode, LstClientLocation, Country,
      MandateStatus, ReqStatus, NoticePeriod, InterviewType, InterviewLevel, RejectedByCategory, ServiceFeeType, EntityType, SharingType
} from '../Models/look-up-model';
import { MandateSchedule } from '../Models/MandateSchedule';

export const _NoticePeriod: NoticePeriod[] = [{ Id: 1, Name: 'Immediate Joiners' }, { Id: 2, Name: 'Less Than 7 days' },
{ Id: 3, Name: 'Less Than 15 days' }, { Id: 4, Name: '30 days' }, { Id: 5, Name: '60 days' }, { Id: 6, Name: 'More than 60 days' },
{ Id: 7, Name: 'None' }];

export const _Reqstatus: ReqStatus[] = [{ Id: 0, Name: 'Yet to Accept' }, { Id: 1, Name: 'Accepted' }, { Id: 2, Name: 'Rejected' }];

export const _confidential: Confidential[] = [{ Confidential: true, Name: 'Yes', Id: 1 }, { Confidential: false, Name: 'No', Id: 2 }];

export const _selfAllocate: SelfAllocate[] = [{ SelfAllocate: true, Name: 'Yes', Id: 1 }, { SelfAllocate: false, Name: 'No', Id: 2 }];

export const _category: Category[] = [{ CategoryId: 1, Name: 'Internal' }, { CategoryId: 2, Name: 'External' }];

export const _mandateType: MandateType[] = [{ Id: 1, Name: 'Temp Staffing' }, { Id: 2, Name: 'Selection ' }];


export const _client: Client[] = [{
      Id: 1, ClientCode: 'Clent 1', ClientName: 'Client Name 1', AliasName: 'Aliasname',
      ClientReferenceID: 1, Industry: 'Induatry', Status: 1, LastUpdateOn: '01/01/2019', LastUpdatedBy: 1,
      LstClientLocation: [{
            Id: 1, ClientId: 1, LocationCode: 'location 1', LocationName: 'Client Name',
            LocationSPOC_Name: 'LocationSPOC_Name',
            BillingAddress: 'BillingAddress', ShippingAddress: 'ShippingAddress',
            GST_Number: '1111', Status: 111, SPOC_Email: '111',
            SPOC_ContactNumber: 'SPOC_ContactNumber 1'
      },
      {
            Id: 2, ClientId: 2, LocationCode: 'location 2', LocationName: 'Client Name 1 ',
            LocationSPOC_Name: 'LocationSPOC_Name 2',
            BillingAddress: 'BillingAddress', ShippingAddress: 'ShippingAddress',
            GST_Number: '1111', Status: 111, SPOC_Email: '111',
            SPOC_ContactNumber: 'SPOC_ContactNumber'
      }],
      LstContract: []
}];

export const _clientContract: LstContract[] = [{
      Id: 1, ClientId: 1, Name: 'Client Contract 1', Code: 'Client Code',
      StartDate: '1995/01/15', EndDate: '01/12/2018'
},
{
      Id: 2, ClientId: 2, Name: 'Client Contract 2', Code: 'Client Code 2',
      StartDate: '01/01/2019', EndDate: '01/12/2018'
}];

export const _functionalArea: FunctionalArea[] = [
      { Id: 1, Name: ' FunctionalArea 1' },
      { Id: 2, Name: ' FunctionalArea 2' },
      { Id: 3, Name: ' FunctionalArea 3' }
];

export const _city: City[] = [
      { Id: 1, Name: 'Chennai', StateID: 1 },
      { Id: 2, Name: 'Erode', StateID: 1 },
      { Id: 3, Name: 'Salem', StateID: 1 },
      { Id: 4, Name: 'Trichy', StateID: 2 }
];

export const _state: State[] = [{ Id: 1, Name: 'Tamil Nadu', CountryId: 1, ListOfCity: _city },
{
      Id: 2, Name: 'Kerala', CountryId: 1, ListOfCity: [{ Id: 1, Name: 'Kochi', StateID: 2 },
      { Id: 2, Name: 'Thiruvananthapuram', StateID: 2 }]
}];

export const _targetIndustry: TargetIndustry[] = [{ Id: 1, Name: 'Retail' }, { Id: 2, Name: 'TargetIndustry' }];
export const _gender: Gender[] = [{ Id: 1, GenderPreference: 1, Name: 'Male' }, { Id: 2, GenderPreference: 2, Name: 'Female' },
{ Id: 3, GenderPreference: 3, Name: 'No Preference' }];

export const _Country: Country[] = [{ Id: 1, Name: 'India', CountryAbbr: '', ListOfState: _state }];
export const _GenricCode: GenricCode[] = [{ Id: 1, Code: 'UG', Name: 'UG', GenricCodeTypeId: 1 },
{ Id: 2, Code: 'PG', Name: 'PG', GenricCodeTypeId: 1 }];
export const _ClientContact: LstClientLocation[] = [];


export const _mandateDatasourceSchedule: MandateSchedule[] =
      [{
            Id: 1, MandateAssignmentDetailsID: 1, UserId: 1, StartDate: new Date(), EndDate: new Date(),
            WorkSession: 1, TargetNumber: 1, ActualTargetNumber: 0, Notes: '', Status: 0, LastUpdatedOn: new Date(), LastUpdatedBy: ''
      }];


export const _InterviewTypeList: InterviewType[] = [
      { Id: 1, Name: 'Telephonic' }, { Id: 2, Name: 'Face-to-Face ' }, { Id: 3, Name: 'Video Cal' }];


export const _InterviewLevelList: InterviewLevel[] = [
      { Id: 1, Name: 'Level 1' }, { Id: 2, Name: 'Level 2' }, { Id: 3, Name: 'Level 3' }, { Id: 4, Name: 'Level 4' },
      { Id: 5, Name: 'Level 5' }, { Id: 6, Name: 'Level 6' }];


export const _RejectedByCategoryList: RejectedByCategory[] = [
      { Id: 1, Name: 'Client' }, { Id: 2, Name: 'Candidate' }, { Id: 3, Name: 'Consultant' }];

export const _ServiceFeeTypeList: ServiceFeeType[] = [
      { Id: 1, Name: 'Fixed' }, { Id: 2, Name: 'Percentage' }];

export const _EntityTypeList: EntityType[] = [
      { Id: 1, Name: 'BusinessPartner' }, { Id: 2, Name: 'CIEL' }, { Id: 3, Name: 'CityBusinessPartner' }];

export const _SharingTypeList: SharingType[] = [
      { Id: 1, Name: 'FixedValue' }, { Id: 2, Name: 'Percentage' }];

