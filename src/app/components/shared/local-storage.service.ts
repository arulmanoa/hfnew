import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  CandidateList: any[]=[];
  isEditing: boolean;

  constructor() { }

  setCanditateList(value:any[]=[]){
    debugger;
this.CandidateList=value
  }
  getCanditateList(){
    return this.CandidateList
  }
  setisEditing(value:boolean){
this.isEditing=value
  }
  getisEditing(){
    return this.isEditing
  }
}
