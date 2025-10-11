# =====================================================
# AUTO DOWNLOAD + REPLACE IMAGES + VERIFY DEPLOY (VERCEL)
# =====================================================

Write-Host "🚀 Starting automatic image update..." -ForegroundColor Cyan
$projectPath = "C:\Users\user\Downloads\computer-master-ivan-full"
$publicPath = "$projectPath\public"
$logFile = "$projectPath\image-update-log.txt"
$siteUrl = "https://remontpc-ivan.vercel.app"

# Clean log
"==== START $(Get-Date) ====" | Out-File $logFile -Encoding utf8

# Ensure folder
if (-not (Test-Path $publicPath)) {
    New-Item -ItemType Directory -Force -Path $publicPath | Out-Null
    Write-Host "📁 Created public folder"
    "Created public folder" | Out-File $logFile -Append
}

# Image list
$images = @{
    "https://images.pexels.com/photos/4709372/pexels-photo-4709372.jpeg" = "hero-ru.jpg"
    "https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg" = "svc-repair-ru.jpg"
    "https://images.pexels.com/photos/4792737/pexels-photo-4792737.jpeg" = "svc-clean-ru.jpg"
    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952" = "svc-install-ru.jpg"
}

# Download images
foreach ($pair in $images.GetEnumerator()) {
    $url = $pair.Key
    $file = "$publicPath\$($pair.Value)"
    try {
        Write-Host "⬇️ Downloading $($pair.Value)..."
        Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing -TimeoutSec 60
        Write-Host "✅ Saved $file"
        "OK: $($pair.Value)" | Out-File $logFile -Append
    } catch {
        Write-Host "⚠️ Failed to download $($pair.Value): $($_.Exception.Message)" -ForegroundColor Yellow
        "FAIL: $($pair.Value) — $($_.Exception.Message)" | Out-File $logFile -Append
    }
}

# Create SVG logo
$logoSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <rect width="160" height="160" rx="25" fill="#0078D7"/>
  <path d="M45 50h70v60H45z" fill="white"/>
  <path d="M60 115h40v8H60z" fill="white"/>
  <circle cx="80" cy="80" r="10" fill="#0078D7"/>
  <text x="50%" y="92%" font-size="14" fill="white" font-family="Arial" text-anchor="middle">IVAN</text>
</svg>
"@
$logoSvg | Out-File "$publicPath\logo.svg" -Encoding utf8
Write-Host "🎨 Created logo.svg"
"Created logo.svg" | Out-File $logFile -Append

# Git commit + push
Set-Location $projectPath
git add --all
git commit -m "Auto-updated all images + logo for Vercel site" --allow-empty | Out-Null
git push -u origin main | Out-Null
Write-Host "🌍 Uploaded to GitHub — waiting for Vercel deploy..."
"Git push complete" | Out-File $logFile -Append

# Verify deployment
Write-Host "🕓 Checking site status..."
for ($i = 1; $i -le 10; $i++) {
    Start-Sleep -Seconds 20
    try {
        $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site is live! Images should now be visible."
            "DEPLOY OK: $siteUrl" | Out-File $logFile -Append
            Start-Process $siteUrl
            break
        }
    } catch {
        Write-Host "⏳ Waiting... ($i/10)"
    }
    if ($i -eq 10) {
        Write-Host "⚠️ Timeout — site didn't respond 200 OK. Check manually after a minute."
        "DEPLOY TIMEOUT" | Out-File $logFile -Append
    }
}

"==== END $(Get-Date) ====" | Out-File $logFile -Append
Write-Host "📘 Log saved to: $logFile"
Pause
