import crypto from 'crypto';

// Generate a CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to set CSRF token cookie
export const csrfProtection = (req, res, next) => {
  const token = generateCSRFToken();
  
  // Set CSRF token as a cookie (httpOnly is false so client can read it)
  res.cookie('csrf_token', token, {
    httpOnly: false, // Client needs to read this to send in headers
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Add token to response for easy client access
  res.locals.csrfToken = token;
  next();
};

// Middleware to validate CSRF token
export const validateCSRFToken = (req, res, next) => {
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];
  
  // Skip validation for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Validate CSRF token for state-changing methods
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'CSRF token validation failed'
    });
  }
  
  next();
};