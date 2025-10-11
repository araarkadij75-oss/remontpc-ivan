@echo off
title 🎨 Vercel CSS Fix — Computer Master Ivan
color 0B
setlocal enabledelayedexpansion

echo =====================================================
echo 🧩 VERCEL CSS-FIX — ИСПРАВЛЕНИЕ ПУТЕЙ К ИЗОБРАЖЕНИЯМ
echo =====================================================
echo.

:: === Настройки ===
set "PROJECT_DIR=C:\Users\user\Downloads\computer-master-ivan-full"
set "SITE_URL=https://remontpc-ivan.vercel.app"
set "LOG_FILE=%PROJECT_DIR%\vercel-css-fix-log.txt"

cd /d "%PROJECT_DIR%" || (
    echo ❌ Ошибка: не удалось открыть папку %PROJECT_DIR%
    pause
    exit /b 1
)

:: === Исправление путей в CSS ===
echo 🎨 Исправляем пути в CSS...
set COUNT=0
for /r %%f in (*.css) do (
    echo 🔹 Проверка %%~nxf ...
    powershell -Command "(Get-Content '%%f') -replace 'url\(\"/', 'url(\"' -replace 'url\(''/', 'url(''' | Set-Content '%%f'"
    set /a COUNT+=1
)

echo =====================================================
echo ✅ Исправлено CSS-файлов: %COUNT%
echo =====================================================

:: === Проверка картинок ===
echo 🖼️ Проверка наличия изображений...
set MISSING=0
for %%f in (hero-ru.jpg svc-repair-ru.jpg svc-install-ru.jpg svc-clean-ru.jpg logo.svg ru.svg gb.svg fr.svg de.svg es.svg) do (
    if not exist "%PROJECT_DIR%\%%f" (
        echo ⚠️ Не найден файл: %%f
        set /a MISSING+=1
    )
)

if %MISSING% gtr 0 (
    echo -----------------------------------------------------
    echo ⚠️ Найдено отсутствующих файлов: %MISSING%
    echo Возможно, они не попали в проект или не закоммичены.
    echo -----------------------------------------------------
) else (
    echo ✅ Все изображения на месте.
)

:: === Коммит и пуш ===
echo 📦 Отправляем изменения в Git...
git add *.css >nul
git commit -m "CSS Fix: make all background URLs relative for Vercel" || echo ⚠️ Возможно, изменений нет.
git push origin main

if %errorlevel% neq 0 (
    echo ⚠️ Ошибка при push. Проверь подключение или авторизацию GitHub.
    pause
    exit /b
)

echo =====================================================
echo 🌍 Изменения отправлены на GitHub.
echo Ожидаем обновление сайта Vercel...
echo =====================================================

timeout /t 60 /nobreak >nul

echo 🔍 Проверка сайта: %SITE_URL%
powershell -Command ^
    "$r = Invoke-WebRequest '%SITE_URL%' -UseBasicParsing; ^
     if ($r.StatusCode -eq 200) { Write-Host '✅ Сайт успешно загружается!' -ForegroundColor Green } ^
     else { Write-Host '⚠️ Ошибка: сайт вернул код' $r.StatusCode -ForegroundColor Red }"

echo =====================================================
echo 🧠 CSS-ФИКС ЗАВЕРШЁН!
echo Проверь сайт: %SITE_URL%
echo =====================================================
pause
exit /b
