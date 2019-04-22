import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonProvider } from '../../providers/common/common';

/*
  Generated class for the CommunicationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommunicationProvider {

  constructor(
    public http: HttpClient,
    private myProvider: CommonProvider
  ) {
    console.log('Hello CommunicationProvider Provider');
  }

}
