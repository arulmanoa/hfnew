import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
import { AlertService } from './alert.service';

@Injectable()
export class NotificationMessagingService {
  currentMessage = new BehaviorSubject(null);
  count  = new BehaviorSubject(0);
  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private alertService: AlertService
  ) {
    // this.angularFireMessaging.messages.subscribe(
    //   (_messaging: AngularFireMessaging) => {
    //     // console.log( _messaging.messages );
    //     // console.log( 'mess', _messaging );
    //     // _messaging.onMessage = _messaging.onMessage.bind(_messaging);
    //     // _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);

    //   }
    // )
    // this.angularFireMessaging.messaging.subscribe(
    //   (messaging: any) => {

    //     messaging.onMessage((payload) => {
    //       console.log('Message received. ', payload);
    //       // ...
    //     });
        

    //     messaging.onMessageCallback = (payload: any) => {
    //       console.log('payload', payload);

    //       // this.alertCtrl.create({
    //       //   header: payload.notification.title,
    //       //   message: payload.notification.body,
    //       //   buttons: ['Entendido'],
    //       //   cssClass: 'confirmation-alert',
    //       //   backdropDismiss: false
    //       // }).then(alert => {
    //       //   alert.present().then();
    //       //   alert.onDidDismiss().then(async () => {
    //       //   // do something
    //       //   });
    //       // });
    //     };
    //     messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
    //   });
  }

  requestPermission(payload) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        payload.Token = token;
        console.log('payload', payload);

        if (payload.Token != null) {
          this.alertService.RegisterToken(JSON.stringify(payload)).subscribe((result) => {
            console.log('TOKEN REGISTRATION ::', result);

          });
        }

      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  receiveMessage() {

    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log("new message received. ", payload);
        this.count.next(1);      
      },
      (err) => {
        console.error('Unable to receive message.', err);
      });
  }
 
}