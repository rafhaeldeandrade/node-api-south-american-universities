SHELL := /bin/bash

dev:
	if which docker-compose >/dev/null; then \
		docker-compose -f docker-compose.dev.yml up -d $(FLAG); \
	else \
    docker compose -f docker-compose.dev.yml up -d $(FLAG); \
	fi

test:
	if which docker-compose >/dev/null; then \
		docker-compose -f docker-compose.test.yml up $(FLAG); \
	else \
		docker compose -f docker-compose.test.yml up $(FLAG); \
	fi
