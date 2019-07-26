import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { Cookie } from 'ng2-cookies/ng2-cookies'

import { HttpClient, HttpHeaders} from '@angular/common/http';
import { HttpErrorResponse, HttpParams} from "@angular/common/http"

@Injectable({
   providedIn: 'root'
})
export class AppService {

  private url = 'https://chatapi.edwisor.com';

  constructor(public http: HttpClient) { }

  public signupFunction(data): Observable<any>{
    const params = new HttpParams()
      .set('firstName',data.firstName)
      .set('lastName',data.lastName)
      .set('mobile',data.mobile)
      .set('email',data.email)
      .set('password',data.password)
      .set('apiKey',data.apiKey)

      return this.http.post(`https://chatapi.edwisor.com/api/v1/users/signup`,params);
  } // end of signUp

  public signinFunction(data): Observable<any>{
    const params = new HttpParams()
      .set('email',data.email)
      .set('password',data.password)

      return this.http.post(`https://chatapi.edwisor.com/api/v1/users/login`,params);
  } // end of login

  public logout(data): Observable<any>{
    const params = new HttpParams()
      .set('userId',data.userId)

      return this.http.post(`https://chatapi.edwisor.com/api/v1/users/logout?authToken=${Cookie.get('authtoken')}`,params);
  } // end of login

  private handleError(err: HttpErrorResponse){
    console.log(err.message);
    return Observable.throw(err.message);
  }

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage = (data) =>{
    localStorage.setItem('userInfo', JSON.stringify(data));

  } // end of set user info

}
