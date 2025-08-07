/// <reference types="vite/client" />

declare global {
  const __KIOSK_MODE__: boolean;
  const __VITE_KIOSK_MODE__: string;
  const __APP_VERSION__: string;
  const __BUILD_TIME__: string;
  const __DEV__: boolean;
}

export {};
