// Package networkshaper defines top-level configuration for the Network Shaper tool
package networkshaper

import (
	"encoding/json"
	"os"

	"github.com/codekoala/network-shaper/netem"
	"github.com/rs/zerolog/log"
)

type (
	// ShaperConfig defines the top-level configuration for the Network Shaper tool
	ShaperConfig struct {
		Host      string      `json:"host"`
		Port      int         `json:"port"`
		AllowNoIP bool        `json:"allow_no_ip"`
		Inbound   NetemConfig `json:"inbound"`
		Outbound  NetemConfig `json:"outbound"`
	}

	// NetemConfig defines the netem configuration for a device
	NetemConfig struct {
		Device string      `json:"device"`
		Label  string      `json:"label"`
		Netem  netem.Netem `json:"netem"`
	}
)

// GetDefaultConfig function returns a default configuration.
func GetDefaultConfig() *ShaperConfig {
	return &ShaperConfig{
		Host:      "0.0.0.0",
		Port:      80,
		AllowNoIP: false,
		Inbound:   NetemConfig{Device: "eth0", Label: "Inbound", Netem: netem.Netem{
			// Delay:       123.45,
			// DelayJitter: 34.5,
		}},
		Outbound: NetemConfig{Device: "eth1", Label: "Outbound", Netem: netem.Netem{}},
	}
}

// SaveConfig serializes the specified configuration as json and writes it to the specified file.
func SaveConfig(cfg *ShaperConfig, path string) (success bool) {
	buf, err := json.MarshalIndent(*cfg, "", "  ")
	if err != nil {
		log.Error().Err(err).Msg("failed to serialize config")
	} else if err = os.WriteFile(path, buf, 0644); err != nil {
		log.Error().Err(err).Str("path", path).Msg("failed to write config")
	} else {
		success = true
	}

	return success
}
