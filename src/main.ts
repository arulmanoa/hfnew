import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();  
}

// TO CHECK CONSOLE LOG WOULD BE ENABLED OR NOT
// fetch('assets/json/config.json').then(response => {  
//   return response.json()
// })
// .then(data => {  
   
// })

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
