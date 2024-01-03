package model

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
)

type (
	GlobalState struct {
		Pages map[string]Page
		Nav   []Page
		Theme string

		ctx *fiber.Ctx
	}

	Page struct {
		Path  string
		Title string
	}
)

const (
	DarkTheme  = "night"
	LightTheme = "nord"
)

var (
	Pages = map[string]Page{}
	Nav   = []Page{}
)

func init() {
	RegisterPage(Page{"/inbound", "Inbound Rules"})
	RegisterPage(Page{"/outbound", "Outbound Rules"})
	RegisterPage(Page{"/devices", "Devices"})
}

func RegisterPage(page Page) {
	Pages[page.Path] = page

	Nav = append(Nav, page)
}

func StateFromCtx(c *fiber.Ctx, sess *session.Session) (gs GlobalState) {
	gs = GlobalState{
		Pages: Pages,
		Nav:   Nav,
		ctx:   c,
	}
	if gs.Theme, _ = sess.Get("theme").(string); gs.Theme == "" {
		// default to dark theme
		gs.Theme = DarkTheme
	}

	return gs
}

func (gs GlobalState) IsActive(page Page) bool {
	return page.Path == gs.ctx.Path()
}

func (gs GlobalState) GetTitle() string {
	page, ok := gs.Pages[gs.ctx.Path()]
	if !ok {
		return "Let's Begin"
	}

	return page.Title
}
