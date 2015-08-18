OUT := network-shaper
ASSETS := ../dist
VERSION := 0.0.3

all:
	go build -ldflags '-X main.VERSION $(VERSION)' -o $(OUT)

assets:
	go-bindata-assetfs $(ASSETS)/...

upx:
	goupx $(OUT)

dist: assets all upx

rpm: dist
	fpm \
		-n stc-network-shaper \
		-v $(VERSION) \
		-s dir \
		-t rpm \
		./network-shaper=/usr/sbin/network-shaper \
		./network-shaper.service=/usr/lib/systemd/system/network-shaper.service

arch:
	sed -i 's/^\(pkgver=\).*/\1$(VERSION)/' PKGBUILD
	makepkg --clean
