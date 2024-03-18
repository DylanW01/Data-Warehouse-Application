import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HomeComponent } from "./home/home.component";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DepartmentalHeadsComponent } from "./Pages/departmental-heads/departmental-heads.component";
import { ViceChancellorComponent } from "./Pages/vice-chancellor/vice-chancellor.component";
import { FinanceDirectorComponent } from "./Pages/finance-director/finance-director.component";

@NgModule({
  declarations: [AppComponent, DepartmentalHeadsComponent, ViceChancellorComponent, FinanceDirectorComponent, HomeComponent],
  imports: [HttpClientModule, BrowserModule, AppRoutingModule, NgbModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
