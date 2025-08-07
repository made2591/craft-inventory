/// <reference types="vite/client" />

declare global {
  const __KIOSK_MODE__: boolean | undefined;
  const __VITE_KIOSK_MODE__: string | undefined;
  const __APP_VERSION__: string | undefined;
  const __BUILD_TIME__: string | undefined;
  const __DEV__: boolean | undefined;
}

export {};
