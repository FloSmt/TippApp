import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'custom-header-content-condense',
  imports: [IonHeader, IonToolbar, IonTitle],
  templateUrl: './header-content-condense.component.html',
  styleUrl: './header-content-condense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderContentCondenseComponent {
  title = input<string>();
  subTitle = input<string>();
}
