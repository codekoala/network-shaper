package floatslider

import (
	"fmt"
)

type (
	//templ:component-opts
	FloatSliderOpts struct {
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

	// Opt func(*FloatSliderOpts)
)

func (fs *FloatSliderOpts) AlpineValue() string {
	return fmt.Sprintf("{ value: %s }", fs.ValueStr())
}

// func With(opts ...Opt) *FloatSliderOpts {
// 	fs := &FloatSliderOpts{
// 		Unit: "ms",
// 		Min:  0.0,
// 		Max:  100.0,
// 		Step: 0.1,
//
// 		Value: 43.65,
// 	}
// 	fs.With(opts...)
//
// 	return fs
// }
//
// func (fs *FloatSliderOpts) With(opts ...Opt) {
// 	for _, opt := range opts {
// 		opt(fs)
// 	}
// }
//
// func (fs *FloatSliderOpts) MinStr() string {
// 	return strconv.FormatFloat(fs.Min, 'f', 1, 64)
// }
//
// func (fs *FloatSliderOpts) MaxStr() string {
// 	return strconv.FormatFloat(fs.Max, 'f', 1, 64)
// }
//
// func (fs *FloatSliderOpts) StepStr() string {
// 	return strconv.FormatFloat(fs.Step, 'f', 1, 64)
// }
//
// func (fs *FloatSliderOpts) ValueStr() string {
// 	return strconv.FormatFloat(fs.Value, 'f', 1, 64)
// }
//
// func Label(in string) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Label = in
// 	}
// }
// func Descr(in string) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Descr = in
// 	}
// }
//
// func Unit(in string) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Unit = in
// 	}
// }
//
// func Optional(in bool) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Optional = in
// 	}
// }
//
// func Disabled(in bool) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Disabled = in
// 	}
// }
//
// func Min(in float64) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Min = in
// 	}
// }
//
// func Max(in float64) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Max = in
// 	}
// }
//
// func Step(in float64) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Step = in
// 	}
// }
//
// func Value(in float64) Opt {
// 	return func(opts *FloatSliderOpts) {
// 		opts.Value = in
// 	}
// }
