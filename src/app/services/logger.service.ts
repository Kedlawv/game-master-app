import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'; // Import the environment configuration

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(message: string, ...optionalParams: any[]): void {
    if (environment.enableLogging) {
      console.log(message, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: any[]): void {
    if (environment.enableLogging) {
      console.warn(message, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: any[]): void {
    if (environment.enableLogging) {
      console.error(message, ...optionalParams);
    }
  }
}
