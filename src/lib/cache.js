/**
 * Caching Utility
 * ใช้สำหรับ cache ข้อมูลที่ไม่เปลี่ยนบ่อย
 */

import { unstable_cache } from 'next/cache';
import { CACHE } from '@/config/app.config';

// In-memory cache สำหรับข้อมูลที่ไม่ต้องการให้ Next.js cache
const memoryCache = new Map();

/**
 * ดึงข้อมูลจาก cache
 * @param {string} key - cache key
 * @returns {*} - ข้อมูลที่เก็บไว้ หรือ undefined ถ้าไม่มี
 */
export function getCache(key) {
  const item = memoryCache.get(key);
  
  if (!item) return undefined;
  
  // ตรวจสอบว่าหมดอายุหรือยัง
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return undefined;
  }
  
  return item.value;
}

/**
 * บันทึกข้อมูลลง cache
 * @param {string} key - cache key
 * @param {*} value - ข้อมูลที่ต้องการเก็บ
 * @param {number} ttlSeconds - เวลาหมดอายุ (วินาที)
 */
export function setCache(key, value, ttlSeconds = CACHE.REVALIdate_MEDIUM) {
  memoryCache.set(key, {
    value,
    expiry: Date.now() + (ttlSeconds * 1000),
  });
}

/**
 * ลบข้อมูลจาก cache
 * @param {string} key - cache key
 */
export function deleteCache(key) {
  memoryCache.delete(key);
}

/**
 * ล้าง cache ทั้งหมด
 */
export function clearCache() {
  memoryCache.clear();
}

/**
 * ดึงข้อมูลพร้อม cache logic
 * @param {string} key - cache key
 * @param {Function} fetcher - ฟังก์ชันดึงข้อมูล
 * @param {number} ttlSeconds - เวลาหมดอายุ
 * @returns {*} - ข้อมูล
 */
export async function getOrSetCache(key, fetcher, ttlSeconds = CACHE.REVALIdate_MEDIUM) {
  const cached = getCache(key);
  if (cached !== undefined) {
    return cached;
  }
  
  const value = await fetcher();
  setCache(key, value, ttlSeconds);
  return value;
}

/**
 * Cache function wrapper (ใช้กับ BC Client)
 * @param {Function} fn - ฟังก์ชันที่ต้องการ cache
 * @param {string} tag - cache tag สำหรับ revalidate
 * @param {number} revalidateSeconds - เวลา revalidate
 * @returns {Function} - ฟังก์ชันที่มี cache
 */
export function withCache(fn, tag, revalidateSeconds = CACHE.BC_ITEMS_TTL) {
  return unstable_cache(
    async (...args) => {
      return fn(...args);
    },
    [tag],
    {
      revalidate: revalidateSeconds,
      tags: [tag],
    }
  );
}

/**
 * Revalidate cache ตาม tag
 * @param {string} tag - cache tag
 */
export async function revalidateTag(tag) {
  const { revalidateTag: nextRevalidateTag } = await import('next/cache');
  await nextRevalidateTag(tag);
}

/**
 * Revalidate path
 * @param {string} path - path ที่ต้องการ revalidate
 */
export async function revalidatePath(path) {
  const { revalidatePath: nextRevalidatePath } = await import('next/cache');
  await nextRevalidatePath(path);
}

/**
 * Cache tags ที่ใช้ในระบบ
 */
export const CACHE_TAGS = {
  // BC Data
  BC_ITEMS: 'bc-items',
  BC_ORDERS: 'bc-orders',
  BC_CUSTOMERS: 'bc-customers',
  
  // HR Data
  HR_EMPLOYEES: 'hr-employees',
  HR_DEPARTMENTS: 'hr-departments',
  HR_PERMISSIONS: 'hr-permissions',
  
  // Security Data
  SECURITY_VISITORS: 'security-visitors',
  SECURITY_PATROLS: 'security-patrols',
  
  // Warehouse Data
  WAREHOUSE_PACKING: 'warehouse-packing',
  WAREHOUSE_SUPPLY: 'warehouse-supply',
  WAREHOUSE_FINISHED_GOODS: 'warehouse-finished-goods',
  WAREHOUSE_RAW_MATERIAL: 'warehouse-raw-material',
};

/**
 * Cache Manager สำหรับจัดการ cache ใน module ต่างๆ
 */
export class CacheManager {
  constructor(prefix = '') {
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
    // ล้างเฉพาะ key ที่มี prefix นี้
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
