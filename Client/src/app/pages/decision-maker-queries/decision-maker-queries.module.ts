import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { DecisionMakerRoutes } from './decision-maker-queries.routing';
import { AppChiefLibrarianComponent } from './chief-librarian/chief-librarian.component';
import { AppViceChancellorComponent } from './vice-chancellor/vice-chancellor.component';
import { AppFinanceDirectorComponent } from './finance-director/finance-director.component';
import { AppDepartmentalHeadsComponent } from './departmental-heads/departmental-heads.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DecisionMakerRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
  ],
  declarations: [
    AppChiefLibrarianComponent,
    AppViceChancellorComponent,
    AppFinanceDirectorComponent,
    AppDepartmentalHeadsComponent,
  ],
})
export class DecisionMakerQueriesModule {}
