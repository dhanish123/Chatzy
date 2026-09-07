import { showToast } from '../components/Toast';

/**
 * Format error message from API response or error object
 * Converts technical errors into user-friendly messages
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // Handle API response errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Server error with custom message
    if (data?.message) {
      return data.message;
    }

    // Network/HTTP status based errors
    switch (status) {
      case 400:
        return data?.error || 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with an existing record.';
      case 422:
        return data?.error || 'Invalid data provided.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `An error occurred (${status}). Please try again.`;
    }
  }

  // Handle network errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection.';
  }

  if (error.message === 'Network Error' || error.code === 'ENOTFOUND') {
    return 'Network connection failed. Please check your internet.';
  }

  // Handle error messages
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Show error message as toast notification
 */
export const showErrorToast = (error, customMessage) => {
  const message = customMessage || formatErrorMessage(error);
  showToast(message, 'error');
};

/**
 * Show success toast
 */
export const showSuccessToast = (message = 'Success!') => {
  showToast(message, 'success');
};

/**
 * Show warning toast
 */
export const showWarningToast = (message) => {
  showToast(message, 'warning');
};

/**
 * Show info toast
 */
export const showInfoToast = (message) => {
  showToast(message, 'info');
};

/**
 * Check if an error is retryable (network, timeout, server 5xx)
 */
export const isRetryable = (error) => {
  if (!error) return false;

  // Network errors are retryable
  if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
    return true;
  }

  if (error.response) {
    const status = error.response.status;
    // Retry on 5xx server errors or 429 too many requests
    return status >= 500 || status === 429;
  }

  return true; // Assume network errors are retryable
};

/**
 * Retry a failed operation with exponential backoff
 */
export const retryOperation = async (operation, maxRetries = 3, delayMs = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error) || attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = delayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handle common API error scenarios
 * Usage: handleAPIError(error, 'Failed to load data', () => retry())
 */
export const handleAPIError = (error, defaultMessage = 'An error occurred', onRetry) => {
  const message = formatErrorMessage(error);
  const canRetry = isRetryable(error);

  showErrorToast(error, message);

  return {
    message,
    canRetry,
    retry: onRetry
  };
};

export default {
  formatErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  isRetryable,
  retryOperation,
  handleAPIError
};
