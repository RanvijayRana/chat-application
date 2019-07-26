import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';

import { HttpClientModule} from '@angular/common/http';

//router
import { RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { AppService } from './app.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserAnimationsModule, 
    BrowserModule,
    ChatModule,
    UserModule,
    RouterModule.forRoot([
      {path: 'login', component: LoginComponent, pathMatch: 'full'},
      {path: '', redirectTo: 'login', pathMatch: 'full'},
      {path: '*', component: LoginComponent,},
      {path: '**', component: LoginComponent,}
    ])
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
