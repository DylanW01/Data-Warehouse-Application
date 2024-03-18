import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ServerService {
  constructor(private http: HttpClient) {}

  private async request(method: string, url: string, data?: any) {
    const result = this.http.request(method, url, {
      body: data,
      responseType: "json",
      observe: "body",
      headers: {
        //    Authorization: `Bearer ${token}`,
      },
    });
    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  // SQL Injection Demo
  createTodo() {
    return this.request("POST", "http://localhost:8080/todos");
  }

  getTodos() {
    return this.request("GET", `http://localhost:8080/todos`);
  }

  searchTodos(query: string) {
    return this.request("GET", `http://localhost:8080/todos-search/${query}`);
  }

  deleteTodo(query: number) {
    return this.request("DELETE", `http://localhost:8080/todos/${query}`);
  }

  // Cross-Site Scripting Demo
  createTodoXss() {
    return this.request("POST", "http://localhost:8080/xss-todos");
  }

  getTodosXss() {
    return this.request("GET", `http://localhost:8080/xss-todos`);
  }

  searchTodosXss(query: string) {
    return this.request("GET", `http://localhost:8080/xss-todos-search/${query}`);
  }

  deleteTodoXss(query: string) {
    return this.request("GET", `http://localhost:8080/xss-todos-search/${query}`);
  }

  // File upload Demo
  uploadFile(fileName: string, file: File) {
    let formData = new FormData();
    formData.append("file_name", fileName);
    formData.append("file_data", file);
    return this.request("POST", "http://localhost:8080/malicious-files", formData);
  }

  downloadFile(query: number) {
    return this.request("GET", `http://localhost:8080/malicious-files/${query}`);
  }

  deleteFile(id: number) {
    return this.request("GET", `http://localhost:8080/malicious-files/${id}`);
  }
}
