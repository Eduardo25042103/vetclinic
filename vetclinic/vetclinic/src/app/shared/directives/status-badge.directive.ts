import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AppointmentStatus } from '../../core/models/appointment';

@Directive({ selector: '[appStatusBadge]', standalone: true })
export class StatusBadgeDirective implements OnInit {
  @Input('appStatusBadge') status: AppointmentStatus = 'scheduled';

  private readonly badgeMap: Record<AppointmentStatus, string> = {
    scheduled: 'bg-primary',
    ongoing:   'bg-warning text-dark',
    cancelled: 'bg-danger',
    completed: 'bg-success'
  };

  constructor(private readonly el: ElementRef, private readonly renderer: Renderer2) {}

  ngOnInit(): void {
    const classes = (this.badgeMap[this.status] ?? 'bg-secondary').split(' ');
    this.renderer.addClass(this.el.nativeElement, 'badge');
    classes.forEach((cls) => this.renderer.addClass(this.el.nativeElement, cls));
  }
}