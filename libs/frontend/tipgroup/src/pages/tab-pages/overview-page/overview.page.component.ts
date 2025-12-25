import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-overview.page',
  imports: [],
  templateUrl: './overview.page.component.html',
  styleUrl: './overview.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent {}
