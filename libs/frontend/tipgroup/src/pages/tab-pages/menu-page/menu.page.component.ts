import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-menu.page',
  imports: [],
  templateUrl: './menu.page.component.html',
  styleUrl: './menu.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {}
