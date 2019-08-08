import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  Optional,
  Renderer2,
  Self
} from '@angular/core';
import {NgControl, NgModel} from '@angular/forms';

import calculateNodeHeight from '../utils/calculate-node-height';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

export interface AutoSizeType {
  minRows?: number;
  maxRows?: number;
}

@Directive({
  selector: '[hi-input]',
  host: {
    '[class.hi-input]': 'true'
  }
})
export class InputDirective implements DoCheck, AfterViewInit {
  private _size = 'default';
  private _disabled = false;
  private _autosize: boolean | AutoSizeType = false;
  private el: HTMLTextAreaElement | HTMLInputElement;
  private previousValue: string;
  private previewsMinRows: number;
  private previewsMaxRows: number;
  private isInit = false;

  @Input()
  get hiSize(): string {
    return this._size;
  }

  set hiSize(value: string) {
    this._size = value;
  }

  @Input()
  @HostBinding(`class.hi-input-disabled`)
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }

  @Input()
  set hiAutosize(value: string | boolean | AutoSizeType) {
    if (typeof value === 'string') {
      this._autosize = true;
    } else {
      this._autosize = value;
    }
  }

  get hiAutosize(): string | boolean | AutoSizeType {
    return this._autosize;
  }

  @HostBinding(`class.hi-input-lg`)
  get setLgClass(): boolean {
    return this.hiSize === 'large';
  }

  @HostBinding(`class.hi-input-sm`)
  get setSmClass(): boolean {
    return this.hiSize === 'small';
  }

  @HostListener('input')
  textAreaOnChange(): void {
    if (this.hiAutosize) {
      this.resizeTextArea();
    }
  }

  resizeTextArea(): void {
    const textAreaRef = this.el as HTMLTextAreaElement;
    const maxRows = this.hiAutosize ? (this.hiAutosize as AutoSizeType).maxRows || null : null;
    const minRows = this.hiAutosize ? (this.hiAutosize as AutoSizeType).minRows || null : null;
    if ((this.previousValue === textAreaRef.value) && (this.previewsMaxRows === maxRows) && (this.previewsMinRows === minRows)) {
      return;
    }
    this.previousValue = textAreaRef.value;
    this.previewsMinRows = minRows;
    this.previewsMaxRows = maxRows;
    // eliminate jitter
    this.renderer.setStyle(textAreaRef, 'height', 'auto');

    const textAreaStyles = calculateNodeHeight(textAreaRef, false, minRows, maxRows);
    this.renderer.setStyle(textAreaRef, 'height', `${textAreaStyles.height}px`);
    this.renderer.setStyle(textAreaRef, 'overflowY', textAreaStyles.overflowY);
    this.renderer.setStyle(textAreaRef, 'minHeight', `${textAreaStyles.minHeight}px`);
    this.renderer.setStyle(textAreaRef, 'maxHeight', `${textAreaStyles.maxHeight}px`);
  }

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              @Optional() private ngModel: NgModel,
              @Optional() @Self() public ngControl: NgControl) {
    this.el = this.elementRef.nativeElement;
  }

  ngDoCheck(): void {
    if (this.hiAutosize && this.isInit) {
      this.resizeTextArea();
    }
  }

  ngAfterViewInit(): void {
    this.isInit = true;
    if (this.hiAutosize) {
      this.resizeTextArea();
    }
  }
}
