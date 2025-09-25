import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformLeagueName',
})
export class TransformLeagueNamePipe implements PipeTransform {
  transform(value: string): unknown {
    const nameSplices = value.trim().split(' ');
    let endValue = value;

    if (nameSplices[nameSplices.length - 1].match(/[0-9]+\/[0-9]+/gm)) {
      //nameSplices.pop();
      endValue = nameSplices.join(' ');
    }

    return endValue;
  }
}
