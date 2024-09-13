import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
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
export class AppDashboardComponent {
  @ViewChild("chart") chart: ChartComponent = Object.create(null);

  public loanFineOverviewChart!: Partial<loanFineOverviewChart> | any;
  public yearlyChart!: Partial<yearlyChart> | any;
  public monthlyChart!: Partial<monthlyChart> | any;
  returnedData: any[] = [];
  loansAndFines: any[] = [];
  fineIncome: any[] = [];
  quarterlyFineIncome: any[] = [];

  constructor(private api: DataAccessService) {
    this.api
      .getDashboardSummary()
      .then((response: any) => {
        this.loansAndFines = response.loansAndFines.reverse();
        this.fineIncome = response.fineIncome;
        this.quarterlyFineIncome = response.quarterlyFineIncome;
        this.updateCharts();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        console.log("An error occurred. Please try again later.");
        alert(error.error.message);
      });

    // Update the charts with the new data
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

    // yearly breakup chart
    this.yearlyChart = {
      series: [38, 40, 25],

      chart: {
        type: "donut",
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: "#adb0bb",
        toolbar: {
          show: false,
        },
        height: 130,
      },
      colors: ["#5D87FF", "#ECF2FF", "#F9F9FD"],
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

    // mohtly earnings chart
    this.monthlyChart = {
      series: [
        {
          name: "",
          color: "#49BEFF",
          data: [25, 66, 20, 40, 12, 58, 20],
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

    // Update the 'yearlyChart' data
    this.yearlyChart.series = this.quarterlyFineIncome.map((item) => item.TOTALFINEINCOME);

    // Update the 'monthlyChart' data
    this.monthlyChart.series = [
      {
        name: "",
        color: "#49BEFF",
        data: this.fineIncome.map((item) => item.TOTALFINEINCOME),
      },
    ];
  }
}
