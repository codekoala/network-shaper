package templates

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type (
	GlobalState struct {
		Pages map[string]Page
		Nav   []Page

		ctx *fiber.Ctx
	}

	Page struct {
		Path  string
		Title string
	}
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

func StateFromCtx(c *fiber.Ctx) (gs GlobalState) {
	gs = GlobalState{
		Pages: Pages,
		Nav:   Nav,
		ctx:   c,
	}
	return gs
}

func (gs GlobalState) IsActive(page Page) bool {
	return page.Path == gs.ctx.Path()
}

func (gs GlobalState) GetTitle() string {
	fmt.Println("FARTS", gs.ctx.Path())
	page, ok := gs.Pages[gs.ctx.Path()]
	if !ok {
		return "Let's Begin"
	}

	return page.Title
}
