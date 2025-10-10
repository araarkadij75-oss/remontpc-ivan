@echo on
title Обновление сайта Computer Master Ivan
color 0B
setlocal enabledelayedexpansion

echo =====================================================
echo 🚀 Обновление сайта и загрузка на GitHub
echo =====================================================
pause

set "LOCAL_DIR=C:\Users\user\Downloads\computer-master-ivan-full"
set "REPO_URL=https://github.com/araarkadij75-oss/remontpc-ivan.git"

cd /d "%LOCAL_DIR%" || (
  echo ❌ Папка не найдена!
  pause
  exit /b 1
)

echo ⚙️ Проверка Git...
git --version >nul 2>&1 || (
  echo ❌ Git не установлен. Скачайте https://git-scm.com/download/win
  pause
  exit /b 1
)

echo ✅ Git найден. Добавляю все файлы...
git add --all

echo 🪶 Создаю коммит...
git commit -m "🚀 Обновление дизайна сайта (Apple-style, мультяшный логотип)"

echo 🚀 Отправляю файлы на GitHub...
git branch -M main
git push -u origin main

echo 🎉 Готово! Сайт обновлён на GitHub.
echo ✅ Перейдите по ссылке: https://github.com/araarkadij75-oss/remontpc-ivan
echo Если проект подключен к Vercel — сайт автоматически обновится.
pause
