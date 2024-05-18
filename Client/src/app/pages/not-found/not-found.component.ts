import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [],
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.scss",
})
export class NotFoundComponent {
  constructor(private titleService: Title, private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      const pageTitle = data["title"] || "Dashboard"; // Default title if no data provided
      this.titleService.setTitle(`${pageTitle} | Data Warehouse App`);
    });
  }
}
