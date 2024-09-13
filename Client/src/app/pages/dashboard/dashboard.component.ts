import { Component, ViewEncapsulation, ViewChild, OnInit } from "@angular/core";
import { ApexChart, ChartComponent, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid, ApexPlotOptions, ApexFill, ApexMarkers, ApexResponsive } from "ng-apexcharts";
import { DataAccessService } from "src/app/services/data-access.service";

interface month {
  value: string;
  viewValue: string;
}

export interface loanFineOverviewChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
  marker: ApexMarkers;
}

export interface yearlyChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive;
}

export interface monthlyChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  encapsulation: ViewEncapsulation.None,
})
export class AppDashboardComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent = Object.create(null);

  public loanFineOverviewChart!: Partial<loanFineOverviewChart> | any;
  public yearlyChart!: Partial<yearlyChart> | any;
  public monthlyChart!: Partial<monthlyChart> | any;
  returnedData: any[] = [];
  loansAndFines: any[] = [];
  fineIncome: any[] = [];
  quarterlyFineIncome: any[] = [];
  finesTotalThisMonth: number = 0;
  finesChangePercentage: string = "";
  fineChangeDirection: string = "";
  currentQuarter: string = "";
  lastQuarter: string = "";
  fineQuarterChangeDirection: string = "";
  finesQuarterChangePercentage: string = "";
  fineQuarterIncome: number = 0;

  constructor(private api: DataAccessService) {
    //#region Update the charts with the new data
    this.loanFineOverviewChart = {
      series: [],
      grid: {
        borderColor: "rgba(0,0,0,0.1)",
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      plotOptions: {
        bar: { horizontal: false, columnWidth: "35%", borderRadius: [4] },
      },
      chart: {
        type: "bar",
        height: 390,
        offsetX: -15,
        toolbar: { show: true },
        foreColor: "#adb0bb",
        fontFamily: "inherit",
        sparkline: { enabled: false },
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      legend: { show: true },
      xaxis: {
        type: "datetime",
        categories: [],
        labels: {
          style: { cssClass: "grey--text lighten-2--text fill-color" },
        },
      },
      yaxis: {
        show: true,
        min: 0,
        max: 20,
        tickAmount: 4,
        labels: {
          style: {
            cssClass: "grey--text lighten-2--text fill-color",
          },
        },
      },
      stroke: {
        show: true,
        width: 3,
        lineCap: "butt",
        colors: ["transparent"],
      },
      tooltip: { theme: "light" },

      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              },
            },
          },
        },
      ],
    };
    //#endregion

    //#region quarterly breakup chart
    this.yearlyChart = {
      series: [],

      chart: {
        type: "donut",
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: "#adb0bb",
        toolbar: {
          show: false,
        },
        height: 130,
      },
      colors: ["#5D87FF", "#ECF2FF"],
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: "75%",
            background: "transparent",
          },
        },
      },
      stroke: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 991,
          options: {
            chart: {
              width: 120,
            },
          },
        },
      ],
      tooltip: {
        enabled: false,
      },
    };
    //#endregion

    //#region mohtly earnings chart
    this.monthlyChart = {
      series: [
        {
          name: "",
          color: "#49BEFF",
          data: [],
        },
      ],

      chart: {
        type: "area",
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: "#adb0bb",
        toolbar: {
          show: false,
        },
        height: 60,
        sparkline: {
          enabled: true,
        },
        group: "sparklines",
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        colors: ["#E8F7FF"],
        type: "solid",
        opacity: 0.05,
      },
      markers: {
        size: 0,
      },
      tooltip: {
        theme: "dark",
        x: {
          show: false,
        },
      },
    };
    //#endregion
  }

  ngOnInit(): void {
    this.api
      .getDashboardSummary()
      .then((response: any) => {
        this.loansAndFines = response.loansAndFines.reverse();
        this.fineIncome = response.fineIncome.reverse();
        this.quarterlyFineIncome = response.quarterlyFineIncome.reverse();
        this.updateCharts();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        console.log("An error occurred. Please try again later.");
        alert(error.error.message);
      });
  }

  updateCharts() {
    // Update the 'loanFineOverviewChart' data
    this.loanFineOverviewChart.series = [
      {
        name: "Loans this month",
        data: this.loansAndFines.map((item) => item.NUMBEROFLOANS),
        color: "#5D87FF",
      },
      {
        name: "Fines this month",
        data: this.loansAndFines.map((item) => item.NUMBEROFFINES),
        color: "#49BEFF",
      },
    ];

    this.loanFineOverviewChart = { ...this.loanFineOverviewChart, xaxis: { type: "datetime", categories: this.loansAndFines.map((item) => item.MONTH) } };

    // Update the 'quarterlyChart' data
    this.yearlyChart.series = this.quarterlyFineIncome.map((item) => item.TOTALFINEINCOME).reverse();
    let quarterlyFineIncomeLength = this.quarterlyFineIncome.length;
    this.currentQuarter = "Q" + this.quarterlyFineIncome[quarterlyFineIncomeLength - 1].QUARTER + "-" + String(this.quarterlyFineIncome[quarterlyFineIncomeLength - 1].YEAR).slice(-2);
    this.lastQuarter = "Q" + this.quarterlyFineIncome[quarterlyFineIncomeLength - 2].QUARTER + "-" + String(this.quarterlyFineIncome[quarterlyFineIncomeLength - 2].YEAR).slice(-2);
    this.fineQuarterIncome = this.quarterlyFineIncome[quarterlyFineIncomeLength - 1].TOTALFINEINCOME;
    let finesTotalThisQuarter = this.quarterlyFineIncome[quarterlyFineIncomeLength - 1].TOTALFINEINCOME;
    let finesTotalLastQuarter = this.quarterlyFineIncome[quarterlyFineIncomeLength - 2].TOTALFINEINCOME;
    let finesQuarterChange = ((finesTotalThisQuarter - finesTotalLastQuarter) / finesTotalLastQuarter) * 100;
    this.fineQuarterChangeDirection = finesQuarterChange >= 0 ? "up" : "down";
    this.finesQuarterChangePercentage = (finesQuarterChange >= 0 ? "+" : "") + finesQuarterChange.toFixed(0) + "%";

    // Update the 'monthlyChart' data
    this.monthlyChart.series = [
      {
        name: "£",
        color: "#49BEFF",
        data: this.fineIncome.map((item) => item.TOTALFINEINCOME),
      },
    ];
    let fineIncomeLength = this.fineIncome.length;
    this.finesTotalThisMonth = this.fineIncome[fineIncomeLength - 1].TOTALFINEINCOME;
    let finesTotalLastMonth = this.fineIncome[fineIncomeLength - 2].TOTALFINEINCOME;
    let finesChange = ((this.finesTotalThisMonth - finesTotalLastMonth) / finesTotalLastMonth) * 100;
    this.fineChangeDirection = finesChange >= 0 ? "up" : "down";
    this.finesChangePercentage = (finesChange >= 0 ? "+" : "") + finesChange.toFixed(0) + "%";
  }
}
