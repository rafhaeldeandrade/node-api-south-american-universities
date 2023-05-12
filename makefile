SHELL := /bin/bash

dev:
	if which docker-compose >/dev/null; then \
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml up $(FLAG); \
	else \
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up $(FLAG); \
	fi

prod:
	npm run build && npm run start

test:
	if which yarn >/dev/null; then \
		yarn test:ci; \
	else \
		npm run test:ci; \
	fi
