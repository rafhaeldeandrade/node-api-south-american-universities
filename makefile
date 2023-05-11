SHELL := /bin/bash

dev:
	if which docker-compose >/dev/null; then \
		docker-compose -f docker-compose.yml up -d $(FLAG); \
	else \
    docker compose -f docker-compose.yml up -d $(FLAG); \
	fi
