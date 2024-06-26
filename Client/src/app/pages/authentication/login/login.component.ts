import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
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

  constructor(private api: DataAccessService, private router: Router, private titleService: Title, private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      const pageTitle = data["title"] || "Dashboard"; // Default title if no data provided
      this.titleService.setTitle(`${pageTitle} | Data Warehouse App`);
    });
  }

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
        this.api.setCookieToken((response as { token: string })["token"]);
        this.loginSuccess = true;
        this.loginError = null;
        this.router.navigate(["/dashboard"]);
      })
      .catch((error: any) => {
        // Handle error
        console.error("Login error:", error);
        this.loginError = "Invalid credentials. Please try again.";
        this.loginSuccess = false;
      });
  }
}
