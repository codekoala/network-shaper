server:
	$(MAKE) -C server

build:
	gulp

assets:
	$(MAKE) -C server assets

dist: build
	$(MAKE) -C server dist

rpm:
	$(MAKE) -C server rpm

clean:
	find . -type f -iname "*.rpm" -delete
	gulp clean

.PHONY: server
