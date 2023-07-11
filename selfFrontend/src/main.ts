import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../environments/environment';

import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./firebase-messaging-sw.js')
        .then((registration) => {
        })
        .catch((err) => {
          console.log('Service Worker registration failed: ', err);
        });
    }
  })
  .catch((err) => console.error(err));
