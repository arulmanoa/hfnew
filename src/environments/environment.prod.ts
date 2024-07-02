import { DynamicEnvironment } from './dynamic-environment';

export const firebase = {
  apiKey: "AIzaSyAzRucdc8OXUWzgLR-TZzBV-WMWNKHCV5E",
  authDomain: "zeel-75b7f.firebaseapp.com",
  projectId: "zeel-75b7f",
  storageBucket: "zeel-75b7f.appspot.com",
  messagingSenderId: "313703214237",
  appId: "1:313703214237:web:93fac6a28c78b8e1b77874",
  measurementId: "G-B7VVVQS4EM"


};


class Environment extends DynamicEnvironment {

  public production: boolean;
  public firebase :  {};
  constructor() {
    super();
    this.firebase = {
      apiKey: "AIzaSyAzRucdc8OXUWzgLR-TZzBV-WMWNKHCV5E",
      authDomain: "zeel-75b7f.firebaseapp.com",
      projectId: "zeel-75b7f",
      storageBucket: "zeel-75b7f.appspot.com",
      messagingSenderId: "313703214237",
      appId: "1:313703214237:web:93fac6a28c78b8e1b77874",
      measurementId: "G-B7VVVQS4EM"
 
    };
    this.production = true;
  }
}

export const environment = new Environment();
