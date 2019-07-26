import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { Cookie } from 'ng2-cookies/ng2-cookies'

import * as io from 'socket.io-client';

import { HttpClient, HttpHeaders} from '@angular/common/http';
import { HttpErrorResponse, HttpParams} from "@angular/common/http" 

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'https://chatapi.edwisor.com';
  private socket;

  constructor(public http: HttpClient) { 
    //connection is created
    this.socket = io(this.url);
  }
  
  //event to be listened
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      });//end socket
    });// end observable
  } // end verify user

  public onlineUserList = () => {
    return Observable.create((observer) => {
      this.socket.on('online-user-list', (userList) => {
        observer.next(userList);
      });//end socket
    });// end observable
  } // end online user list

  public disconnectedSocket = () => {
    return Observable.create((observer) => {
      this.socket.on("disconnect", () => {
        observer.next();
      });//end socket
    });// end observable
  } // end disconnect socket

  public setUser = (authToken) => {
    this.socket.emit("set-user",authToken);
  } // end set user

  public chatByUserId = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      });//end socket
    });// end observable  
  }

  public SendChatMessage = (chatMsgObject) => {
    this.socket.emit('chat-msg', chatMsgObject);
  }

  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if
 
    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }  // END handleError

  public markChatAsSeen = (userDetails) => {
    this.socket.emit('mark-chat-as-seen', userDetails);
  }

  public getChat(senderId, receiverId, skip): Observable<any>{
    return this.http.get(`${this.url}/api/v1/chat/get/for/user?authToken=${Cookie.get('authtoken')}&senderId=${senderId}&receiverId=${receiverId}&skip=${skip}`)
  }

  public exitSocket = () => {
    this.socket.disconnect();
  }

}
