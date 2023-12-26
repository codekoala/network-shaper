package floatslider

//templ:component-opts
type Opts struct {
	Label    string
	Descr    string
	Unit     string `default:"ms"`
	Optional bool
	Disabled bool
	Min      float64 `default:"0.0"`
	Max      float64 `default:"100.0"`
	Step     float64 `default:"0.1"`
	Value    float64
}
