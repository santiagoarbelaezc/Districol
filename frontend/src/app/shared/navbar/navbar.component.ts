import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  scrolled = false;
  menuAbierto = false;
  searchExpanded = false;
  searchQuery = '';
  showSuggestions = false;
  isSearchFocused = false;

  // Sugerencias de búsqueda relevantes a Districol
  suggestions = [
    'colchón',
    'colchon',
    'almohada',
    'sábana',
    'sabana',
    'base cama',
    'protector',
    'sommier',
    'espuma',
    'edredón',
    'edredon',
    'cojín',
    'cobija'
  ];

  filteredSuggestions: string[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) { }

  ngOnInit(): void { }

  /**
   * Normaliza texto eliminando acentos para búsqueda inclusiva
   */
  private normalizarTexto(str: string): string {
    if (!str) return '';

    const mapaAcentos: { [key: string]: string } = {
      'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ā': 'a', 'ã': 'a',
      'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e',
      'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i',
      'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'ō': 'o', 'õ': 'o',
      'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u',
      'ý': 'y', 'ÿ': 'y',
      'ñ': 'n', 'ç': 'c'
    };

    return str
      .toLowerCase()
      .split('')
      .map(char => mapaAcentos[char] || char)
      .join('')
      .trim();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 10;
    if (this.showSuggestions) {
      this.closeSuggestions();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Cerrar menú hamburguesa si clic fuera
    if (this.menuAbierto) {
      const isInsideMenu = target.closest('.navbar-menu') || target.closest('.hamburger-btn');
      if (!isInsideMenu) {
        this.closeMenu();
      }
    }

    // Cerrar sugerencias si clic fuera
    if (this.showSuggestions) {
      const isInsideSearch = target.closest('.search-container');
      if (!isInsideSearch) {
        this.closeSuggestions();
      }
    }

    // En mobile, cerrar buscador si clic fuera
    if (this.searchExpanded && window.innerWidth <= 768) {
      const isInsideSearch = target.closest('.search-container');
      if (!isInsideSearch) {
        this.collapseSearch();
      }
    }
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    if (window.innerWidth > 768 && this.menuAbierto) {
      this.closeMenu();
    }
    if (window.innerWidth > 768 && this.searchExpanded) {
      this.searchExpanded = false;
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) {
      this.closeSuggestions();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.menuAbierto = false;
    document.body.style.overflow = '';
  }

  toggleSearch(): void {
    if (window.innerWidth <= 768) {
      this.searchExpanded = !this.searchExpanded;
      if (this.searchExpanded) {
        if (this.menuAbierto) this.closeMenu();
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
        }, 150);
      } else {
        this.closeSuggestions();
      }
    }
  }

  collapseSearch(): void {
    this.searchExpanded = false;
    this.searchQuery = '';
    this.closeSuggestions();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;

    if (this.searchQuery.trim()) {
      const queryNorm = this.normalizarTexto(this.searchQuery);
      this.filteredSuggestions = this.suggestions.filter(s =>
        this.normalizarTexto(s).includes(queryNorm)
      );
      this.showSuggestions = this.filteredSuggestions.length > 0;
    } else {
      this.filteredSuggestions = [...this.suggestions];
      this.showSuggestions = true;
    }
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
    if (!this.searchQuery.trim()) {
      this.filteredSuggestions = [...this.suggestions];
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    this.isSearchFocused = false;
    setTimeout(() => {
      if (!this.isSearchFocused) {
        this.closeSuggestions();
      }
    }, 200);
  }

  private performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/productos'], {
        queryParams: {
          busqueda: this.searchQuery,
          tipo: 'nombre'
        }
      });
      this.closeSuggestions();
      if (window.innerWidth <= 768) {
        this.collapseSearch();
      }
      this.searchQuery = '';
    }
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.performSearch();
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.performSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.closeSuggestions();
    this.searchInput?.nativeElement?.focus();
  }

  private closeSuggestions(): void {
    this.showSuggestions = false;
    this.filteredSuggestions = [];
  }

  onLogoClick(event: Event): void {
    event.preventDefault();
    if (this.menuAbierto) this.closeMenu();
    if (this.searchExpanded) this.collapseSearch();
    this.closeSuggestions();
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navigateAndClose(): void {
    this.closeMenu();
    this.collapseSearch();
    this.closeSuggestions();
  }
}
