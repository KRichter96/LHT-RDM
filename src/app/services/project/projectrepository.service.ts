import { Injectable } from '@angular/core';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectrepositoryService {

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
    
    /*let p: ProjectModel;
    const promise = new Promise((resolve, reject) => {
      fetch('../../../assets/data.json').then(res => res.json()).then(json => {
        resolve(p = json);
      });
    });

    promise.then((res) => {
        console.log('I get called:', res === p);
    });
    promise.catch((err) => {
      console.log('I get called:', err.message);
    });
    return promise;*/
  }

  public changeData() {

  }
}
