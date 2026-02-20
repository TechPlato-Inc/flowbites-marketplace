/**
 * Simple HTML sanitizer to prevent XSS attacks
 * This is a basic implementation - for production, consider using DOMPurify with proper SSR setup
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Remove potentially dangerous tags and attributes
  const dangerousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /<form[^>]*>[\s\S]*?<\/form>/gi,
    /<input[^>]*>/gi,
    /<textarea[^>]*>[\s\S]*?<\/textarea>/gi,
    /<button[^>]*>[\s\S]*?<\/button>/gi,
    /<select[^>]*>[\s\S]*?<\/select>/gi,
    /<option[^>]*>[\s\S]*?<\/option>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // event handlers
    /javascript:/gi,
    /data:/gi,
  ];
  
  let sanitized = html;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}
