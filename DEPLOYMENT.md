# Frontend Deployment Guide

## Environment Variables Required

Create a `.env` file or set these in your deployment platform:

```bash
# Required for Stripe payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Optional - Backend API URL (defaults to Railway in production)
VITE_API_URL=https://your-backend-domain.up.railway.app/api/
```

## Docker Deployment

The Dockerfile is configured for production deployment:

1. **Build the image:**
   ```bash
   docker build -t ecommerce-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 80:80 \
     -e VITE_STRIPE_PUBLISHABLE_KEY=your_key \
     ecommerce-frontend
   ```

## Vercel/Netlify Deployment

1. Set environment variables in your platform dashboard
2. Build command: `npm run build`
3. Output directory: `dist`
4. Install command: `npm install`

## Notes

- The app uses Vite for building
- Production build is served via nginx
- SPA routing is handled by nginx configuration
- Backend URL automatically switches between localhost (dev) and Railway (prod)
