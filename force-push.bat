@echo on
title Push Auto Fix v2 — Computer Master Ivan
color 0A
setlocal enabledelayedexpansion

echo =====================================================
echo 🚀 АВТОМАТИЧЕСКИЙ PUSH-FIX GITHUB (v2)
echo =====================================================
echo.

set "LOCAL_DIR=C:\Users\user\Downloads\computer-master-ivan-full"
set "REPO_URL=https://github.com/araarkadij75-oss/remontpc-ivan.git"
set "LOG_FILE=%LOCAL_DIR%\push-log.txt"

cd /d "%LOCAL_DIR%" || (
  echo ❌ Папка %LOCAL_DIR% не найдена.
  pause
  exit /b 1
)

echo 🔍 Проверка установки Git...
git --version >nul 2>&1 || (
  echo ❌ Git не найден. Установи Git с https://git-scm.com/download/win
  pause
  exit /b 1
)
echo ✅ Git установлен.

echo ⚙️ Проверка Git-репозитория...
if not exist ".git" (
  git init
  echo 🟢 Репозиторий инициализирован.
)

echo 🧭 Определение ветки...
set "BRANCH="
for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "BRANCH=%%b"
if "!BRANCH!"=="" (
  set "BRANCH=main"
  git branch -M !BRANCH!
)
echo Используем ветку: !BRANCH!

echo 🔗 Настройка remote origin...
git remote get-url origin >nul 2>&1 && (
  git remote set-url origin "%REPO_URL%"
) || (
  git remote add origin "%REPO_URL%"
)
echo ✅ origin настроен: %REPO_URL%

echo 📦 Добавление файлов...
git add --all

echo 🔍 Проверка наличия коммитов...
for /f "delims=" %%c in ('git rev-list --count HEAD 2^>nul') do set "COMMITS=%%c"
if "!COMMITS!"=="" set "COMMITS=0"

if "!COMMITS!"=="0" (
  echo 🪶 Нет коммитов — создаю первый...
  git commit -m "Initial commit — auto-created by push-fix v2"
) else (
  echo 🟢 Найдено !COMMITS! коммит(ов).
  git diff --cached --quiet || git commit -m "Auto update"
)

echo 🔁 Синхронизация и отправка...
(
  echo ==== START PUSH %date% %time% ==== 
  git fetch origin 2>&1
  git pull origin !BRANCH! --allow-unrelated-histories 2>&1
  git push -u origin !BRANCH! 2>&1 || (
    echo ⚠️ Ошибка push. Повторяю с форсированным обновлением...
    git push -f origin !BRANCH! 2>&1
  )
  echo ==== END PUSH ==== 
) > "%LOG_FILE%"

echo ✅ Готово! Лог сохранён в "%LOG_FILE%"
start notepad "%LOG_FILE%"
pause

