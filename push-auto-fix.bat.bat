@echo on
title Commit & Push — Computer Master Ivan
color 0B
setlocal enabledelayedexpansion

echo =====================================================
echo 🚀 АВТОМАТИЧЕСКИЙ ПЕРВЫЙ COMMIT И PUSH
echo =====================================================
pause

set "LOCAL_DIR=C:\Users\user\Downloads\computer-master-ivan-full"
set "REPO_URL=https://github.com/araarkadij75-oss/remontpc-ivan.git"

cd /d "%LOCAL_DIR%" || (
  echo ❌ Папка %LOCAL_DIR% не найдена.
  pause
  exit /b 1
)

echo 🔍 Проверка Git...
git --version >nul 2>&1 || (
  echo ❌ Git не найден. Установи Git с https://git-scm.com/download/win
  pause
  exit /b 1
)
echo ✅ Git найден.

echo ⚙️ Проверка репозитория...
if not exist ".git" (
  git init
  echo 🟢 Git-репозиторий создан.
)
pause

echo 🔗 Настройка remote origin...
git remote get-url origin >nul 2>&1 && (
  git remote set-url origin "%REPO_URL%"
) || (
  git remote add origin "%REPO_URL%"
)
echo ✅ origin установлен: %REPO_URL%
pause

echo 📦 Добавление файлов...
git add --all
pause

echo 🪶 Создание коммита...
git commit -m "Initial commit — мой сайт Computer Master Ivan"
pause

echo 🚀 Отправка на GitHub...
git branch -M main
git push -u origin main
pause

echo 🎉 ГОТОВО!
echo ✅ Проверь репозиторий: https://github.com/araarkadij75-oss/remontpc-ivan
echo.
echo 🔴 Нажми любую клавишу, чтобы закрыть окно.
pause

