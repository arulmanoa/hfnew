import { Injectable } from '@angular/core';

@Injectable()
export class enumHelper {

    transform(value) : Object {

        return Object.keys(value).filter(e => !isNaN(+e)).map(o => { return {id: +o, name: value[o]}});
        
      }
}