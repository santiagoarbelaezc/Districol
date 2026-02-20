import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ScrollService {

    constructor(private router: Router) { }

    /**
     * Suscribe al router para hacer scroll al top en cada navegación.
     * Llamar una vez desde AppComponent.
     */
    init(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
            });
    }
}
