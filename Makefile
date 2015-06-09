server:
	$(MAKE) -C server

build:
	gulp

assets:
	$(MAKE) -C server assets

dist: build
	$(MAKE) -C server dist

rpm:
	fpm \
		-n stc-network-shaper \
		-s dir \
		-t rpm \
		./server/network-shaper=/usr/sbin/network-shaper \
		./server/network-shaper.service=/usr/lib/systemd/system/network-shaper.service

.PHONY: server
