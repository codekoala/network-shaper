package floatslider

import (
	"fmt"
)

func (fs *Opts) AlpineValue() string {
	return fmt.Sprintf("{ value: %s }", fs.ValueStr())
}
