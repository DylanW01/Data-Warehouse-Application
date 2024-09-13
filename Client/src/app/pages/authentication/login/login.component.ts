import { Component } from "@angular/core";
import { DataAccessService } from "src/app/services/data-access.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
})
export class AppSideLoginComponent {
  username: string = "";
  password: string = "";
  loginError: string | null = null;
  loginSuccess: boolean = false;

  constructor(private api: DataAccessService) {}

  login() {
    const credentials = {
      username: this.username,
      password: this.password,
    };

    this.api
      .login(credentials)
      .then((response: unknown) => {
        // Handle successful response
        console.log("Login successful:", response);
        this.api.setCookie("session_token", (response as { token: string })["token"]);
        this.loginSuccess = true;
        this.loginError = null;
      })
      .catch((error: any) => {
        // Handle error
        console.error("Login error:", error);
        this.loginError = "Invalid credentials. Please try again.";
        this.loginSuccess = false;
      });
  }
}
