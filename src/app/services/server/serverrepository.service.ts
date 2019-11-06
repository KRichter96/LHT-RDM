import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerRepositoryService {

  constructor(private http: HttpClient) { }

  public getData() {
    
    return this.http.get('../../../assets/data.json').toPromise().then(
      response => {
				if (response != false) {
					return response;
        } 
        else {
					return null;
				}
			},
			error => {
				return null;
			});
  }

  public setData() {

  }
}
