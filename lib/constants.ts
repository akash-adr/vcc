// Shared, environment-agnostic constants (safe to import from server and client).
export const SEEN_KEY = "vcc:seen";

// Optimised banana tree (metal-rough, Draco, 1024px WebP). Source lives in assets-src/.
export const BANANA_TREE_URL = "/models/banana-tree.glb";
// Self-hosted Draco decoder (copied from three/examples/jsm/libs/draco/gltf) so nothing loads from a CDN.
export const DRACO_PATH = "/draco/";

// Cache tag for the live recipe counter (GET /api/submissions/count).
export const COUNT_TAG = "submission-count";
