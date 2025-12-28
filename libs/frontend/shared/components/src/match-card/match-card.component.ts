import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatchResponseDto } from '@tippapp/shared/data-access';

@Component({
  selector: 'lib-match-card',
  imports: [],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent {
  match = input.required<MatchResponseDto>();
}
