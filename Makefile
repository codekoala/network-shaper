run:
	go run ./cmd/network-shaper

css:
	tailwindcss -i ./view/site.css -o ./static/site.css $(ARGS)

templ:
	templ-component-gen ./view/
	templ generate $(ARGS) ./...

devcss:
	$(MAKE) css ARGS="--watch --minify"

devtempl:
	$(MAKE) templ ARGS="--watch"

daisyui:
	curl -Lo ./static/daisyui.css https://cdn.jsdelivr.net/npm/daisyui@4.4.19/dist/full.min.css
