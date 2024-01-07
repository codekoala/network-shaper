package floatslider

import "strings"

func (o *Opts) GetName() string {
	if o.Name == "" {
		o.Name = strings.ReplaceAll(strings.ToLower(o.Label), " ", "_")
	}

	return o.Name
}
