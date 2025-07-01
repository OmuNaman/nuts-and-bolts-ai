# Deployment Guide for Vizuara AI Learning Lab

This guide explains how to deploy the Vizuara AI Learning Lab application properly on Vercel to ensure client-side routing works correctly.

## Prerequisites

- A [Vercel](https://vercel.com) account
- Git repository with your project code

## Deployment Steps

### 1. Push your code to a Git repository

Make sure your code is pushed to GitHub, GitLab, or Bitbucket.

### 2. Import the project into Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: Vite
   - Root Directory: `./` (or specify the subdirectory where your project is located)
   - Build Command: `npm run build` or `bun run build`
   - Output Directory: `dist`

### 3. Advanced Settings

- Environment Variables: Add any required environment variables
- Build & Development Settings: Ensure Node.js version matches your requirements (version 20.x recommended)

### 4. Deployment Settings

Make sure the included `vercel.json` file is in your project root. This configuration redirects all routes to the main `index.html` file, enabling client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 5. Deploy

Click "Deploy" and wait for the build process to complete.

## Testing the Deployment

After deployment, verify that deep linking works correctly:

1. Visit the site's homepage
2. Navigate to any module (e.g., `/learning/self-attention`)
3. Refresh the page - it should not show a 404 error
4. Try accessing the URL directly - it should load properly

## Troubleshooting

If you encounter 404 errors when refreshing or directly accessing routes:

1. Double-check that the `vercel.json` file is in the project root
2. Verify the rewrites configuration in `vercel.json`
3. Ensure that the project is using client-side routing correctly
4. Check the Vercel deployment logs for any build or configuration errors

## Alternative Deployment Options

### Netlify

For deploying on Netlify, a `_redirects` file has been included in the `public` directory with the following content:

```
/* /index.html 200
```

This achieves the same routing configuration as the Vercel setup.

### GitHub Pages

GitHub Pages requires additional configuration with a 404.html file that redirects to index.html, plus some JavaScript in index.html to handle the routing. Consider using Vercel or Netlify for simpler deployment.
