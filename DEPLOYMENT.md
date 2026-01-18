# Deployment Guide

## Deploying to Vercel (Recommended)

This WWII Learning Webapp is a static site that deploys perfectly to Vercel without Docker.

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from your project directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Login to your Vercel account
   - Confirm project settings
   - Deploy!

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub** (already done!)

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Vercel will automatically**:
   - Detect it's a static site
   - Deploy all files
   - Provide you with a live URL
   - Auto-deploy on every push to main branch

### Configuration

The `vercel.json` file includes:
- ✅ Clean URLs (no .html extensions)
- ✅ Security headers (XSS protection, frame protection)
- ✅ Service worker caching rules
- ✅ Optimized static file serving

### Expected Deployment

- **Build Time**: ~10 seconds (no build needed, just file upload)
- **URL**: `https://your-project-name.vercel.app`
- **Custom Domain**: Can be added in Vercel dashboard
- **SSL**: Automatically included
- **CDN**: Globally distributed

## Why Not Docker?

- ✅ **Static Site**: No server-side processing needed
- ✅ **No Build Step**: Pure HTML/CSS/JS
- ✅ **Better Performance**: Vercel's CDN is optimized for static files
- ✅ **Zero Config**: Works out of the box
- ✅ **Faster**: No container startup time
- ✅ **Cheaper**: Free tier is generous for static sites

Docker would add unnecessary complexity and cost without any benefits for this use case.

## Alternative: Docker Deployment (Not Recommended)

If you absolutely need Docker (e.g., for Railway, Render, or self-hosting), you can use a simple nginx container. However, this is **not recommended for Vercel** as Vercel doesn't support traditional Docker deployments.

For other platforms that support Docker:
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Service Worker Issues
If the service worker doesn't update:
- Clear browser cache
- Check the Cache-Control headers in vercel.json
- Unregister old service workers in DevTools

### CDN Assets
The app loads Three.js and globe textures from unpkg.com CDN. Ensure:
- No CORS issues (should work fine)
- CDN is accessible from deployment region

## Environment-Specific Configuration

For staging vs production:
1. Create separate Vercel projects
2. Use Vercel environment variables if needed
3. Configure custom domains per environment
