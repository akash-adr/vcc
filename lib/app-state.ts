"use client";

// Tiny cross-component signals (loader finished, transitions running) without a state library.

type Listener = () => void;

const state = { loaderDone: false, transitioning: false };
const listeners = new Set<Listener>();
const notify = () => [...listeners].forEach((l) => l());

export { SEEN_KEY } from "./constants";

export function isLoaderDone() {
  return state.loaderDone;
}

export function markLoaderDone() {
  if (state.loaderDone) return;
  state.loaderDone = true;
  notify();
}

export function setTransitioning(on: boolean) {
  state.transitioning = on;
  notify();
}

const pageReady = () => state.loaderDone && !state.transitioning;

/** Calls `cb` once the page is actually visible: loader gone and no route wipe covering it. */
export function onPageReady(cb: Listener) {
  if (pageReady()) {
    cb();
    return () => {};
  }
  const l = () => {
    if (!pageReady()) return;
    listeners.delete(l);
    cb();
  };
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function safeSession<T>(fn: (s: Storage) => T): T | undefined {
  try {
    return fn(window.sessionStorage);
  } catch {
    return undefined;
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
