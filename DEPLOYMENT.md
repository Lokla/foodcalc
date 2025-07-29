# GitHub Pages Deployment

## Automatic Deployment
This project is configured for automatic deployment to GitHub Pages when you push to the `main` branch.

## Manual Deployment
If you need to deploy manually:

```bash
# Build for GitHub Pages
npm run github-build

# The built files will be in dist/foodcalc/browser/
# Deploy these files to your GitHub Pages repository
```

## Configuration
- **Base href**: `/foodcalc/` (configured in angular.json)
- **Output directory**: `dist/foodcalc/browser/`
- **GitHub Actions**: Automatically deploys on push to main branch

## Troubleshooting
If you get 404 errors for JS/CSS files:
1. Make sure the base href is set correctly to `/foodcalc/`
2. Verify that files are deployed to the correct GitHub Pages repository path
3. Check that the repository name matches the base href path

The base href ensures that all asset paths are relative to `https://lokla.github.io/foodcalc/` instead of the root domain.
