// Shared, environment-agnostic constants (safe to import from server and client).
export const SEEN_KEY = "vcc:seen";

// Optimised banana tree (metal-rough, meshopt, 1024px WebP). Source lives in assets-src/.
// Meshopt rather than Draco: no separate decoder download or worker start-up, and it decodes much faster.
export const BANANA_TREE_URL = "/models/banana-tree.glb";

// Cache tag for the live recipe counter (GET /api/submissions/count).
export const COUNT_TAG = "submission-count";
