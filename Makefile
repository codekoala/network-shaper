UID := $(shell id -u)
GID := $(shell id -g)

server:
	$(MAKE) -C server

sencha:
	docker run $(EX) --rm \
		--user $(UID):$(GID) \
		-v `pwd`:/code \
		codekoala/sencha:6 \
		$(THECMD)

build:
	$(MAKE) THECMD="app build production" sencha

assets:
	$(MAKE) -C server assets

dist: build
	$(MAKE) -C server dist

rpm:
	$(MAKE) -C server rpm

clean:
	find . -type f -iname "*.rpm" -delete
	gulp clean

.PHONY: server build
