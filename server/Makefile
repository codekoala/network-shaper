OUT := shaper
ASSETS := ../dist

all:
	go build -o $(OUT)

assets:
	go-bindata-assetfs $(ASSETS)/...

upx:
	goupx $(OUT)

dist: assets all upx
