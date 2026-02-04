import { unstable_cache } from "next/cache";
import { CACHE } from "@/config/app.config";

const memoryCache = new Map();

export function getCache(key) {
  const item = memoryCache.get(key);

  if (!item) return undefined;

  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return undefined;
  }

  return item.value;
}

export function setCache(key, value, ttlSeconds = CACHE.REVALIdate_MEDIUM) {
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export function deleteCache(key) {
  memoryCache.delete(key);
}

export function clearCache() {
  memoryCache.clear();
}

export async function getOrSetCache(
  key,
  fetcher,
  ttlSeconds = CACHE.REVALIdate_MEDIUM,
) {
  const cached = getCache(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await fetcher();
  setCache(key, value, ttlSeconds);
  return value;
}

export function withCache(fn, tag, revalidateSeconds = CACHE.BC_ITEMS_TTL) {
  return unstable_cache(
    async (...args) => {
      return fn(...args);
    },
    [tag],
    {
      revalidate: revalidateSeconds,
      tags: [tag],
    },
  );
}

export async function revalidateTag(tag) {
  const { revalidateTag: nextRevalidateTag } = await import("next/cache");
  await nextRevalidateTag(tag);
}

export async function revalidatePath(path) {
  const { revalidatePath: nextRevalidatePath } = await import("next/cache");
  await nextRevalidatePath(path);
}

export const CACHE_TAGS = {
  BC_ITEMS: "bc-items",
  BC_ORDERS: "bc-orders",
  BC_CUSTOMERS: "bc-customers",

  HR_EMPLOYEES: "hr-employees",
  HR_DEPARTMENTS: "hr-departments",
  HR_PERMISSIONS: "hr-permissions",

  SECURITY_VISITORS: "security-visitors",
  SECURITY_PATROLS: "security-patrols",

  WAREHOUSE_PACKING: "warehouse-packing",
  WAREHOUSE_SUPPLY: "warehouse-supply",
  WAREHOUSE_FINISHED_GOODS: "warehouse-finished-goods",
  WAREHOUSE_RAW_MATERIAL: "warehouse-raw-material",
};

export class CacheManager {
  constructor(prefix = "") {
    this.prefix = prefix;
  }

  _getKey(key) {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  get(key) {
    return getCache(this._getKey(key));
  }

  set(key, value, ttlSeconds) {
    return setCache(this._getKey(key), value, ttlSeconds);
  }

  delete(key) {
    return deleteCache(this._getKey(key));
  }

  clear() {
    for (const [key] of memoryCache) {
      if (!this.prefix || key.startsWith(this.prefix)) {
        memoryCache.delete(key);
      }
    }
  }

  async getOrSet(key, fetcher, ttlSeconds) {
    return getOrSetCache(this._getKey(key), fetcher, ttlSeconds);
  }
}

export default {
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getOrSetCache,
  withCache,
  revalidateTag,
  revalidatePath,
  CACHE_TAGS,
  CacheManager,
};
