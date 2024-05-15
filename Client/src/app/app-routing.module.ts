import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BlankComponent } from "./layouts/blank/blank.component";
import { FullComponent } from "./layouts/full/full.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";

const routes: Routes = [
  {
    path: "",
    component: FullComponent,
    children: [
      {
        path: "",
        redirectTo: "/dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadChildren: () => import("./pages/pages.module").then((m) => m.PagesModule),
      },
      {
        path: "decision-makers",
        loadChildren: () => import("./pages/decision-maker-queries/decision-maker-queries.module").then((m) => m.DecisionMakerQueriesModule),
      },
    ],
  },
  {
    path: "",
    component: BlankComponent,
    children: [
      {
        path: "authentication",
        loadChildren: () => import("./pages/authentication/authentication.module").then((m) => m.AuthenticationModule),
      },
    ],
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
