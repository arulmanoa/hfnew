// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { DynamicEnvironment } from './dynamic-environment';

export const firebase ={
  apiKey: "AIzaSyAzRucdc8OXUWzgLR-TZzBV-WMWNKHCV5E",
  authDomain: "zeel-75b7f.firebaseapp.com",
  projectId: "zeel-75b7f",
  storageBucket: "zeel-75b7f.appspot.com",
  messagingSenderId: "313703214237",
  appId: "1:313703214237:web:93fac6a28c78b8e1b77874",
  measurementId: "G-B7VVVQS4EM",
  vapidKey : "BDQcZ7-ELCC6JioG0w4o8ZO-1rroTL7dnY0Sbe57TrjNIv0X3LDAy9q1jVRWwyNLFKad5Uy4ghjWCb9VD9ND-GI"

};


class Environment extends DynamicEnvironment {

  public production: boolean;
  public firebase: {};

  constructor() {
    super();
    this.firebase = {
      apiKey: "AIzaSyAzRucdc8OXUWzgLR-TZzBV-WMWNKHCV5E",
      authDomain: "zeel-75b7f.firebaseapp.com",
      projectId: "zeel-75b7f",
      storageBucket: "zeel-75b7f.appspot.com",
      messagingSenderId: "313703214237",
      appId: "1:313703214237:web:93fac6a28c78b8e1b77874",
      measurementId: "G-B7VVVQS4EM",
      vapidKey : "BDQcZ7-ELCC6JioG0w4o8ZO-1rroTL7dnY0Sbe57TrjNIv0X3LDAy9q1jVRWwyNLFKad5Uy4ghjWCb9VD9ND-GI"
    };
    this.production = false;
  }
}

export const environment = new Environment();
// export const environment = {
//   production: false,
//   apiURL: SECURITY_URL_JSON.API_BASE_URL,
//   securityURL: SECURITY_URL_JSON.SECURITY_BASE_URL,
//   objectURL: SECURITY_URL_JSON.OBJECTSTORAGE_BASE_URL,


// };


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
