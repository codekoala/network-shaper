run: generate
	go run ./cmd/network-shaper

generate:
	go generate ./...

css:
	tailwindcss -i ./view/site.css -o ./static/site.css $(ARGS)

templ:
	templ-component-gen ./view/
	templ generate $(ARGS) ./...

devcss:
	$(MAKE) css ARGS="--watch --minify"

devtempl:
	$(MAKE) templ ARGS="--watch"

3rdparty: alpinejs daisyui htmx rmgz

alpinejs:
	curl -Lo ./static/alpinejs.min.js https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js

daisyui:
	curl -Lo ./static/daisyui.css https://cdn.jsdelivr.net/npm/daisyui@4.4.24/dist/full.min.css

htmx:
	curl -Lo ./static/htmx.min.js https://unpkg.com/htmx.org/dist/htmx.min.js

rmgz:
	rm -f ./static/*.fiber.gz
