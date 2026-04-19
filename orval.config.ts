import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "orval";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** OpenAPI 3: component names must match /^[a-zA-Z0-9.\-_]+$/ (Orval validates before `override.transformer`). */
const VALID_COMPONENT_KEY = /^[a-zA-Z0-9.\-_]+$/;

function sanitizeSchemaKey(name: string): string {
  if (VALID_COMPONENT_KEY.test(name)) return name;
  return name.replace(/\s+/g, "");
}

/** OAS 3.0 does not allow `type: "null"` alone; use `type` + `nullable` instead. */
function upgradeNullOnlyTypes(node: unknown): void {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) upgradeNullOnlyTypes(item);
    return;
  }
  const o = node as Record<string, unknown>;
  if (o.type === "null") {
    o.type = "string";
    o.nullable = true;
    return;
  }
  for (const v of Object.values(o)) upgradeNullOnlyTypes(v);
}

/**
 * Rewrites invalid `components.schemas` keys and all `#/components/schemas/...` $refs.
 * Applied in-memory from the on-disk swagger file so `swagger.json` is never modified.
 */
function normalizeInvalidSchemaKeys(spec: Record<string, unknown>): Record<string, unknown> {
  const doc = structuredClone(spec);
  const components = doc.components as Record<string, unknown> | undefined;
  const schemas = components?.schemas as Record<string, unknown> | undefined;
  if (!schemas) return doc;

  const rename = new Map<string, string>();
  const nextSchemas: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(schemas)) {
    const newKey = sanitizeSchemaKey(key);
    if (newKey !== key) rename.set(key, newKey);
    nextSchemas[newKey] = value;
  }

  if (rename.size === 0) return doc;

  if (components) components.schemas = nextSchemas;

  const rewriteRef = (ref: string): string => {
    const prefix = "#/components/schemas/";
    if (!ref.startsWith(prefix)) return ref;
    const tail = ref.slice(prefix.length);
    let decoded: string;
    try {
      decoded = decodeURIComponent(tail);
    } catch {
      decoded = tail;
    }
    const mapped = rename.get(decoded);
    if (!mapped) return ref;
    return `${prefix}${mapped}`;
  };

  const walkRefs = (n: unknown): void => {
    if (n === null || typeof n !== "object") return;
    if (Array.isArray(n)) {
      for (const item of n) walkRefs(item);
      return;
    }
    const o = n as Record<string, unknown>;
    if (typeof o.$ref === "string") {
      o.$ref = rewriteRef(o.$ref);
    }
    for (const v of Object.values(o)) walkRefs(v);
  };

  walkRefs(doc);
  return doc;
}

function prepareOpenApiFromSwaggerPath(swaggerPath: string): Record<string, unknown> {
  const raw = JSON.parse(readFileSync(swaggerPath, "utf8")) as Record<string, unknown>;
  upgradeNullOnlyTypes(raw);
  return normalizeInvalidSchemaKeys(raw);
}

const openApiSpec = prepareOpenApiFromSwaggerPath(join(__dirname, "swagger.json"));

export default defineConfig({
  api: {
    input: {
      // A string path is validated before `override.transformer`; pass a normalized object so
      // invalid schema names are fixed before Orval's component-key check.
      target: openApiSpec,
    },
    output: {
      target: "./src/generated/api/index.ts",
      schemas: "./src/generated/api/models",
      client: "react-query",
      httpClient: "axios",
      /** One folder per OpenAPI tag (e.g. `auth/auth.ts`, `user/user.ts`). */
      mode: "tags-split",
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/api-client.ts",
          name: "apiClient",
        },
        query: {
          useMutation: true,
          version: 5,
        },
      },
    },
  },
});
