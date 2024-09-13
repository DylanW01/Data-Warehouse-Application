import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { DataAccessService } from "src/app/services/data-access.service";

@Component({
  selector: "app-chief-librarian",
  templateUrl: "./chief-librarian.component.html",
  styleUrls: ["./chief-librarian.component.scss"],
})
export class AppChiefLibrarianComponent {
  // GetPopularBooksByMonth
  courseId = new FormControl();
  year = new FormControl();
  value = new FormControl();
  fetchnum = new FormControl();
  timeframe: string = "";
  returnedData: any[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ["title", "author", "loans", "fines"];

  // Query2
  courseId1 = new FormControl();
  year1 = new FormControl();
  value1 = new FormControl();
  fetchnum1 = new FormControl();
  timeframe1: string = "";
  returnedData1: any[] = [];
  dataSource1 = new MatTableDataSource<any>();
  displayedColumns1: string[] = ["title", "author", "loans", "fines"];

  constructor(private api: DataAccessService) {}

  // GetPopularBooksByMonth

  callGetPopularBooksByMonth() {
    if (this.isGetPopularBooksByMonthFormValid()) {
      this.api
        .getPopularBooksByMonth(this.courseId.value, this.year.value, this.timeframe, this.value.value, this.fetchnum.value)
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

  resetGetPopularBooksByMonth() {
    this.courseId.reset();
    this.year.reset();
    this.value.reset();
    this.fetchnum.reset();
    this.timeframe = "";
  }

  isGetPopularBooksByMonthFormValid(): boolean {
    // Check if all required fields have a value
    return this.courseId.valid && this.year.valid && this.value.valid && this.fetchnum.valid && this.timeframe !== "";
  }

  // Query2

  callQuery2() {
    if (this.isGetPopularBooksByMonthFormValid()) {
      this.api
        .getPopularBooksByMonth(this.courseId.value, this.year.value, this.timeframe, this.value.value, this.fetchnum.value)
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

  resetQuery2() {
    this.courseId.reset();
    this.year.reset();
    this.value.reset();
    this.fetchnum.reset();
    this.timeframe = "";
  }

  isQuery2FormValid(): boolean {
    // Check if all required fields have a value
    return this.courseId.valid && this.year.valid && this.value.valid && this.fetchnum.valid && this.timeframe !== "";
  }
}
