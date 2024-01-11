// Package main is the primary entrypoint for the Network Shaper tool
package main

import (
	"os"

	"github.com/a-h/templ"
	networkshaper "github.com/codekoala/network-shaper"
	"github.com/codekoala/network-shaper/netem"
	"github.com/codekoala/network-shaper/view"
	"github.com/codekoala/network-shaper/view/component"
	"github.com/codekoala/network-shaper/view/layout"
	"github.com/codekoala/network-shaper/view/model"
	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var (
	cfg   = networkshaper.GetDefaultConfig()
	store *session.Store

	currIn     *netem.Netem
	pendingIn  *netem.Netem
	currOut    *netem.Netem
	pendingOut *netem.Netem
)

// main is the entrypoint for the Network Shaper tool
func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	app := fiber.New()
	app.Use(compress.New())
	store = session.New()

	cfg.Inbound.Device = "br0"
	cfg.Outbound.Device = "wlan0"
	currIn = netem.ParseCurrentNetem(cfg.Inbound.Device)
	pendingIn = currIn.Clone()

	currOut = netem.ParseCurrentNetem(cfg.Outbound.Device)
	pendingOut = currOut.Clone()

	app.Static("/static", "./static", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    false,
	})

	app.Get("/", vIndex)
	app.Get("/inbound", vInbound)
	app.Get("/outbound", vOutbound)
	app.Get("/devices", vDevices)

	app.Post("/theme", setTheme)
	app.Post("/stage", stageChange)

	if err := app.Listen(":3000"); err != nil {
		log.Fatal().Err(err).Msg("error running server")
	}
}

// Render a template
func Render(c *fiber.Ctx, comp templ.Component) (err error) {
	return RenderPartial(c, comp, false)
}

func GetState(c *fiber.Ctx) model.GlobalState {
	sess, err := store.Get(c)
	if err != nil {
		log.Error().Err(err).Msg("failed to get session")
	}
	return model.StateFromCtx(c, sess)
}

func RenderPartial(c *fiber.Ctx, comp templ.Component, partial bool) (err error) {
	state := GetState(c)

	var page templ.Component
	if partial {
		page = comp
	} else {
		page = layout.Base(state, comp)
	}

	err = page.Render(c.Context(), c)
	c.Response().Header.SetContentType("text/html; charset=utf-8")

	return err
}

func vIndex(c *fiber.Ctx) error {
	return Render(c, view.Foo())
}

func vInbound(c *fiber.Ctx) error {
	return Render(c, view.InboundRulesForm(pendingIn))
}

func vOutbound(c *fiber.Ctx) error {
	return Render(c, view.OutboundRulesForm(pendingOut))
}

func vDevices(c *fiber.Ctx) error {
	return Render(c, view.Foo())
}

func setTheme(c *fiber.Ctx) error {
	theme := c.FormValue("theme")
	log.Info().Str("theme", theme).Msg("set theme")
	sess, err := store.Get(c)
	if err != nil {
		log.Error().Err(err).Msg("failed to get session")
	}
	if theme == "" {
		theme = model.DarkTheme
	}
	sess.Set("theme", theme)
	sess.Save()

	return RenderPartial(c, component.Theme(GetState(c)), true)
}

func stageChange(c *fiber.Ctx) error {
	var pending netem.Netem
	if err := c.BodyParser(&pending); err != nil {
		log.Error().Err(err).Msg("failed to parse body")
		return err
	}

	device := c.FormValue("device")
	switch device {
	case "inbound":
		pendingIn = &pending
	case "outbound":
		pendingOut = &pending
	}

	log.Info().Str("device", device).Interface("erf", pending).Msg("stage change")

	return RenderPartial(c, component.RulesForm(device, &pending), true)
}
