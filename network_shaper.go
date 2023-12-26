//go:generate templ-component-opts ./view
//go:generate templ generate ./view/...
//go:generate tailwindcss -i ./view/site.css -o ./static/site.css

package networkshaper
