import { Routes } from "@angular/router";

// pages
import { AppChiefLibrarianComponent } from "./chief-librarian/chief-librarian.component";
import { AppViceChancellorComponent } from "./vice-chancellor/vice-chancellor.component";
import { AppFinanceDirectorComponent } from "./finance-director/finance-director.component";
import { AppDepartmentalHeadsComponent } from "./departmental-heads/departmental-heads.component";

export const DecisionMakerRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "chief-librarian",
        component: AppChiefLibrarianComponent,
        data: { title: "Chief Librarian" },
      },
      {
        path: "vice-chancellor",
        component: AppViceChancellorComponent,
        data: { title: "Vice Chancellor" },
      },
      {
        path: "finance-director",
        component: AppFinanceDirectorComponent,
        data: { title: "Finance Director" },
      },
      {
        path: "departmental-heads",
        component: AppDepartmentalHeadsComponent,
        data: { title: "Departmental Heads" },
      },
    ],
  },
];
