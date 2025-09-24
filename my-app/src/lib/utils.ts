/**
 * Utility functions for the AI Teacher Assistant application
 */

/**
 * Formats file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates if a file is a PDF based on its type
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Validates file size against a maximum limit
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Validates if student answers contain sufficient content
 */
export function validateStudentAnswers(answers: string): { isValid: boolean; message?: string } {
  const trimmed = answers.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Student answers are required' };
  }
  
  if (trimmed.length < 10) {
    return { isValid: false, message: 'Please provide more detailed student answers' };
  }
  
  return { isValid: true };
}

/**
 * Formats analysis results for display
 */
export function formatAnalysisResults(results: any): {
  misconceptions: string[];
  slideWeaknesses: string[];
  improvements: string[];
  summary: string;
} {
  return {
    misconceptions: Array.isArray(results.misconceptions) ? results.misconceptions : [],
    slideWeaknesses: Array.isArray(results.slideWeaknesses) ? results.slideWeaknesses : [],
    improvements: Array.isArray(results.improvements) ? results.improvements : [],
    summary: typeof results.summary === 'string' ? results.summary : 'No summary available'
  };
}

/**
 * Debounce function for reducing API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}