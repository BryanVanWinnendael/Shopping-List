FROM golang:1.25.0-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY product-search ./product-search
COPY shared ./shared

RUN CGO_ENABLED=0 GOOS=linux \
    go build -ldflags="-s -w" -o app ./product-search/cmd

FROM alpine:3.20

WORKDIR /app
COPY --from=builder /app/app .

CMD ["./app"]