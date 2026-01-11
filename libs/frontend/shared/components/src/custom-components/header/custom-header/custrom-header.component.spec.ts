import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { CustromHeaderComponent } from './custrom-header.component';

describe('CustromHeaderComponent', () => {
  let component: CustromHeaderComponent;
  let fixture: ComponentFixture<CustromHeaderComponent>;

  const mockResizeObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  beforeAll(() => {
    (global as any).ResizeObserver = mockResizeObserver;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustromHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustromHeaderComponent);
    component = fixture.componentInstance;

    component.headerElement = new ElementRef({
      nativeElement: { offsetHeight: 100 },
    } as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ResizeObserver', () => {
    it('should start ResizeObserver in AfterViewInit', () => {
      component.ngAfterViewInit();
      expect(mockResizeObserver).toHaveBeenCalled();
    });

    it('should destroy ResizeObserver in OnDestroy', () => {
      const disconnectSpy = jest.spyOn((component as any).resizeObserver, 'disconnect');
      component.ngOnDestroy();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Scroll Logic (Sticky/Hide Header)', () => {
    it('should hide header, if scrolling down (> 50px)', () => {
      component.scrollEvent = { detail: { scrollTop: 100 } };

      expect(component.transform).toBe('translateY(-80px)');
    });

    it('should show header, if scrolling up', () => {
      // Scroll down first to hide
      component.scrollEvent = { detail: { scrollTop: 100 } };
      expect(component.transform).toBe('translateY(-80px)');

      // Scroll up to show again
      component.scrollEvent = { detail: { scrollTop: 20 } };
      expect(component.transform).toBe('translateY(0)');
    });

    it('should not hide header, if scroll is less than 50px', () => {
      component.scrollEvent = { detail: { scrollTop: 30 } };
      expect(component.transform).toBe('translateY(0)');
    });
  });

  describe('Inputs', () => {
    it('should set default values correctly', () => {
      fixture.componentRef.setInput('title', 'Test-Title');
      expect(component.title()).toBe('Test-Title');
      expect(component.showButtonSection()).toBe(true);
    });
  });
});
