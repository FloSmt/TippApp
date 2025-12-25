import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-table.page',
  imports: [],
  templateUrl: './table.page.component.html',
  styleUrl: './table.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePageComponent {}
