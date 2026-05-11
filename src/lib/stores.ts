import { writable } from 'svelte/store';

export const currentPage = writable<'dashboard' | 'history' | 'alert' | 'profil'>('dashboard');
