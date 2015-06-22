package main

import (
	"github.com/naoina/toml"

	"io/ioutil"
	"log"
)

const DEFAULT_CFG = `
host = "0.0.0.0"
port = 80

[inbound]
device = "eth0"

	[inbound.netem]
	delay = 0.0
	delay_unit = "ms"
	delay_jitter = 0.0
	delay_jitter_unit = "ms"
	delay_corr = 0.0

	reorder_pct = 0.0
	reorder_corr = 0.0
	reorder_gap = 0

	loss_pct = 0.0
	loss_corr = 0.0

	dupe_pct = 0.0
	dupe_corr = 0.0

	corrupt_pct = 0.0
	corrupt_corr = 0.0

	rate = -1.0
	rate_unit = "kbps"
	rate_pkt_overhead = 0
	rate_cell_size = 0
	rate_cell_overhead = 0

[outbound]
device = "eth1"

	[outbound.netem]
	delay = 0.0
	delay_unit = "ms"
	delay_jitter = 0.0
	delay_jitter_unit = "ms"
	delay_corr = 0.0

	reorder_pct = 0.0
	reorder_corr = 0.0
	reorder_gap = 0

	loss_pct = 0.0
	loss_corr = 0.0

	dupe_pct = 0.0
	dupe_corr = 0.0

	corrupt_pct = 0.0
	corrupt_corr = 0.0

	rate = -1.0
	rate_unit = "kbps"
	rate_pkt_overhead = 0
	rate_cell_size = 0
	rate_cell_overhead = 0
`

type ShaperConfig struct {
	Host    string
	Port    int
	Inbound struct {
		Device string
		Netem  Netem
	}
	Outbound struct {
		Device string
		Netem  Netem
	}
}

// GetConfig attempts to read configuration from a file, falling back to the
// default config if no such file is present and/or readable
func GetConfig(path string) *ShaperConfig {
	buf, err := ioutil.ReadFile(path)
	if err != nil {
		log.Printf("ERR: %s\n", err.Error())
		log.Println("Using default configuration")
		buf = append(buf, []byte(DEFAULT_CFG)...)
	}

	var cfg ShaperConfig
	if err := toml.Unmarshal(buf, &cfg); err != nil {
		log.Fatalf("Failed to load configuration: %s\n", err.Error())
	}

	return &cfg
}

// SaveConfig serializes the specified configuration as TOML and writes it to
// the specified file.
func SaveConfig(cfg *ShaperConfig, path string) (success bool) {
	buf, err := toml.Marshal(*cfg)
	if err != nil {
		log.Printf("Failed to serialize config: %s\n", err.Error())
	} else if err = ioutil.WriteFile(path, buf, 0644); err != nil {
		log.Printf("Failed to write config to '%s': %s\n", path, err.Error())
	}

	return success
}
