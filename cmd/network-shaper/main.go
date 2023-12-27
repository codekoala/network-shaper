package main

import (
	"os"

	"github.com/a-h/templ"
	"github.com/codekoala/network-shaper/view"
	"github.com/codekoala/network-shaper/view/layout"
	"github.com/codekoala/network-shaper/view/model"
	fiber "github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	app := fiber.New()

	app.Static("/static", "./static", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    false,
	})

	app.Get("/", VIndex)
	app.Get("/inbound", VInbound)
	app.Get("/outbound", VOutbound)
	app.Get("/devices", VDevices)

	if err := app.Listen(":3000"); err != nil {
		log.Fatal().Err(err).Msg("error running server")
	}
}

func Render(c *fiber.Ctx, comp templ.Component) (err error) {
	page := layout.Base(
		model.StateFromCtx(c),
		comp,
	)

	err = page.Render(c.Context(), c)
	c.Response().Header.SetContentType("text/html; charset=utf-8")

	return err
}

func VIndex(c *fiber.Ctx) error {
	return Render(c, view.Foo())
}

func VInbound(c *fiber.Ctx) error {
	return Render(c, view.InboundRulesForm())
}

func VOutbound(c *fiber.Ctx) error {
	return Render(c, view.OutboundRulesForm())
}

func VDevices(c *fiber.Ctx) error {
	return Render(c, view.Foo())
}
