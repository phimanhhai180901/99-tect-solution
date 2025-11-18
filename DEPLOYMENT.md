# Deployment Guide for Problem 2

This guide will help you deploy the React app from the `problem2` folder to GitHub Pages.

## 📋 What Has Been Configured

✅ **Vite Configuration** (`problem2/vite.config.ts`)
   - Set base path to `/99-tect-solution/` for GitHub Pages
   - Configured build output directory

✅ **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Automatically builds and deploys when you push to main branch
   - Only triggers on changes to `problem2/` directory
   - Deploys only the React app from problem2 folder

✅ **Documentation**
   - Updated `problem2/README.md` with deployment info
   - Created root `README.md` with project overview
   - Added `.gitignore` for the repository

✅ **Package Scripts**
   - Added `deploy` script to `problem2/package.json`

## 🚀 How to Deploy

### Step 1: Commit and Push Your Changes

```bash
# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Configure GitHub Pages deployment for problem2"

# Push to main branch
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/phimanhhai180901/99-tect-solution
2. Click on **Settings** tab
3. Click on **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### Step 3: Wait for Deployment

- GitHub Actions will automatically build and deploy your app
- You can monitor the progress in the **Actions** tab of your repository
- The deployment typically takes 2-3 minutes

### Step 4: Access Your Live App

Once deployed, your app will be available at:

🌐 **https://phimanhhai180901.github.io/99-tect-solution/**

## 🔄 Future Updates

After the initial setup, any changes you push to the `problem2/` folder will automatically trigger a new deployment:

```bash
# Make your changes to problem2/
# Then commit and push
git add problem2/
git commit -m "Update crypto swap form"
git push origin main
```

The GitHub Actions workflow will:
- ✅ Only deploy when changes are made to `problem2/`
- ✅ Skip deployment for changes to `problem1/` or `problem3/`
- ✅ Build and deploy automatically

## 🛠️ Manual Deployment (Optional)

If you prefer to deploy manually using gh-pages:

```bash
cd problem2

# Install gh-pages (one-time only)
npm install --save-dev gh-pages

# Deploy manually
npm run deploy
```

## 📊 Monitoring Deployments

- View deployment status: https://github.com/phimanhhai180901/99-tect-solution/actions
- Each deployment creates a new workflow run
- Green checkmark = successful deployment
- Red X = deployment failed (check logs)

## ⚠️ Troubleshooting

**Problem:** Deployment fails with "Failed to fetch"
- **Solution:** Make sure GitHub Pages is enabled in repository settings

**Problem:** 404 error when accessing the site
- **Solution:** Verify the base path in `vite.config.ts` matches your repo name

**Problem:** Changes not reflecting
- **Solution:** Clear browser cache or wait a few minutes for CDN to update

## 📝 Important Files

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `problem2/vite.config.ts` - Vite configuration with base path
- `problem2/package.json` - Build scripts
- `.gitignore` - Files to ignore in git

## ✨ Next Steps

1. Commit and push the changes
2. Enable GitHub Pages in repository settings
3. Wait for the first deployment
4. Share your live link! 🎉

---

**Need help?** Check the GitHub Actions logs in the Actions tab for detailed error messages.

