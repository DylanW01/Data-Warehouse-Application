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

  // API calls

  login(credentials: any) {
    return this.request("POST", `${environment.serverUrl}/login`, credentials);
  }

  // Vice Chancellor API calls

  getMostActiveDepartmentByMonth(year: number, timeframe: string, value: number, fetchnum: number) {
    return this.request("GET", `${environment.serverUrl}/MostActiveDepartmentByMonth/${year}/${timeframe}/${value}/${fetchnum}`);
  }

  getTotalIncomeFromFinesByDate(year: number, timeframe: string, value: number) {
    return this.request("GET", `${environment.serverUrl}/TotalIncomeFromFinesByDate/${year}/${timeframe}/${value}`);
  }

  // Finance Director API calls

  getFineSumByDate(year: number, timeframe: string, value: number) {
    return this.request("GET", `${environment.serverUrl}/FineSumByDate/${year}/${timeframe}/${value}`);
  }

  getLateFineSumByDate(year: number, timeframe: string, value: number) {
    return this.request("GET", `${environment.serverUrl}/LateFineSumByDate/${year}/${timeframe}/${value}`);
  }

  // Chief Librarian API calls

  getPopularBooksByMonth(courseId: number, year: number, timeframe: string, value: number, fetchnum: number) {
    return this.request("GET", `${environment.serverUrl}/PopularBooksByMonth/${courseId}/${year}/${timeframe}/${value}/${fetchnum}`);
  }

  // Department Head API calls

  getMostPopularBooksByPageCount(year: number, timeframe: string, value: number, fetchnum: number, pageCount: number, operator: string) {
    return this.request("GET", `${environment.serverUrl}/MostPopularBooksByPageCount/${year}/${timeframe}/${value}/${fetchnum}/${pageCount}/${operator}`);
  }

  getMostActiveStudentsByMonth(courseId: number, year: number, timeframe: string, value: number, fetchnum: number) {
    return this.request("GET", `${environment.serverUrl}/MostActiveStudentsByMonth/${courseId}/${year}/${timeframe}/${value}/${fetchnum}`);
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
