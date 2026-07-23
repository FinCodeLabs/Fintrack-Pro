.PHONY: help install dev migrate seed reset test

help:
	@echo "Commands: make install | dev | migrate | seed | reset | test"

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	alembic upgrade head

seed:
	python -m scripts.seed_db

reset: migrate seed

test:
	pytest -v tests/
