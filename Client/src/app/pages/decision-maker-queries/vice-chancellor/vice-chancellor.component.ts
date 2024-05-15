import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { DataAccessService } from "src/app/services/data-access.service";

@Component({
  selector: "app-vice-chancellor",
  templateUrl: "./vice-chancellor.component.html",
  styleUrls: ["./vice-chancellor.component.scss"],
})
export class AppViceChancellorComponent {
  // GetPopularBooksByMonth
  year = new FormControl();
  value = new FormControl();
  fetchnum = new FormControl();
  timeframe: string = "";
  returnedData: any[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ["courseid", "coursename", "loans", "fines"];

  // TotalIncomeFromFinesByDate
  year1 = new FormControl();
  value1 = new FormControl();
  timeframe1: string = "";
  returnedData1: any[] = [];
  dataSource1 = new MatTableDataSource<any>();
  displayedColumns1: string[] = ["loancount", "finestotal"];

  constructor(private api: DataAccessService) {}

  // GetPopularBooksByMonth

  callMostActiveDepartmentByMonth() {
    if (this.isMostActiveDepartmentFormValid()) {
      this.api
        .getMostActiveDepartmentByMonth(this.year.value, this.timeframe, this.value.value, this.fetchnum.value)
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

  resetMostActiveDepartment() {
    this.year.reset();
    this.value.reset();
    this.fetchnum.reset();
    this.timeframe = "";
  }

  isMostActiveDepartmentFormValid(): boolean {
    // Check if all required fields have a value
    return this.year.valid && this.value.valid && this.fetchnum.valid && this.timeframe !== "";
  }

  // TotalIncomeFromFinesByDate

  callTotalIncomeFromFines() {
    if (this.isTotalIncomeFromFinesByDateFormValid()) {
      this.api
        .getTotalIncomeFromFinesByDate(this.year1.value, this.timeframe1, this.value1.value)
        .then((dataresponse: unknown) => {
          this.returnedData1 = dataresponse as any;
          this.dataSource1.data = [this.returnedData1];
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

  resetTotalIncomeFromFinesByDate() {
    this.year1.reset();
    this.value1.reset();
    this.timeframe1 = "";
  }

  isTotalIncomeFromFinesByDateFormValid(): boolean {
    // Check if all required fields have a value
    return this.year1.valid && this.value1.valid && this.timeframe1 !== "";
  }
}
