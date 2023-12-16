package main

import (
	"net/http"
	"os"

	fiber "github.com/gofiber/fiber/v2"
	django "github.com/gofiber/template/django/v3"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	engine := django.NewFileSystem(http.Dir("./templates"), ".django")

	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Static("/static", "./static", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    false,
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	})

	if err := app.Listen(":3000"); err != nil {
		log.Fatal().Err(err).Msg("error running server")
	}
}
