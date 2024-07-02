import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class EventEmiterService {

  dataStr = new EventEmitter();

  constructor() { }

  sendEnabled(data: boolean) {
    this.dataStr.emit(data);
  }
}