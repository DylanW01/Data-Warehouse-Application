import { Component, Output, EventEmitter, Input, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DataAccessService } from "src/app/services/data-access.service";
import { Observable } from "rxjs"; // Import Observable
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;
  username = this.api.getUserNameFromToken();

  constructor(public dialog: MatDialog, private api: DataAccessService, public router: Router) {}

  logout() {
    this.api.deleteSessionTokenCookie();
    this.router.navigate(["/authentication", "login"]);
  }
}
