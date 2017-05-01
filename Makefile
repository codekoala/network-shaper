server:
	$(MAKE) -C server

build:
	gulp
	find dist/bower_components \( \( -type f -not -name "webcomponents.min.js" \) -o \( -type d -empty \) \) -delete

assets:
	$(MAKE) -C server assets

dist: build
	$(MAKE) -C server dist

rpm:
	$(MAKE) -C server rpm

arch:
	$(MAKE) -C server arch

clean:
	find . -type f \( -iname "*.rpm" -o -iname "*.tar.xz*" \) -delete
	gulp clean

.PHONY: server build
