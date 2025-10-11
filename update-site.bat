@echo on
echo Updating site for Vercel (vercel-version)...
cd /d "%~dp0\vercel-version"
git add --all
git commit -m "Update site (visual & multilingual)"
git push origin main
echo Done.
pause
