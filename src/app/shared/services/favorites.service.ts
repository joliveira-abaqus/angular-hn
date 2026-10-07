import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'favorites';

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {
    private _favorites = signal<number[]>(this.loadFavorites());

    readonly favorites = this._favorites.asReadonly();

    private loadFavorites(): number[] {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved) as number[];
            } catch {
                return [];
            }
        }
        return [];
    }

    private saveFavorites(ids: number[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }

    toggle(id: number) {
        const current = this._favorites();
        const index = current.indexOf(id);
        let next: number[];
        if (index > -1) {
            next = [...current.slice(0, index), ...current.slice(index + 1)];
        } else {
            next = [...current, id];
        }
        this._favorites.set(next);
        this.saveFavorites(next);
    }

    isFavorite(id: number): boolean {
        return this._favorites().includes(id);
    }
}
