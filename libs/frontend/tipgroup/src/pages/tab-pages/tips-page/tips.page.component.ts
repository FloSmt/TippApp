import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-tips.page',
  imports: [],
  templateUrl: './tips.page.component.html',
  styleUrl: './tips.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipsPageComponent {}
