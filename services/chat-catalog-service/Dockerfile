# ───────── Build Stage ─────────
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY go.mod ./
# Note: go.sum is not generated yet, it will be generated during go mod download or build
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server/main.go

# ───────── Run Stage ─────────
FROM alpine:latest  

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

EXPOSE 8081

CMD ["./main"]
