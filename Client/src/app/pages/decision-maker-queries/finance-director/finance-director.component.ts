import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { DataAccessService } from "src/app/services/data-access.service";

@Component({
  selector: "app-finance-director",
  templateUrl: "./finance-director.component.html",
  styleUrls: ["./finance-director.component.scss"],
})
export class AppFinanceDirectorComponent {
  // GetFineSumByDate
  year = new FormControl();
  value = new FormControl();
  timeframe: string = "";
  returnedData: any[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ["total"];

  // GetLateFineSumByDate
  year1 = new FormControl();
  value1 = new FormControl();
  timeframe1: string = "";
  returnedData1: any[] = [];
  dataSource1 = new MatTableDataSource<any>();
  displayedColumns1: string[] = ["total"];

  constructor(private api: DataAccessService) {}

  // GetFineSumByDate

  callGetFineSumByDate() {
    if (this.isGetFineSumByDateFormValid()) {
      this.api
        .getFineSumByDate(this.year.value, this.timeframe, this.value.value)
        .then((response: unknown) => {
          this.returnedData = response as any;
          this.dataSource.data = [this.returnedData];
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

  resetGetFineSumByDate() {
    this.year.reset();
    this.value.reset();
    this.timeframe = "";
  }

  isGetFineSumByDateFormValid(): boolean {
    // Check if all required fields have a value
    return this.year.valid && this.value.valid && this.timeframe !== "";
  }

  // GetLateFineSumByDate

  callGetLateFineSumByDate() {
    if (this.isGetLateFineSumByDateFormValid()) {
      this.api
        .getLateFineSumByDate(this.year1.value, this.timeframe1, this.value1.value)
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

  resetGetLateFineSumByDate() {
    this.year1.reset();
    this.value1.reset();
    this.timeframe1 = "";
  }

  isGetLateFineSumByDateFormValid(): boolean {
    // Check if all required fields have a value
    return this.year1.valid && this.value1.valid && this.timeframe1 !== "";
  }
}
