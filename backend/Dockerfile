FROM golang:1.26.5-alpine AS build
WORKDIR /app
COPY backend/go.mod ./
COPY backend/*.go ./
RUN go build -o /survey-api .

FROM alpine:3.20
WORKDIR /app
COPY --from=build /survey-api .
COPY backend/openapi.yaml backend/swagger.html ./
COPY task.md launchdoc.md ai_conversation.md /docs/
ENV DOCS_ROOT=/docs
EXPOSE 8080
CMD ["./survey-api"]
