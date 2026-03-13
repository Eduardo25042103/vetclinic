import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FooterLink    { label: string; href: string; }
export interface FooterSection { title: string; links: FooterLink[]; }

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  @Input() brandName: string = 'Vet Clinic';
  @Input() tagline: string   = 'Cuidado especializado para tu mejor amigo.';

  readonly currentYear = new Date().getFullYear();

  readonly sections: FooterSection[] = [
    {
      title: 'Servicios',
      links: [
        { label: 'Consultas',       href: '#' },
        { label: 'Vacunación',      href: '#' },
        { label: 'Cirugía',         href: '#' },
        { label: 'Emergencias 24h', href: '#' }
      ]
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Nosotros', href: '#' },
        { label: 'Clínica',  href: '#' },
        { label: 'Blog',     href: '#' },
        { label: 'Contacto', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidad', href: '#' },
        { label: 'Términos',   href: '#' },
        { label: 'Cookies',    href: '#' }
      ]
    }
  ];

  readonly socialLinks = [
    { icon: 'bi-facebook',  href: '#', label: 'Facebook'  },
    { icon: 'bi-instagram', href: '#', label: 'Instagram' },
    { icon: 'bi-twitter-x', href: '#', label: 'Twitter'   },
    { icon: 'bi-whatsapp',  href: '#', label: 'WhatsApp'  }
  ];
}