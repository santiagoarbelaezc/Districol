import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) { }

  setSeoData(data: {
    title: string;
    description: string;
    keywords?: string;
    author?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  }): void {
    // Establecer título
    this.titleService.setTitle(data.title);

    // Meta description
    this.updateMeta('name', 'description', data.description);

    // Keywords
    if (data.keywords) {
      this.updateMeta('name', 'keywords', data.keywords);
    }

    // Author
    if (data.author) {
      this.updateMeta('name', 'author', data.author);
    }

    // Open Graph
    this.updateMeta('property', 'og:title', data.ogTitle || data.title);
    this.updateMeta('property', 'og:description', data.ogDescription || data.description);

    if (data.ogImage) {
      this.updateMeta('property', 'og:image', data.ogImage);
    }

    if (data.ogUrl) {
      this.updateMeta('property', 'og:url', data.ogUrl);
    }

    // Twitter
    this.updateMeta('name', 'twitter:title', data.twitterTitle || data.title);
    this.updateMeta('name', 'twitter:description', data.twitterDescription || data.description);

    if (data.twitterImage) {
      this.updateMeta('name', 'twitter:image', data.twitterImage);
    }
  }

  private updateMeta(type: 'name' | 'property', value: string, content: string): void {
    try {
      const tag = this.metaService.getTag(`${type}="${value}"`);
      if (tag) {
        this.metaService.updateTag({ [type]: value, content: content });
      } else {
        this.metaService.addTag({ [type]: value, content: content });
      }
    } catch (error) {
      console.warn(`Error updating meta tag: ${type}="${value}"`, error);
    }
  }

  setDefaultSeo(): void {
    this.setSeoData({
      title: 'Districol - Colchones Premium en Armenia, Quindío | Descanso de Calidad',
      description: 'Districol - Marca colombiana de colchones premium en Armenia, Quindío. Soluciones de descanso de calidad con tecnología y confort. Colchones, bases cama, almohadas y sábanas orgánicas.',
      keywords: 'colchones armenia, colchones quindío, colchones premium, descanso reparador, salud postural',
      author: 'Districol',
      ogTitle: 'Districol - Colchones Premium en Armenia',
      ogDescription: 'Soluciones de descanso premium con tradición y calidad',
      ogUrl: 'https://districol.com'
    });
  }
}
