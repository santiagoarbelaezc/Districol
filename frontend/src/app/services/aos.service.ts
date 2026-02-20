import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import AOS from 'aos';

@Injectable({
    providedIn: 'root'
})
export class AosService {

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    init(): void {
        if (isPlatformBrowser(this.platformId)) {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100,
                delay: 0,
                anchorPlacement: 'top-bottom'
            });
        }
    }

    refresh(): void {
        if (isPlatformBrowser(this.platformId)) {
            AOS.refresh();
        }
    }
}
