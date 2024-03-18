import { Component } from "@angular/core";
import { ServerService } from "src/app/server.service";

@Component({
  selector: "app-finance-director",
  templateUrl: "./finance-director.component.html",
  styleUrls: ["./finance-director.component.scss"],
})
export class FinanceDirectorComponent {
  constructor(private server: ServerService) {}
}
