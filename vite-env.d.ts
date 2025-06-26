/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL: string;
  // Add more VITE_ vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
