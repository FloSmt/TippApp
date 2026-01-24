import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { IonAvatar, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'custom-header',
  imports: [IonHeader, IonTitle, IonToolbar, IonButtons, IonAvatar],
  templateUrl: './custrom-header.component.html',
  styleUrl: './custrom-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustromHeaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('headerContainer', { read: ElementRef }) headerElement!: ElementRef;

  title = input<string>();
  subTitle = input<string>();
  showButtonSection = input<boolean>(true);
  centerTitle = input<boolean>(false);
  enableQuickReveal = input<boolean>(false);
  enableSubContent = input<boolean>(false);
  isDialogHeader = input<boolean>(false);

  private resizeObserver: ResizeObserver | null = null;
  private _lastScrollTop = 0;
  transform = 'translateY(0)';
  headerHeight = signal<number>(80);

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      const el = this.headerElement.nativeElement;
      this.headerHeight.set(el.offsetHeight);
    });

    this.resizeObserver.observe(this.headerElement.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  @Input() set scrollEvent(event: any) {
    if (!event || !event.detail) return;

    const scrollTop = event.detail.scrollTop;

    if (scrollTop > this._lastScrollTop && scrollTop > 50) {
      this.transform = 'translateY(-80px)';
    } else {
      this.transform = 'translateY(0)';
    }

    this._lastScrollTop = scrollTop;
  }
}
