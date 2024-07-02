import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { appSettings } from '../../_services/configs/app-settings.config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class TimesheetService {

    activeTabBehaviourSubject = new BehaviorSubject<string>('TimeEntires');
    activeTabAsObservable: Observable<string> = this.activeTabBehaviourSubject.asObservable();

    constructor(private http: HttpService) { }

    getProjectsForAnEmployee(employeeId, periodFrom, periodTo) {
        let req_params = `${employeeId}/${periodFrom}/${periodTo}`
        return this.http.get(appSettings.GET_PROJECTSFORANEMPLOYEE + req_params)
            .map(res => res)
            .catch(err => (err));
    }

    getActivitiesForAProject(projectId) {
        let req_params = `${projectId} `
        return this.http.get(appSettings.GET_ACTIVITIESFORAPROJECT + req_params)
            .map(res => res)
            .catch(err => (err));
    }

    getTimeSheetForAnEmployee(employeeId) {
        let req_params = `${employeeId} `
        return this.http.get(appSettings.GET_TIMESHEETSFORANEMPLOYEE + req_params)
            .map(res => res)
            .catch(err => (err));
    }

    getSavedTimeSheetForAnEmployee(employeeId) {
        let req_params = `${employeeId} `
        return this.http.get(appSettings.GET_SAVEDTIMESHEETSFORANEMPLOYEE + req_params)
            .map(res => res)
            .catch(err => (err));
    }

    getPendingTimeSheetForManager(managerId) {
        let req_params = `${managerId} `
        return this.http.get(appSettings.GET_PENDINGTIMESHEETSFORAMANAGER + req_params)
            .map(res => res)
            .catch(err => (err));
    }

    getTimeSheetInformation(timesheetHeaderId) {
        let req_params = `${timesheetHeaderId} `
        return this.http.get(appSettings.GET_TIMESHEETINFORMATION + req_params)
            .map(res => res)
            .catch(err => (err));
    }

    upsertTimeSheetHeader(data: any): any {
        return this.http.put(appSettings.PUT_UPSERTTIMESHEETHEADER, data)
            .map(res => res)
            .catch(err => (err));
    }

    putApproveRejectEmployeeTimeSheet(timesheetIds,status, managerId, managerRemarks){
        let params = `${timesheetIds}/${status}/${managerId}/${managerRemarks}`;
        return this.http.put(appSettings.PUT_APPROVEREJECTTIMESHEETS + params, '')
            .map(res => res)
            .catch(err => (err));
    }

    getPendingTimesheetsForEmployee(empId) {
        let params = `${empId}`;
        return this.http.get(appSettings.GET_PENDINGTIMESHEETSFORANEMPLOYEE + params)
            .map(res => res)
            .catch(err => (err));
    }

    getTimesheetConfigurationForAnEmployee(empId) {
        let params = `${empId}`;
        return this.http.get(appSettings.GET_TIMESHEETCONFIGURATIONFORANEMPLOYEE + params)
            .map(res => res)
            .catch(err => (err));
    }

    getDataForProjectHoursChart(headerId) {
        let params = `${headerId}`;
        return this.http.get(appSettings.GET_DATAFORPROJECTHOURSCHART + params)
            .map(res => res)
            .catch(err => (err));
    }

    getApprovedRejectedTimesheetForManager(managerId) {
        let params = `${managerId}`;
        return this.http.get(appSettings.GET_APPROVEDREJECTEDTIMESHEETSFORAMANAGER + params)
            .map(res => res)
            .catch(err => (err));
    }

    GetTimesheetReport(clientId, contractId, periodFrom,periodTo) {
        let params = `${clientId}/${contractId}/${periodFrom}/${periodTo}`;
        return this.http.get(appSettings.GET_TIMESHEETREPORT + params)
            .map(res => res)
            .catch(err => (err));
    }

    GetEmployeeWiseTimesheetReport(clientId, contractId, periodFrom,periodTo, employeeId) {
        let params = `${clientId}/${contractId}/${periodFrom}/${periodTo}/${employeeId}`;
        return this.http.get(appSettings.GET_EMPLOYEEWISETIMESHEETREPORT + params)
            .map(res => res)
            .catch(err => (err));
    }

    GetProjectWiseTimesheetReport(clientId, contractId, periodFrom,periodTo, projectId) {
        let params = `${clientId}/${contractId}/${periodFrom}/${periodTo}/${projectId}`;
        return this.http.get(appSettings.GET_PROJECTWISETIMESHEETREPORT + params)
            .map(res => res)
            .catch(err => (err));
    }

    put_UpsertProject(data) {
        return this.http.put(appSettings.PUT_UPSERTPROJECT, data)
            .map(res => res)
            .catch(err => (err));
    }

    put_UpsertProjectEmployeeMapping(data) {
        return this.http.put(appSettings.PUT_UPSERTEMPLOYEEPROJECTMAPPING, data)
            .map(res => res)
            .catch(err => (err));
    }

    put_UpsertProjectActivityMapping(data) {
        return this.http.put(appSettings.PUT_UPSERTPROJECTACTIVITYMAPPING, data)
            .map(res => res)
            .catch(err => (err));
    }

    get_ProjectsForAClient(clientId, contractId) {
        let params = `${clientId}/${contractId}`;
        return this.http.get(appSettings.GET_PROJECTSFORACLIENT + params)
            .map(res => res)
            .catch(err => (err));
    }

    get_EmployeeProjectMapping (clientId) {
        let params = `${clientId}`;
        return this.http.get(appSettings.GET_EMPLOYEEPROJECTMAPPING + params)
            .map(res => res)
            .catch(err => (err));
    }

    getActiveTab(tabName: string) {
        this.activeTabBehaviourSubject.next(tabName);
    }
}