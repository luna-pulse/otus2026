# Мини-анкета

Простое full-stack приложение: Go backend + React frontend.
Требования: языки программирования, которые я не знаю, это Go и React. Весь проект только на ИИ без код ревью глазами. 

## Структура

- `backend/` — API на Go + Swagger, порт **8080**
- `frontend/` — React (Vite), порт **8081**
- `task.md` — задание
- `launchdoc.md` — краткая инструкция запуска
- `ai_conversation.md` — контекст разговора и токены

Ответы хранятся в памяти backend (без БД).

Краткий запуск: см. [launchdoc.md](launchdoc.md).

## Локальный запуск (без Docker)

### Backend

```powershell
cd backend
$env:PATH = "C:\Program Files\Go\bin;" + $env:PATH
go run .
```

- API / Swagger: http://localhost:8080 (корень редиректит на Swagger)

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:8081

## Запуск в Docker

```powershell
docker compose up --build
```

- Frontend: http://localhost:8081
- Backend / Swagger: http://localhost:8080

Остановка:

```powershell
docker compose down
```

## API

- `GET /questions` — список из 5 вопросов (и сохранённых ответов)
- `POST /answers` — сохранить ответы (тело: JSON-массив той же модели)
- `GET /api/task` — `task.md`
- `GET /api/launch` — `launchdoc.md`
- `GET /api/promts` — `ai_conversation.md`
