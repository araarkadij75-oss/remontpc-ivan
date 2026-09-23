# Чинилкин — Google Sheets CRM webhook

CRM-лист уже создан в Google-таблице **«Заявки СПБ КП 3.0»**:
- Spreadsheet ID: `1FhQ2S3sDEgD2UReiEytrc7FQeURbsF3Hrgg-ij82hck`
- Лист: `Сайт Чинилкин`

## Что делает Code.gs
- принимает POST-заявку;
- проверяет телефон и honeypot;
- защищает от повторной отправки одной заявки в течение 90 секунд;
- создаёт ID вида `CHN-YYYYMMDD-HHMMSS-123`;
- добавляет строку в лист `Сайт Чинилкин`;
- ставит статус `Новая`;
- отправляет email-уведомление владельцу таблицы.

## Единственный Google-шаг
1. Открыть таблицу.
2. Extensions → Apps Script.
3. Вставить содержимое `crm/Code.gs`.
4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Скопировать URL, заканчивающийся на `/exec`.

После этого URL нужно добавить в Vercel как переменную:
`GOOGLE_APPS_SCRIPT_URL=<.../exec>`

Клиентский код уже готов: если webhook подключён — заявка сохраняется автоматически и WhatsApp не открывается. Если webhook недоступен — включается безопасный fallback в WhatsApp, заявка не теряется.
