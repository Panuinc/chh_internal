/**
 * Input Sanitization Utility
 * ป้องกัน XSS และ sanitize ข้อมูลที่รับมาจาก user
 */

import DOMPurify from 'isomorphic-dompurify';

// ตัวอักษรที่อันตรายสำหรับ SQL Injection
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
];

// ตัวอักษรที่อันตรายสำหรับ Path Traversal
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.(\\|\/)/g,  // ../ or ..\
  /~\//g,           // ~/
];

/**
 * Sanitize HTML content
 * @param {string} html - HTML string ที่ต้องการ sanitize
 * @returns {string} - HTML ที่ปลอดภัย
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text (ลบ HTML tags ทั้งหมด)
 * @param {string} text - ข้อความที่ต้องการ sanitize
 * @returns {string} - ข้อความ plain text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  // ลบ HTML tags
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize สำหรับใช้ใน HTML attribute
 * @param {string} value - ค่าที่ต้องการ sanitize
 * @returns {string} - ค่าที่ปลอดภัย
 */
export function sanitizeAttribute(value) {
  if (!value || typeof value !== 'string') return '';
  
  // แปลง special characters เป็น HTML entities
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * ตรวจสอบ SQL Injection patterns
 * @param {string} input - ข้อความที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าพบ patterns ที่น่าสงสัย
 */
export function containsSQLInjection(input) {
  if (!input || typeof input !== 'string') return false;
  
  return SQL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * ตรวจสอบ Path Traversal patterns
 * @param {string} input - path ที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าพบ patterns ที่น่าสงสัย
 */
export function containsPathTraversal(input) {
  if (!input || typeof input !== 'string') return false;
  
  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Sanitize object ทั้งก้อน (recursive)
 * @param {*} obj - object ที่ต้องการ sanitize
 * @param {Object} options - { allowHTML: boolean, deep: boolean }
 * @returns {*} - object ที่ผ่านการ sanitize
 */
export function sanitizeObject(obj, options = {}) {
  const { allowHTML = false, deep = true } = options;
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    if (allowHTML) {
      return sanitizeHTML(obj);
    }
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deep ? sanitizeObject(item, options) : sanitizeText(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key ด้วย
      const sanitizedKey = sanitizeText(key);
      sanitized[sanitizedKey] = deep ? sanitizeObject(value, options) : value;
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware สำหรับ sanitize request body
 * @param {Function} handler - API handler
 * @param {Object} options - options สำหรับ sanitize
 */
export function withSanitization(handler, options = {}) {
  return async function(request, ...args) {
    // Clone request เพื่อแก้ไข body
    if (request.json) {
      const originalJson = request.json.bind(request);
      request.json = async function() {
        const body = await originalJson();
        return sanitizeObject(body, options);
      };
    }
    
    // Sanitize query parameters
    const url = new URL(request.url);
    url.searchParams.forEach((value, key) => {
      if (containsSQLInjection(value) || containsPathTraversal(value)) {
        throw new Error(`Potentially dangerous input detected in parameter: ${key}`);
      }
    });
    
    return handler(request, ...args);
  };
}

/**
 * Escape string สำหรับใช้ใน Regular Expression
 * @param {string} string - ข้อความที่ต้องการ escape
 * @returns {string} - ข้อความที่ escape แล้ว
 */
export function escapeRegExp(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ตรวจสอบ email format
 * @param {string} email - email ที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็น valid email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ตรวจสอบว่าเป็นค่าว่างหรือไม่ (null, undefined, empty string, whitespace only)
 * @param {*} value - ค่าที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นค่าว่าง
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeAttribute,
  sanitizeObject,
  containsSQLInjection,
  containsPathTraversal,
  withSanitization,
  escapeRegExp,
  isValidEmail,
  isEmpty,
};
