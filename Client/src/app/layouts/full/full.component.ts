import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { MatSidenav } from "@angular/material/sidenav";
import { environment } from "src/environments/environment";
import { DataAccessService } from "src/app/services/data-access.service";
import { Router } from "@angular/router";

const MOBILE_VIEW = "screen and (max-width: 768px)";
const TABLET_VIEW = "screen and (min-width: 769px) and (max-width: 1024px)";
const MONITOR_VIEW = "screen and (min-width: 1024px)";

@Component({
  selector: "app-full",
  templateUrl: "./full.component.html",
  styleUrls: [],
})
export class FullComponent implements OnInit {
  @ViewChild("leftsidenav")
  public sidenav: MatSidenav | any;

  //get options from service
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;
  currentApplicationVersion = environment.appVersion;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(private breakpointObserver: BreakpointObserver, private api: DataAccessService, private router: Router) {
    let cookie = this.api.getUserTokenFromCookie();
    if (cookie == null) {
      this.router.navigate(["/authentication", "login"]);
    }

    this.htmlElement = document.querySelector("html")!;
    this.layoutChangesSubscription = this.breakpointObserver.observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW]).subscribe((state) => {
      // SidenavOpened must be reset true when layout changes

      this.isMobileScreen = state.breakpoints[MOBILE_VIEW];

      this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
    });
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
  }
}
