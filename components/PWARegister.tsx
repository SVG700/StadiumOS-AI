'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('StadiumOS AI PWA Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('StadiumOS AI PWA Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
