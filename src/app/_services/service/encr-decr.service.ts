import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
// import { Vector } from 'html2canvas/dist/types/render/vector';
import { LoginResponses } from '../model';

@Injectable({
  providedIn: 'root'
})

export class EncrDecrService {
  constructor() { }
 
  //The set method is use for encrypt the value.
  set(keys, value){
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
    {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  //The get method is use for decrypt the value.
  get(keys, value){
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var decrypted = CryptoJS.AES.decrypt(value, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encrypt(dataToEncrypt : any , key : string){
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(dataToEncrypt), key);

    return ciphertext;

  }

  decrypt(ciphertext : any , key : string ){
    let decryptedData  = CryptoJS.AES.decrypt( ciphertext ,  key);
    return decryptedData;
  }

  EncryptWithAES(sessionDetails : LoginResponses, strToEncrypt : string){
    
    const key = CryptoJS.enc.Utf8.parse(sessionDetails.Key);
    const vector = CryptoJS.enc.Utf8.parse(sessionDetails.Vector);

    var encrypted;

    try{
      encrypted = CryptoJS.AES.encrypt(strToEncrypt, key, {
        keySize: 128,
        iv: vector,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    }
    catch(ex){
      encrypted = null;
    }

    let encryptedString : string = encrypted.toString();

    let reForPlus = /\+/g;
    let reForSlash = /\//g;
    let charReplacedEncryptedString : string = encryptedString.replace(reForPlus, "*").replace(reForSlash,"-");

    // console.log("Encrypt -> Decrypt result ::" , this.DecryptWithAES(sessionDetails , encrypted.toString()));

    return charReplacedEncryptedString;

  }


  DecryptWithAES(sessionDetails : LoginResponses, strToDecrypt : string){

    let reForPlus = /\*/g;
    let reForSlash = /\-/g;
    let charReplacedStringToDecrypt : string = strToDecrypt.replace(reForPlus, "+").replace(reForSlash,"/");
    // let charReplacedStringToDecrypt : string = strToDecrypt;
    // console.log("str to decrypt ::", charReplacedStringToDecrypt);

    const key = CryptoJS.enc.Utf8.parse(sessionDetails.Key);
    const vector = CryptoJS.enc.Utf8.parse(sessionDetails.Vector);

    var decrypted;



    try{
      decrypted = CryptoJS.AES.decrypt(charReplacedStringToDecrypt, key, {
        keySize: 128 / 8,
        iv: vector,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    }
    catch(ex){
      decrypted = null;
      console.log(ex);
    }
    
    // console.log("Decrypted ::" , decrypted);

    // console.log("Decrypted ::" ,decrypted , decrypted.toString(CryptoJS.enc.Utf8));

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

  }

  toJson(item) {
    item = typeof item !== 'string'
      ? JSON.stringify(item)
      : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === 'object' && item !== null) {
      return true;
    }

    return false;
  }
}