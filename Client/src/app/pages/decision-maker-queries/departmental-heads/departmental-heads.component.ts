import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { DataAccessService } from "src/app/services/data-access.service";

@Component({
  selector: "app-departmental-heads",
  templateUrl: "./departmental-heads.component.html",
  styleUrls: ["./departmental-heads.component.scss"],
})
export class AppDepartmentalHeadsComponent {
  // GetMostPopularBooksByPageCount
  year = new FormControl();
  value = new FormControl();
  fetchnum = new FormControl();
  pagecount = new FormControl();
  timeframe: string = "";
  operator: string = "";
  returnedData: any[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ["title", "author", "pages", "isbn", "loancount"];

  // GetMostActiveStudents
  year1 = new FormControl();
  courseid1 = new FormControl();
  fetchnum1 = new FormControl();
  value1 = new FormControl();
  timeframe1: string = "";
  returnedData1: any[] = [];
  dataSource1 = new MatTableDataSource<any>();
  displayedColumns1: string[] = ["firstname", "lastname", "loans", "fines"];

  constructor(private api: DataAccessService) {}

  // GetMostPopularBooksByPageCount

  callMostPopularBooksByPageCount() {
    if (this.isMostPopularBooksByPageCountFormValid()) {
      this.api
        .getMostPopularBooksByPageCount(this.year.value, this.timeframe, this.value.value, this.fetchnum.value, this.pagecount.value, this.operator)
        .then((response: unknown) => {
          this.returnedData = response as any[];
          this.dataSource.data = this.returnedData;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          console.log("An error occurred. Please try again later.");
          alert(error.error.message);
        });
    } else {
      alert("Please fill in all required fields.");
    }
  }

  resetMostPopularBooksByPageCount() {
    this.year.reset();
    this.value.reset();
    this.fetchnum.reset();
    this.pagecount.reset();
    this.timeframe = "";
    this.operator = "";
  }

  isMostPopularBooksByPageCountFormValid(): boolean {
    // Check if all required fields have a value
    return this.year.valid && this.value.valid && this.fetchnum.valid && this.pagecount.valid && this.operator !== "" && this.timeframe !== "";
  }

  // GetMostActiveStudents

  callGetMostActiveStudents() {
    if (this.isGetMostActiveStudentsFormValid()) {
      this.api
        .getMostActiveStudentsByMonth(this.courseid1.value, this.year1.value, this.timeframe1, this.value1.value, this.fetchnum1.value)
        .then((dataresponse: unknown) => {
          this.returnedData1 = dataresponse as any[];
          this.dataSource1.data = this.returnedData1;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          console.log("An error occurred. Please try again later.");
          alert(error.error.message);
        });
    } else {
      alert("Please fill in all required fields.");
    }
  }

  resetGetMostActiveStudents() {
    this.year1.reset();
    this.courseid1.reset();
    this.fetchnum1.reset();
    this.value1.reset();
    this.timeframe1 = "";
  }

  isGetMostActiveStudentsFormValid(): boolean {
    // Check if all required fields have a value
    return this.year1.valid && this.fetchnum1.valid && this.courseid1.valid && this.value1.valid && this.timeframe1 !== "";
  }
}
