package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

// QuestionAnswer — единая модель вопроса и ответа (общая для обоих API).
type QuestionAnswer struct {
	Number   int    `json:"number"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Answered bool   `json:"answered"`
}

// Общий массив в памяти, доступный всем запросам без блокировок.
var items = []QuestionAnswer{
	{Number: 1, Question: "Сколько чашек кофе вы уже выпили сегодня?", Answer: "", Answered: false},
	{Number: 2, Question: "Какой мем лучше описывает ваш понедельник?", Answer: "", Answered: false},
	{Number: 3, Question: "Если бы ваш ноутбук умел говорить, о чем бы он пожаловался?", Answer: "", Answered: false},
	{Number: 4, Question: "Какой суперспособности не хватает ИИ?", Answer: "", Answered: false},
	{Number: 5, Question: "Если бы ваш Wi‑Fi умел извиняться, что бы он сказал?", Answer: "", Answered: false},
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func docsRoot() string {
	if v := os.Getenv("DOCS_ROOT"); v != "" {
		return v
	}
	// Локальный запуск из backend/: файлы лежат в корне репозитория.
	return ".."
}

func serveDoc(filename string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		path := filepath.Join(docsRoot(), filename)
		data, err := os.ReadFile(path)
		if err != nil {
			http.Error(w, "file not found: "+filename, http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
		_, _ = w.Write(data)
	}
}

func questionsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(items)
}

func answersHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload []QuestionAnswer
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	for _, incoming := range payload {
		for i := range items {
			if items[i].Number != incoming.Number {
				continue
			}
			answer := incoming.Answer
			if len(answer) > 512 {
				answer = answer[:512]
			}
			items[i].Answer = answer
			items[i].Answered = answer != ""
			break
		}
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.Redirect(w, r, "/swagger/", http.StatusFound)
}

func swaggerHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "swagger.html")
}

func openAPIHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
	http.ServeFile(w, r, "openapi.yaml")
}

func main() {
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/swagger", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/swagger/", http.StatusFound)
	})
	http.HandleFunc("/swagger/", swaggerHandler)
	http.HandleFunc("/openapi.yaml", openAPIHandler)

	http.HandleFunc("/questions", questionsHandler)
	http.HandleFunc("/answers", answersHandler)

	http.HandleFunc("/api/task", serveDoc("task.md"))
	http.HandleFunc("/api/launch", serveDoc("launchdoc.md"))
	http.HandleFunc("/api/promts", serveDoc("ai_conversation.md"))

	fmt.Println("Backend listening on http://localhost:8080")
	fmt.Println("Swagger UI: http://localhost:8080/ (redirect)")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
