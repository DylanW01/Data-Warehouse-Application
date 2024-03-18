import { Component, OnInit } from "@angular/core";
import { ServerService } from "src/app/server.service";

@Component({
  selector: "app-departmental-heads",
  templateUrl: "./departmental-heads.component.html",
  styleUrls: ["./departmental-heads.component.scss"],
})
export class DepartmentalHeadsComponent {
  constructor(private server: ServerService) {}
}
