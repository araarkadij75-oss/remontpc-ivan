# auto-fix-vercel.ps1  (ASCII-only, tested for PowerShell 5.1+)
$ErrorActionPreference = 'Continue'

# project paths
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $projectPath) { $projectPath = (Get-Location).Path }
$publicPath  = Join-Path $projectPath 'public'
$logFile     = Join-Path $projectPath 'auto-fix-vercel.log'
$siteUrl     = 'https://remontpc-ivan.vercel.app'

function Log([string]$msg) {
    $t = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = $t + '  ' + $msg
    $line | Out-File -FilePath $logFile -Append -Encoding utf8
    Write-Host $msg
}

Log 'START auto-fix-vercel'

# ensure public folder
if (-not (Test-Path $publicPath)) {
    New-Item -ItemType Directory -Path $publicPath | Out-Null
    Log ("Created folder: " + $publicPath)
} else {
    Log ("Public folder exists: " + $publicPath)
}

# SVG assets (simple)
$svgMap = @{
    'logo.svg' = '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><circle cx="40" cy="40" r="25" fill="#0078D7"/><rect x="75" y="25" width="120" height="30" rx="8" fill="#eee"/><text x="85" y="47" font-size="14" font-family="Arial" fill="#333">Computer Master Ivan</text></svg>'
}

foreach ($k in $svgMap.Keys) {
    $path = Join-Path $publicPath $k
    if (-not (Test-Path $path)) {
        $svgMap[$k] | Out-File -FilePath $path -Encoding utf8
        Log ("Wrote SVG: " + $k)
    } else {
        Log ( $k + " exists")
    }
}

# Images (stable CDN links)
$images = @{
  'hero-ru.jpg'        = 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1400'
  'svc-repair-ru.jpg'  = 'https://images.pexels.com/photos/4792720/pexels-photo-4792720.jpeg?auto=compress&cs=tinysrgb&w=720'
  'svc-clean-ru.jpg'   = 'https://images.pexels.com/photos/4792722/pexels-photo-4792722.jpeg?auto=compress&cs=tinysrgb&w=720'
  'svc-install-ru.jpg' = 'https://images.pexels.com/photos/4792716/pexels-photo-4792716.jpeg?auto=compress&cs=tinysrgb&w=720'
}

foreach ($name in $images.Keys) {
    $dest = Join-Path $publicPath $name
    if (Test-Path $dest) {
        Log ("Image exists: " + $name)
        continue
    }
    $url = $images[$name]
    $ok = $false
    for ($i=1; $i -le 3; $i++) {
        try {
            Log ("Downloading " + $name + " (try " + $i + "): " + $url)
            Invoke-WebRequest -Uri $url -OutFile $dest -TimeoutSec 60 -ErrorAction Stop
            Log ("Saved: " + $name)
            $ok = $true
            break
        } catch {
            $err = $_.Exception.Message
            Log ("Download error: " + $err)
            Start-Sleep -Seconds 2
        }
    }
    if (-not $ok) {
        # create small SVG placeholder so site won't 404
        $ph = "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='#eee'/><text x='50%' y='50%' font-size='28' text-anchor='middle' fill='#666'>" + $name + "</text></svg>"
        $ph | Out-File -FilePath $dest -Encoding utf8
        Log ("Wrote placeholder for " + $name)
    }
}

# create style.css if missing
$cssFile = Join-Path $projectPath 'style.css'
if (-not (Test-Path $cssFile)) {
    $css = @"
body{font-family:Segoe UI,Arial,sans-serif;margin:0;background:#f8fafc;color:#222}
header{background:#0078D7;color:#fff;padding:18px;text-align:center;font-weight:700}
.container{max-width:1100px;margin:24px auto;padding:0 16px}
.card{background:#fff;border-radius:10px;padding:18px;box-shadow:0 6px 22px rgba(0,0,0,0.06);margin-bottom:18px}
img{max-width:100%;border-radius:8px}
"@
    $css | Out-File -FilePath $cssFile -Encoding utf8
    Log "Created style.css"
} else {
    Log "style.css exists"
}

# Fix resource paths in all html/css (literal replaces)
$files = Get-ChildItem -Path $projectPath -Recurse -Include *.html,*.css -File -ErrorAction SilentlyContinue
foreach ($f in $files) {
    try {
        $text = Get-Content -LiteralPath $f.FullName -Raw -Encoding utf8
        $text = $text.Replace('src="/','src="./public/')
        $text = $text.Replace("src='/","src='./public/")
        $text = $text.Replace('href="/','href="./')
        $text = $text.Replace("href='/","href='./")
        $text = $text.Replace('url("/','url("./public/')
        $text = $text.Replace("url('/","url('./public/")
        $text = $text.Replace('url(/','url(./public/')
        Set-Content -LiteralPath $f.FullName -Value $text -Encoding utf8
        Log ("Patched: " + $f.Name)
    } catch {
        Log ("Error patching " + $f.Name + " : " + $_.Exception.Message)
    }
}

# Git add/commit/push
Set-Location $projectPath
try {
    git --version > $null 2>&1
    if ($LASTEXITCODE -ne 0) { Log 'Git not found in PATH'; throw 'git_missing' }
    & git add -A
    $commitOut = & git commit -m "AutoFix: add images and fix resource paths" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $joined = $commitOut -join "`n"
        if ($joined -match "unable to auto-detect email address" -or $joined -match "Author identity unknown") {
            Log "Setting local git user.name/email and retrying commit"
            & git config user.email "ivan@example.com"
            & git config user.name "Ivan"
            & git commit -m "AutoFix: add images and fix resource paths" --allow-empty | Out-Null
        } else {
            Log ("Git commit output: " + $joined)
        }
    } else {
        Log "Commit created"
    }

    $branch = (& git rev-parse --abbrev-ref HEAD 2>$null).Trim()
    if (-not $branch -or $branch -eq 'HEAD') { $branch = 'main' }
    Log ("Pushing to branch: " + $branch)
    $pushOut = & git push origin $branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log ("Git push failed: " + ($pushOut -join "`n"))
    } else {
        Log "Git push succeeded"
    }
} catch {
    Log ("Git step error: " + $_.Exception.Message)
}

# If vercel CLI available, trigger deploy
try {
    $ver = Get-Command vercel -ErrorAction SilentlyContinue
    if ($ver) {
        Log "Vercel CLI found: running 'vercel --prod --confirm'"
        Start-Process -FilePath "vercel" -ArgumentList "--prod","--confirm" -NoNewWindow -Wait
        Log "Vercel command finished"
    } else {
        Log "Vercel CLI not found; skipping direct deploy"
    }
} catch {
    Log ("Vercel step error: " + $_.Exception.Message)
}

# Wait and check site
$siteOk = $false
for ($i=0; $i -lt 9; $i++) {
    try {
        $r = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $siteOk = $true; Log "Site responded 200 OK"; break }
    } catch {
        Log ("Waiting for site... attempt " + ($i+1))
    }
    Start-Sleep -Seconds 10
}
if (-not $siteOk) { Log "Site did not respond 200 after wait" } else { Log "Site is live" }

Log 'FINISHED auto-fix-vercel'
Start-Process -FilePath $logFile
