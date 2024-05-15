import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataAccessService {
  constructor(private http: HttpClient) {}

  private async request(method: string, url: string, data?: any) {
    const token = this.getUserTokenFromCookie();
    const result = this.http.request(method, url, {
      body: data,
      responseType: "json",
      observe: "body",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  login(credentials: any) {
    return this.request("POST", `${environment.serverUrl}/login`, credentials);
  }

  // Authentication with JWT token

  getUserTokenFromCookie() {
    const cookie = document.cookie.split("; ").find((row) => row.startsWith("session_token"));
    if (!cookie) {
      return null;
    }
    return decodeURIComponent(cookie.split("=")[1]);
  }

  // Decode JWT token payload without using a library
  parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  setCookieToken(value: string) {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds
    const cookieValue = encodeURIComponent(value) + `; expires=${expirationDate.toUTCString()}; Secure`;
    document.cookie = `session_token=${cookieValue}; path=/`;
  }

  deleteSessionTokenCookie() {
    const expirationDate = new Date(0); // Set to a past date (Jan 1, 1970)
    const cookieValue = `; expires=${expirationDate.toUTCString()}; Secure`;
    document.cookie = `session_token=${cookieValue}; path=/`;
  }
}
