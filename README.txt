Computer Master Ivan — final package (Vercel + GitHub Pages)
Files:
- vercel-version/  -> ready to push to your repository root and deploy on Vercel
- github-version/docs/ -> ready for GitHub Pages (use docs/ as Pages source) 
- update-site.bat -> script that helps commit & push vercel-version (adapt path as needed)
- deploy-gh.bat -> script to deploy docs/ to gh-pages branch (run in repo root)
How to use (Vercel):
1) Unzip and copy contents of vercel-version/* into your project folder (replace existing files).
2) From project folder: git add . && git commit -m "site update" && git push
3) Vercel will auto-deploy. If not, go to Vercel dashboard and Redeploy.
How to use (GitHub Pages):
1) Copy github-version/docs/ to your repo as /docs
2) Commit and push to GitHub. In repository settings -> Pages, set Source to 'gh-pages' branch or 'docs/' folder on main branch.
Notes:
- Images are optimized for web (JPEG quality ~80).
- To enable analytics, open index.html and insert GA/YM snippets at the top of the <head> where indicated.
- If you want me to push files directly to your repository, tell me and I will provide step-by-step guidance.
