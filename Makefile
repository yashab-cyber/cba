.PHONY: help install seed test simulate run-backend run-frontend docker-up docker-down

help:
	@echo "Central Bank of Agents (CBA) - Financial Operating System for AI"
	@echo "Available commands:"
	@echo "  make install       Install backend, frontend, and SDK dependencies"
	@echo "  make seed          Initialize tables and seed genesis data"
	@echo "  make test          Run complete automated test suite (Pytest)"
	@echo "  make simulate      Run multi-agent live economic simulation"
	@echo "  make run-backend   Start FastAPI server (port 8000)"
	@echo "  make run-frontend  Start React/Vite dashboard (port 3000)"
	@echo "  make docker-up     Launch complete PostgreSQL + Backend + Frontend stack"
	@echo "  make docker-down   Stop Docker containers"

install:
	pip install -r backend/requirements.txt
	pip install -e sdk
	cd frontend && npm install

seed:
	cd backend && PYTHONPATH=. python3 app/seed.py

test:
	cd backend && PYTHONPATH=. pytest -v tests

simulate:
	python3 simulation.py 5

run-backend:
	cd backend && ./run.sh

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose -f docker/docker-compose.yml up --build -d

docker-down:
	docker compose -f docker/docker-compose.yml down
