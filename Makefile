DOCKER_USERNAME ?= huygia12
APPLICATION_NAME ?= digital-web-shop-apis
GIT_HASH ?= $(shell git log --format="%h" -n 1)
SERVER_PORT ?= 8000
ENV_FILE ?= .env

_BUILD_ARGS_TAG ?= ${GIT_HASH}
_BUILD_ARGS_DOCKERFILE ?= Dockerfile

_builder: test
	$(info ==================== building dockerfile ====================)
	docker buildx build --platform linux/amd64 --tag ${DOCKER_USERNAME}/${APPLICATION_NAME}:${_BUILD_ARGS_TAG} ./

_server:
	docker container run --rm --env-file ${ENV_FILE} -p ${SERVER_PORT}:${SERVER_PORT} ${DOCKER_USERNAME}/${APPLICATION_NAME}:${_BUILD_ARGS_TAG}

server:
	$(info ==================== running container ======================)
	$(MAKE) _server

build:
	$(MAKE) _builder

run:
	npm run dev

test:
	$(info ==================== running tests ==========================)
	ENV_FILE=${ENV_FILE} 

.PHONY:
	test server build run