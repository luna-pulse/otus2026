# Как запустить «Мини-анкету»

Нужны: **Docker Desktop** (или Go + Node.js / npm).

## Вариант 1 — Docker (проще)

В корне проекта:

```powershell
docker compose up --build
```

- Сайт: http://localhost:8081  
- API / Swagger: http://localhost:8080  

Остановка: `docker compose down`

## Вариант 2 — без Docker

Два терминала из корня проекта.

**1. Backend** (порт 8080):

```powershell
cd backend
go run .
```

**2. Frontend** (порт 8081):

```powershell
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:8081  

Сначала должен быть запущен backend, иначе анкета не загрузится.

## Полезные ссылки

- Анкета: http://localhost:8081/
- Swagger: http://localhost:8080/
- Задание: http://localhost:8081/api/task
- Эта инструкция: http://localhost:8081/api/launch
- Контекст разговора: http://localhost:8081/api/promts (`ai_conversation.md`)
