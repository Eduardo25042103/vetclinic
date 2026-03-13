import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({ selector: '[appHighlightUpcoming]', standalone: true })
export class HighlightUpcomingDirective implements OnInit {
  @Input('appHighlightUpcoming') datetime: string = '';

  constructor(private readonly el: ElementRef, private readonly renderer: Renderer2) {}

  ngOnInit(): void {
    if (!this.datetime) return;

    const diffHours =
      (new Date(this.datetime).getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHours > 0 && diffHours <= 24) {
      this.renderer.addClass(this.el.nativeElement, 'upcoming-highlight');
    }
  }
}