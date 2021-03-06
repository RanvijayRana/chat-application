import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from './../../socket.service';
import { AppService } from './../../app.service';

import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers: [SocketService]
})

export class ChatBoxComponent implements OnInit {

  @ViewChild('scrollMe', { read: ElementRef})

  public scrollMe: ElementRef;

  public authToken: any;
  public userInfo: any;
  public receiverId: any;
  public receiverName: any;
  public userList: any = [];
  public disconnectedSocket: boolean;

  public scrollToChatTop: boolean = false;
  public loadingPreviousChat: boolean = false;

  public previousChatList: any = [];
  public messageText: any;
  public messageList: any = [];//stores the current msg list displayed in chat-box
  public pageValue: number = 0;


  constructor(
    public AppService: AppService,
    public SocketService: SocketService,
    public router: Router,
    private toastr: ToastrService,
    vcr: ViewContainerRef
  ) {
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
  }

  ngOnInit() {

    this.authToken = Cookie.get('authtoken');
    this.userInfo = this.AppService.getUserInfoFromLocalStorage();
    
    this.receiverId = Cookie.get("receiverId");
    this.receiverName = Cookie.get('receiverName');

    console.log(this.receiverId,this.receiverName);
    if(this.receiverId != null && this.receiverId != undefined &&
       this.receiverId != ''){
        this.userSelectedToChat(this.receiverId,this.receiverName);  
       }

    this.checkStatus();

    this.verifyUserConfirmation();

    this.getOnlineUserList();

    this.getMessageFromAUser();
  }

  public checkStatus: any = () => {

    if (Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' 
        || Cookie.get('authtoken') === null) {
      this.toastr.warning("Invalid/missing Auth-token, try re-login");
      this.router.navigate(['/']);
      return false;

    } else {

      return true;

    }

  } // end checkStatus

  public verifyUserConfirmation: any = () => {

    this.SocketService.verifyUser()
      .subscribe((data) => {

        this.disconnectedSocket = false;

        this.SocketService.setUser(this.authToken);
        this.getOnlineUserList();

      },(error) =>{
        this.disconnectedSocket = true;
        this.toastr.error('error while verifying the user');
      });
    }
  
  public getOnlineUserList :any =()=>{

    this.SocketService.onlineUserList()
      .subscribe((userList) => {

        this.userList = [];

        for (let x in userList) {
          //console.log(x);
          //console.log(userList[x]);
          //  console.log("rana : @ : " + JSON.stringify(userList))

          let temp = { 'userId': x, 'name': userList[x], 'unread': 0, 'chatting': false }; 
          this.userList.push(temp);          

        }        
        //console.log(this.userList);
      },(error) => {
        this.toastr.error('unable to fetch latest user list');
      }); // end online-user-list
      
  }

  public sendMessageUsingKeypress: any = (event: any) => {
    if(event.keyCode === 13){
      this.sendMessage();
    }
  } // end of sendMessageUsingKeypress

  public sendMessage: any = () => {
    if(this.messageText){
      let chatMsgObject = {
        senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: Cookie.get('receiverName'),
        receiverId: Cookie.get('receiverId'),
        message: this.messageText,
        createdOn: new Date()
      }  
      console.log(chatMsgObject);
      this.SocketService.SendChatMessage(chatMsgObject);
      this.pushToChatWindow(chatMsgObject);
    }
    else{
      this.toastr.warning('text message can not be empty');
    }
  }

  public pushToChatWindow: any = (data) =>{
    this.messageText = "";
    this.messageList.push(data);
    this.scrollToChatTop = false;
  }

  public getMessageFromAUser: any =() => {
    this.SocketService.chatByUserId(this.userInfo.userId)
    .subscribe((data)=>{
      (this.receiverId==data.senderId)?this.messageList.push(data):'';
      this.toastr.success(`$(data.senderName) says: ${data.message}`);
      this.scrollToChatTop = false;
    });
  }

  public userSelectedToChat: any = (id, name) => {
    console.log("setting user as active");
    this.userList.map((user)=>{
      if(user.userId == id){
        user.chatting = true;
      }
      else{
        user.chatting = false;
      }
    });

    Cookie.set('receiverId', id);
    Cookie.set('receiverName',name);

    this.receiverName = name;
    this.receiverId = id;
    this.messageList = [];
    this.pageValue = 0;

    let chatDetails = {
      userId: this.userInfo.userId,
      senderId: id
    }

    this.SocketService.markChatAsSeen(chatDetails);
    this.getPreviousChatWithAUser();

  } // end of userSelectedToChat

  public getPreviousChatWithAUser : any = ()=>{
    let previousData = (this.messageList.length > 0 ? this.messageList.slice(): []);
    this.SocketService.getChat(this.userInfo.userId, this.receiverId, this.pageValue * 10)
    .subscribe((apiResponse) =>{
      console.log(apiResponse);
      if(apiResponse.status == 200){
        this.messageList = apiResponse.data.concat(previousData);
      }else{
        this.messageList = previousData;
        this.toastr.warning('No message available');
      }

      this.loadingPreviousChat = false;
    }, (err) =>{
      if(err.message = 'ERR_INTERNET_DISCONNECTED'){
        this.toastr.error('Internet not connected');
      }else{
        this.toastr.error('some error occured');
      }
    });
  } //end of getPreviousChatWithAUser

  public loadEarlierPageOfChat: any = () => {
    this.loadingPreviousChat = true;
    this.pageValue++;
    this.scrollToChatTop = true;
    this.getPreviousChatWithAUser();
  } //end of load previous chat

  public logout: any = () => {
    this.AppService.logout(this.userInfo.userId)
      .subscribe((apiResponse) => {

        if(apiResponse.status === 200){
          console.log("logout called");
          Cookie.delete('authtoken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          this.SocketService.exitSocket();
          this.router.navigate(['/']);
        }else{
          this.toastr.error(apiResponse.message);
        }
      }, (err) => {
        if(err.message = 'ERR_INTERNET_DISCONNECTED'){
          this.toastr.error('Internet not connected');
        }else{
          this.toastr.error('some error occured');
        }
      })
  }

  public showUserName = (name:string) =>{
    this.toastr.success("You are chatting with " + name);  
  }

}
  