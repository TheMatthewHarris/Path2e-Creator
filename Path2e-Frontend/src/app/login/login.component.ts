import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  public authenticated = false;
  public failed = false;
  public regUser = false;
  public regUserCheck = true;

  public loginForm = this.fb.group({
    email: "",
    password: ""
  });

  public regForm = this.fb.group({
    email: "",
    username: "",
    password: "",
    password2: ""
  });

  public get email(): any {
    return this.regForm.get('email')?.value;
  }
  
  public get username(): any {
    return this.regForm.get('username')?.value;
  }
  
  public get password(): any {
    return this.regForm.get('password')?.value;
  }
  
  public get password2(): any {
    return this.regForm.get('password2')?.value;
  }

  public get passLength(): any {
    const len = this.regForm.get('password')?.value?.length;
    if (len != null && len >= 8) return true; else return false;
  }

  ngOnInit() {
    this.auth.getSession()
    .pipe(catchError(err => {return of(null);}))
    .subscribe(x => 
      {
        if (x != null) {
          this.auth.setCurrentUser(x);
          this.authenticated = true;
        }
      }
    );
  }

  login() {
    if (!this.loginDisable()) {

      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      // Hash algorithm to avoid storing plaintext passwords
      this.auth.logUser({email: email, password: password})
        .pipe(catchError(err => {this.failed = true; return of(null);}))
        .subscribe(x => 
          {
            if (x != null) {
              this.auth.setCurrentUser(x);
              this.authenticated = true;
            }
          });
    }
  }

  register() {

    const reg = {
      email: this.email, 
      username: this.username, 
      password: this.password
    };

    this.auth.register(reg).subscribe(x => {
      if (x) {
        this.auth.logUser({email: this.email, password: this.password})
        .pipe(catchError(err => {this.failed = true; return of(null);}))
        .subscribe(y => 
          {
            if (y != null) {
              this.auth.setCurrentUser(y);
              this.authenticated = true;
            }
          });
      }
    });
  }

  logout() {
    this.loginForm.setValue({email: "", password: ""});
    this.auth.setCurrentUser({email: "", username: ""});
    this.auth.logout().subscribe();
    this.authenticated = false;
  }

  //loginDisable(): disable the submit button if either the email
  //                or password has not been entered
  loginDisable() {
    return (this.loginForm.get('email')?.value == "") 
      ||(this.loginForm.get('password')?.value == "");
  }

  emailCheck(name: string) {
    return name.match("^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$") != null;
  }
  
  usernameCheck(name: string) {
    return name.match("^[\\w]+$") != null;
  }

  passwordCheck(p1: string, p2: string) {
    return (p1 == p2);
  }

  regDisable() {
    
    return !this.emailCheck(this.email) 
    || !this.usernameCheck(this.username)
    || !this.passwordCheck(this.password, this.password2)
    || !this.passLength;
  }
}
