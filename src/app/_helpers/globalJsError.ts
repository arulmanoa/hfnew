import { Router } from "@angular/router";
import { ErrorHandler, Injectable, Injector } from "@angular/core";
@Injectable()
export class GlobalJsErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) { }
  handleError(error) {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (chunkFailedMessage.test(error.message)) {
      if (confirm("New version available. Load New Version?")) {
        window.location.reload();
      }
    }
    const router = this.injector.get(Router);
    console.error(error.stack.toString());
  }
}
