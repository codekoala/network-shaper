UID := $(shell id -u)
GID := $(shell id -g)

server:
	$(MAKE) -C server

sencha:
	docker run $(EX) --rm \
		-e TGT_UID=$(UID) \
		-e TGT_GID=$(GID) \
		--user 0:0 \
		-v `pwd`:/project \
		--entrypoint /project/entrypoint.sh \
		herloct/sencha-cmd \
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
