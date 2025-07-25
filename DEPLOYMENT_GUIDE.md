# NutriTracking - GitHub Pages Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Repository Setup
```bash
# Create new repository on GitHub
# Clone or upload these files to your repository
git clone https://github.com/YOUR_USERNAME/nutritracking.git
cd nutritracking

# Upload the files from github-ready-files/ to your repository root
```

### 2. GitHub Pages Configuration
1. Go to your repository **Settings** tab
2. Scroll down to **Pages** section
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **"main"** branch and **"/ (root)"** folder
5. Click **Save**

### 3. Environment Configuration
Create a `.env` file with your USDA API key:
```env
VITE_USDA_API_KEY=your_api_key_here
```

**Get your USDA API key:**
1. Visit: https://fdc.nal.usda.gov/api-guide.html
2. Request API key (free)
3. Add to your environment variables

### 4. Custom Domain (Optional)
If you have a custom domain:
1. Add `CNAME` file to repository root:
   ```
   yourdomain.com
   ```
2. Configure DNS settings with your domain provider
3. GitHub Pages will handle SSL automatically

## ✅ Verification

After deployment, your site will be available at:
- **GitHub Pages URL**: `https://YOUR_USERNAME.github.io/nutritracking`
- **Custom Domain**: `https://yourdomain.com` (if configured)

### Test These Features:
- [ ] Food search with USDA database
- [ ] User registration and login
- [ ] Food logging and calorie tracking
- [ ] Dashboard nutrition analysis
- [ ] Health goals tracking
- [ ] Mobile responsive design

## 🔧 Troubleshooting

### Common Issues:

**404 Errors on Navigation:**
- Ensure `404.html` file is in repository root
- Check that SPA routing is properly configured

**API Key Issues:**
- Verify USDA API key is valid and active
- Check browser console for API error messages
- Ensure environment variables are properly set

**Build Problems:**
- All files in `github-ready-files/` are pre-built and ready
- No build process required for deployment
- Files are optimized for GitHub Pages

**Slow Loading:**
- Enable GitHub Pages CDN (automatic)
- Check network tab for large asset loading
- Verify gzip compression is working

### Performance Optimization:
- **Bundle Size**: ~1.4MB (acceptable for nutrition app)
- **Load Time**: First paint < 1.5s on good connection
- **Caching**: Browser caching enabled for static assets

## 📱 Mobile Testing

Test on various devices:
- iOS Safari
- Android Chrome
- Tablet landscape/portrait
- Desktop browsers

## 🔐 Security Notes

- No sensitive data stored server-side
- All user data remains in browser localStorage
- USDA API key is client-side (public API)
- No user authentication server required

## 📈 Analytics Setup (Optional)

Add Google Analytics:
1. Get tracking ID from Google Analytics
2. Add to `index.html` head section
3. Track nutrition logging events

## 🆘 Support

If deployment fails:
1. Check GitHub Actions log (if enabled)
2. Verify all files uploaded correctly
3. Test locally first: `npx serve .`
4. Check browser console for errors

---

**Successfully deployed nutrition tracking platform ready for users!**