.PHONY: all docs build-docs test dev install help

all: test

help:
	@echo "Campus Feedback System - Available Makefile Targets:"
	@echo "  make dev         - Start all microservices, gateway, and frontend concurrently"
	@echo "  make test        - Run atomic transactions and concurrency benchmark tests"
	@echo "  make docs        - Run local MkDocs development server"
	@echo "  make build-docs  - Build static MkDocs documentation site"
	@echo "  make install     - Install dependencies across all microservices and frontend"

dev:
	npm run dev

test:
	node auth-service/test-concurrency.js

docs:
	mkdocs serve

build-docs:
	mkdocs build

install:
	npm run install:all
