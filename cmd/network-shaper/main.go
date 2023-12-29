// Package main is the primary entrypoint for the Network Shaper tool
package main

import (
	"os"

	"github.com/a-h/templ"
	networkshaper "github.com/codekoala/network-shaper"
	"github.com/codekoala/network-shaper/view"
	"github.com/codekoala/network-shaper/view/layout"
	"github.com/codekoala/network-shaper/view/model"
	fiber "github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var cfg = networkshaper.GetDefaultConfig()

// main is the entrypoint for the Network Shaper tool
func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	app := fiber.New()

	app.Static("/static", "./static", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    false,
	})

	app.Get("/", vIndex)
	app.Get("/inbound", vInbound)
	app.Get("/outbound", vOutbound)
	app.Get("/devices", vDevices)

	if err := app.Listen(":3000"); err != nil {
		log.Fatal().Err(err).Msg("error running server")
	}
}

// Render a template
func Render(c *fiber.Ctx, comp templ.Component) (err error) {
	page := layout.Base(
		model.StateFromCtx(c),
		comp,
	)

	err = page.Render(c.Context(), c)
	c.Response().Header.SetContentType("text/html; charset=utf-8")

	return err
}

func vIndex(c *fiber.Ctx) error {
	return Render(c, view.Foo())
}

func vInbound(c *fiber.Ctx) error {
	return Render(c, view.InboundRulesForm(&cfg.Inbound.Netem))
}

func vOutbound(c *fiber.Ctx) error {
	return Render(c, view.OutboundRulesForm(&cfg.Outbound.Netem))
}

func vDevices(c *fiber.Ctx) error {
	return Render(c, view.Foo())
}
