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
	curl -L https://cdn.jsdelivr.net/npm/@alpinejs/persist@3.x.x/dist/cdn.min.js -o ./static/alpinejs.persist.js
	curl -L https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js -o ./static/alpinejs.min.js

daisyui:
	curl -L https://cdn.jsdelivr.net/npm/daisyui@4.4.24/dist/full.min.css -o ./static/daisyui.css

htmx:
	curl -L https://unpkg.com/htmx.org/dist/htmx.min.js -o ./static/htmx.min.js

rmgz:
	rm -f ./static/*.fiber.gz

# vim:noet sw=2 ts=2:
