.PHONY: up down status

up:
	@echo "🚀 Altyapı (PostgreSQL) başlatılıyor..."
	cd infrastructure/docker && docker-compose up -d
	@echo "☕ Java Backend başlatılıyor..."
	cd services/core-service && mvn spring-boot:run & 
	@echo "⚛️ Frontend başlatılıyor..."
	cd apps/web && npm run dev

down:
	@echo "🛑 Sistem durduruluyor..."
	cd infrastructure/docker && docker-compose down
	killall java || true
	killall node || true

status:
	docker ps