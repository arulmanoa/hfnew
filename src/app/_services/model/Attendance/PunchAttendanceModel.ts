
export class PunchAttendanceModel{
    EmployeeId : number;
    Coordinates : GeoCoordinates;
    PhotoId : number;
    Remarks : string;
}


export class GeoCoordinates{
    Latitude : number;
    Longitude : number;
    Altitude : number;

}