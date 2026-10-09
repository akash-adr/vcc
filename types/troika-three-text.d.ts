// Minimal typing for the one troika API we call directly (drei's <Text> wraps the rest).
declare module "troika-three-text" {
  export function preloadFont(options: { font?: string; characters?: string | string[]; sdfGlyphSize?: number }, callback: () => void): void;
}
