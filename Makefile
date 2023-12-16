run:
	go run ./cmd/network-shaper

css:
	tailwindcss -i ./templates/site.css -o ./static/site.css $(ARGS)

devcss:
	$(MAKE) css ARGS="--watch --minify"

daisyui:
	curl -Lo ./static/daisyui.css https://cdn.jsdelivr.net/npm/daisyui@4.4.19/dist/full.min.css
