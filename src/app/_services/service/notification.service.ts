import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  
  constructor(private http: HttpService) { }

  PushNotificationMessagesToQueue(notificationIds){
    return this.http.post(appSettings.POST_PUSHNOTIFICATIONMESSAGESTOQUEUE, notificationIds)
            .map(res => res)
            .catch(err => (err));
  }

}
