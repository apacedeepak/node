import { Routes, RouterModule } from '@angular/router';
import { MyperformanceComponent } from './myperformance/myperformance.component';


export const REPORT_ROUTES: Routes = [
    { path: '', component: MyperformanceComponent, pathMatch: 'full' },
    { path: 'myperformance', component: MyperformanceComponent}
];
