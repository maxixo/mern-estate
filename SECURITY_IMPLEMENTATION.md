# Security Implementation Documentation

## Overview
This document describes the security enhancements implemented to protect the MERN Estate application from common web vulnerabilities.

## Security Improvements Implemented

### 1. CORS Configuration (`api/index.js`)

**Purpose**: Control which domains can access your API.

**Implementation**:
- Configured strict CORS settings
- Production: Only allows requests from `https://soul-estate.up.railway.app`
- Development: Allows requests from `http://localhost:5173`
- Credentials enabled for cookie-based authentication
- Allowed headers include Content-Type, Authorization, and X-CSRF-Token

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://soul-estate.up.railway.app'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 204
};
```

### 2. Secure Cookie Settings (`api/controllers/auth.controller.js`)

**Purpose**: Protect authentication cookies from XSS and ensure HTTPS-only transmission.

**Changes Made**:
- Added `httpOnly: true` - Prevents JavaScript from accessing cookies (XSS protection)
- Added `secure: true` in production - Ensures cookies only sent over HTTPS
- Added `sameSite: 'none'` in production - Allows cross-site requests with proper security
- Added `sameSite: 'lax'` in development - Standard security for local development

**Applied to**:
- Sign-in function
- Google OAuth function
- Sign-out function (cookie clearing)

### 3. CSRF Protection

**Purpose**: Prevent Cross-Site Request Forgery attacks.

**Implementation Details**:

#### Backend (`api/utils/csrf.js`):
- `csrfProtection` middleware generates and sets CSRF tokens
- `validateCSRFToken` middleware validates tokens for state-changing requests
- Tokens stored in non-httpOnly cookie (so client can read them)
- 24-hour token expiration
- GET, HEAD, OPTIONS requests exempt from validation

#### Routes Protected:
- **User routes**: Update and Delete operations
- **Listing routes**: Create, Update, and Delete operations
- **Auth routes**: Exempted (signup, signin, google) to allow initial authentication
- New `/api/auth/csrf` endpoint to fetch CSRF tokens

#### Client-side (`client/src/lib/csrf.js`):
- `getCSRFToken()` - Extracts token from cookies
- `fetchCSRFToken()` - Fetches new token from server
- `secureFetch()` - Wrapper that automatically adds CSRF token to state-changing requests

### 4. Client-Side Security Updates

**Updated Files**:
- `Profile.jsx` - All fetch calls now use secureFetch
- `CreateListing.jsx` - POST requests use secureFetch
- `UpdateListing.jsx` - POST requests use secureFetch

**Benefits**:
- Automatic CSRF token inclusion
- Automatic credentials inclusion
- Consistent security across all API calls

## Security Threats Mitigated

### 1. Cross-Site Scripting (XSS)
**Mitigation**: httpOnly cookies prevent JavaScript access to authentication tokens

### 2. Cross-Site Request Forgery (CSRF)
**Mitigation**: CSRF tokens validate that requests originate from your application

### 3. Man-in-the-Middle Attacks
**Mitigation**: Secure flag ensures cookies only transmitted over HTTPS in production

### 4. Unauthorized Cross-Origin Requests
**Mitigation**: Strict CORS configuration limits which domains can access your API

## Environment Variables Required

Make sure these are set in your Railway environment:

```
NODE_ENV=production
MONGO=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_BUCKET_ID=your_appwrite_bucket_id
```

## Deployment Checklist

Before deploying to production:

1. ✅ Set `NODE_ENV=production` in Railway
2. ✅ Verify HTTPS is enabled on Railway (automatic)
3. ✅ Update CORS origin to your production domain (already done)
4. ✅ Ensure all environment variables are set
5. ✅ Test authentication flow
6. ✅ Test listing creation, update, and deletion
7. ✅ Verify CSRF tokens are being sent correctly

## Testing CSRF Protection

### Manual Testing:
1. Sign in to your application
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to create/update/delete a listing
5. Check request headers for `X-CSRF-Token`
6. If token is missing, you should receive 403 Forbidden

### To Test CSRF is Working:
```bash
# This should fail with 403
curl -X POST https://your-api.com/api/listing/create \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' \
  --cookie "access_token=your_token"
```

## Important Notes

### Why Signup/Signin Are Exempt from CSRF
Initial authentication endpoints cannot be protected by CSRF because the user doesn't have a session yet. This is a standard practice and doesn't compromise security.

### sameSite='none' Explained
Setting `sameSite='none'` in production is necessary because your frontend and backend are on different domains (Railway app vs API). When combined with `secure: true`, this is secure.

### Cookie Security Best Practices
- Never store sensitive data in localStorage/sessionStorage
- Use httpOnly cookies for authentication tokens
- Always use secure cookies in production
- Implement proper CSRF protection for state-changing operations
- Use sameSite cookies to limit cross-site request exposure

## Troubleshooting

### Issue: 403 Forbidden Errors
**Cause**: Missing CSRF token
**Solution**: Ensure all state-changing requests use `secureFetch` wrapper

### Issue: Cookies Not Being Sent
**Cause**: Missing credentials: 'include'
**Solution**: Use `secureFetch` which automatically includes credentials

### Issue: CORS Errors in Production
**Cause**: Origin not whitelisted or NODE_ENV not set
**Solution**: 
1. Verify NODE_ENV=production is set
2. Check that your production URL is in the CORS origin list

### Issue: Authentication Not Persisting
**Cause**: Cookie settings incompatible with cross-domain setup
**Solution**: Ensure `sameSite: 'none'` and `secure: true` in production

## Additional Security Recommendations

### Future Enhancements:
1. Implement rate limiting on authentication endpoints
2. Add password complexity requirements
3. Implement account lockout after failed login attempts
4. Add email verification for new accounts
5. Implement content security policy (CSP) headers
6. Add security headers (HSTS, X-Frame-Options, etc.)
7. Regular security audits and dependency updates

### Monitoring:
1. Set up logging for failed authentication attempts
2. Monitor for suspicious activity patterns
3. Implement alerting for potential security breaches

## Support

For questions or issues related to security implementation:
- Review the code changes in git history
- Check browser DevTools Network tab for detailed error information
- Verify server logs for security-related errors

## Summary

This implementation provides a strong security foundation by:
- ✅ Protecting against XSS with httpOnly cookies
- ✅ Preventing CSRF attacks with token validation
- ✅ Ensuring HTTPS-only cookie transmission in production
- ✅ Restricting cross-origin access with CORS
- ✅ Maintaining compatibility with cross-domain deployment

The security measures are production-ready and follow industry best practices for modern web applications.