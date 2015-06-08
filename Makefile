server:
	$(MAKE) -C server

build:
	gulp

assets:
	$(MAKE) -C server assets

dist: build
	$(MAKE) -C server dist


.PHONY: server
