package main

import (
	"log"
	"os/exec"
	"strconv"
	"strings"
)

var (
	// VALID_TIME_UNITS is a mapping of acceptable packet delay units based on
	// tc(8)
	VALID_TIME_UNITS = map[string]string{
		"usecs": "us",
		"usec":  "us",
		"us":    "us",
		"msecs": "ms",
		"msec":  "ms",
		"ms":    "ms",
		"secs":  "s",
		"sec":   "s",
		"s":     "s",
	}

	// VALID_RATE_UNITS is a mapping of acceptable packet rate units based on
	// tc(8)
	VALID_RATE_UNITS = map[string]string{
		"bit":  "bit",
		"kbit": "kbit",
		"mbit": "mbit",
		"gbit": "gbit",
		"tbit": "tbit",
		"bps":  "bps",
		"kbps": "kbps",
		"mbps": "mbps",
		"gbps": "gbps",
		"tbps": "tbps",
	}
)

// GetTimeUnit is a helper function to get the correct unit of time that is
// acceptable to tc, or to fallback to a default unit of time.
func GetTimeUnit(unit, def string) string {
	u, ok := VALID_TIME_UNITS[unit]
	if !ok {
		u = def
	}

	return u
}

// GetRateUnit is a helper function to get the correct unit of speed that is
// acceptable to tc, or to fallback to a default unit of speed.
func GetRateUnit(unit, def string) string {
	u, ok := VALID_RATE_UNITS[unit]
	if !ok {
		u = def
	}

	return u
}

// ParseCurrentNetem runs tc to get the current netem configuration for the
// specified device and then attempts to parse it into a Netem object
func ParseCurrentNetem(device string) *Netem {
	out, err := exec.Command("tc", "qdisc", "show", "dev", device).Output()
	if err != nil {
		log.Fatal(err)
	}

	rules := strings.ToLower(string(out))

	return ParseNetem(rules)
}

// ParseNetem will attempt to parse the specified netem configuration
func ParseNetem(rule string) *Netem {
	netem := Netem{}
	netem.Parse(rule)

	return &netem
}

// RemoveNetemConfig runs a tc command to remove any netem settings applied to
// the specified device
func RemoveNetemConfig(device string) error {
	cmd := exec.Command("tc", "qdisc", "del", "dev", device, "root")
	out, err := cmd.CombinedOutput()
	if err != nil && err.Error() != "exit status 2" {
		log.Println("Failed to remove netem settings: " + err.Error())
		log.Println(string(out))
		return err
	}

	log.Println("Successfully removed netem settings for", device)
	SaveConfig(config, *cfgPath)

	return nil
}

func str2f(val string) float64 {
	fval, _ := strconv.ParseFloat(val, 32)
	return fval
}

func str2i(val string) int64 {
	ival, _ := strconv.ParseInt(val, 10, 0)
	return ival
}

func f2str(val float64) string {
	return strconv.FormatFloat(val, 'f', 2, 32)
}

func UnitToMs(value float64, unit string) (float64, string) {
	if unit == "us" {
		value /= 1000
	} else if unit == "s" {
		value *= 1000
	}

	unit = "ms"
	return value, unit
}
