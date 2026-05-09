/**
 * Quill Content Sanitization Utility
 * 
 * Mitigates CVE-2021-3163 by sanitizing rich text content
 * before rendering or storage.
 * 
 * Usage:
 *   import { sanitizeQuillContent } from '@/lib/quillSecurity';
 *   const safe = sanitizeQuillContent(userContent);
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize Quill editor output to prevent XSS attacks
 * @param {string} htmlContent - Raw HTML from Quill editor
 * @returns {string} Sanitized HTML safe for display/storage
 */
export const sanitizeQuillContent = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  return DOMPurify.clean(htmlContent, {
    // Allowed HTML tags for rich text
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong',
      'p', 'br',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a',
      'blockquote',
      'code', 'pre',
      'img'
    ],
    // Allowed attributes
    ALLOWED_ATTR: [
      'href',        // for links
      'target',      // for link targets
      'title',       // for tooltips
      'alt',         // for images
      'src',         // for images (restricted below)
      'width',
      'height'
    ],
    // Keep text content if tags are stripped
    KEEP_CONTENT: true,
    // No data attributes for security
    ALLOW_DATA_ATTR: false,
    // Custom validators for dangerous attributes
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|blob|data):|[^a-z]|[a-z+.\-]*(?:[^a-z+.\-:]|$))/i,
  });
};

/**
 * Sanitize just plain text to prevent HTML injection
 * @param {string} text - Plain text input
 * @returns {string} Escaped text safe for HTML context
 */
export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Validate image URLs to prevent malicious image URLs
 * @param {string} src - Image source URL
 * @returns {boolean} Whether the URL is safe to load
 */
export const isValidImageUrl = (src) => {
  if (!src || typeof src !== 'string') {
    return false;
  }

  // Whitelist safe protocols
  const safeProtocols = ['https:', 'http:', 'data:', 'blob:'];
  try {
    const url = new URL(src, window.location.origin);
    return safeProtocols.includes(url.protocol);
  } catch {
    // data: and blob: URLs don't parse as full URLs
    return src.startsWith('data:') || src.startsWith('blob:');
  }
};

/**
 * Content Security Policy compliance check
 * @param {string} htmlContent - HTML to check
 * @returns {boolean} Whether content is CSP-compliant
 */
export const isCSPCompliant = (htmlContent) => {
  if (!htmlContent) {
    return true;
  }

  // Check for inline scripts (not allowed in CSP)
  const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/gi;
  const onEventPattern = /\son\w+\s*=/gi;

  return !scriptPattern.test(htmlContent) && !onEventPattern.test(htmlContent);
};

/**
 * Strip all HTML and return plain text
 * @param {string} htmlContent - HTML content
 * @returns {string} Plain text
 */
export const stripHtml = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};