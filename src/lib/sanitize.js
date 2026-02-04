

import DOMPurify from 'isomorphic-dompurify';


const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
];


const PATH_TRAVERSAL_PATTERNS = [
  /\.\.(\\|\/)/g,
  /~.*/g,
];


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


export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';


  return text.replace(/<[^>]*>/g, '').trim();
}


export function sanitizeAttribute(value) {
  if (!value || typeof value !== 'string') return '';


  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}


export function containsSQLInjection(input) {
  if (!input || typeof input !== 'string') return false;

  return SQL_PATTERNS.some(pattern => pattern.test(input));
}


export function containsPathTraversal(input) {
  if (!input || typeof input !== 'string') return false;

  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}


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

      const sanitizedKey = sanitizeText(key);
      sanitized[sanitizedKey] = deep ? sanitizeObject(value, options) : value;
    }
    return sanitized;
  }

  return obj;
}


export function withSanitization(handler, options = {}) {
  return async function(request, ...args) {

    if (request.json) {
      const originalJson = request.json.bind(request);
      request.json = async function() {
        const body = await originalJson();
        return sanitizeObject(body, options);
      };
    }


    const url = new URL(request.url);
    url.searchParams.forEach((value, key) => {
      if (containsSQLInjection(value) || containsPathTraversal(value)) {
        throw new Error(`Potentially dangerous input detected in parameter: ${key}`);
      }
    });

    return handler(request, ...args);
  };
}


export function escapeRegExp(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

const sanitizeModule = {
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

export default sanitizeModule;
