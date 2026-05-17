.PHONY: up down status dev dev-down

# ───── Docker ile tüm stack (Production-like) ─────
up:
	@echo "🚀 Tüm stack Docker ile başlatılıyor..."
	docker compose up --build

down:
	@echo "🛑 Tüm stack durduruluyor..."
	docker compose down

status:
	docker compose ps

# ───── Lokal geliştirme (eski yöntem) ─────
dev:
	@echo "🚀 Altyapı (PostgreSQL) başlatılıyor..."
	cd infrastructure/docker && docker-compose up -d
	@echo "☕ Java Backend başlatılıyor..."
	cd services/core-service && mvn spring-boot:run & 
	@echo "⚛️ Frontend başlatılıyor..."
	cd apps/web && npm run dev

dev-down:
	@echo "🛑 Lokal geliştirme ortamı durduruluyor..."
	cd infrastructure/docker && docker-compose down
	killall java || true
	killall node || true