import { Injectable } from '@angular/core';
import { HttpService } from '.';
import { appSettings } from '../model';
import { ReportQueueMessage } from '../model/CustomReport/ReportQueueMessage';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private http: HttpService,
  ) { }

  BulkInsertReportQueueMessage(reportQueueMessageList: ReportQueueMessage[]) {
    return this.http.post(appSettings.POST_BULKINSERTREPORTQUEUEMESSAGE, reportQueueMessageList)
  }

  PushReportMessagesToQueue(reportQueueMessageList: ReportQueueMessage[]) {
    return this.http.post(appSettings.POST_PUSHREPORTMESSAGESTOQUEUE, reportQueueMessageList)
  }
  GetDataForPayslipGeneration(clientId, clientContractId, payperiodId) { 
    let params = `${clientId}/${clientContractId}/${payperiodId}`;
    return this.http.get(appSettings.GET_PAYSLIPGENERATIONDATA + params)
      .map(res => res)
      .catch(err => (err));

  }

}
