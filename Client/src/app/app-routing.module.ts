import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ViceChancellorComponent } from "./Pages/vice-chancellor/vice-chancellor.component";
import { DepartmentalHeadsComponent } from "./Pages/departmental-heads/departmental-heads.component";
import { FinanceDirectorComponent } from "./Pages/finance-director/finance-director.component";
import { ChiefLibrarianComponent } from "./Pages/chief-librarian/chief-librarian.component";

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "vice-chancellor", component: ViceChancellorComponent },
  { path: "departmental-heads", component: DepartmentalHeadsComponent },
  { path: "finance-director", component: FinanceDirectorComponent },
  { path: "chief-librarian", component: ChiefLibrarianComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
