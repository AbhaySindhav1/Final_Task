import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
} from '@angular/core';
import { Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDropDown]',
})
export class DropdownDirective {
  constructor(private elRef: ElementRef, private renderer: Renderer2) {}
  @HostBinding('class.open') isOpen = false;

  @HostListener('document:click', ['$event'])
  toggleOpen(event: Event) {
    if (this.elRef.nativeElement.contains(event.target) && !this.isOpen) {
      this.isOpen = !this.isOpen;
      const grandparentEl = this.elRef.nativeElement.parentElement;
      this.renderer.addClass(grandparentEl, 'showMenu');
      this.renderer.listen(grandparentEl, 'click', () => {
        grandparentEl.classList.toggle('showMenu');
      });
    } else if (this.isOpen) {
      this.isOpen = false;
      const grandparentEl = this.elRef.nativeElement.parentElement;
      this.renderer.removeClass(grandparentEl, 'showMenu');
    }
  }
}
