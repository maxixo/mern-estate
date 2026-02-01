// Utility to get CSRF token from cookie
export const getCSRFToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrf_token=`);
  
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// Fetch CSRF token from server
export const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/auth/csrf', {
      credentials: 'include',
    });
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Enhanced fetch wrapper that includes CSRF token for state-changing requests
export const secureFetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add CSRF token for state-changing requests
  if (isStateChanging) {
    let csrfToken = getCSRFToken();
    
    // If no CSRF token exists, fetch one from the server
    if (!csrfToken) {
      try {
        csrfToken = await fetchCSRFToken();
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    }
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};
