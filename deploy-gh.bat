@echo on
echo Deploying docs/ to gh-pages branch...
setlocal enabledelayedexpansion
cd /d "%~dp0"
if not exist ".git" (
  echo This script must be run in a git repository root.
  pause
  exit /b 1
)
git add docs -A
git commit -m "Deploy site to GitHub Pages (docs)"
git push origin HEAD:gh-pages --force
echo Deployed to gh-pages branch. Enable GitHub Pages source = gh-pages branch if needed.
pause
