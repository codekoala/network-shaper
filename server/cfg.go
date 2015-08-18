package main

import (
	"encoding/json"

	"io/ioutil"
	"log"
)

const DEFAULT_CFG = `
{
  "host": "0.0.0.0",
  "port": 80,
  "inbound": {
    "device": "eth0",
    "netem": {
      "delay": 0,
      "delay_unit": "",
      "delay_jitter": 0,
      "delay_jitter_unit": "",
      "delay_corr": 0,
      "loss_pct": 0,
      "loss_corr": 0,
      "dupe_pct": 0,
      "dupe_corr": 0,
      "corrupt_pct": 0,
      "corrupt_corr": 0,
      "reorder_pct": 0,
      "reorder_corr": 0,
      "reorder_gap": 0,
      "rate": 0,
      "rate_unit": "",
      "rate_pkt_overhead": 0,
      "rate_cell_size": 0,
      "rate_cell_overhead": 0
    }
  },
  "outbound": {
    "device": "eth1",
    "netem": {
      "delay": 50,
      "delay_unit": "ms",
      "delay_jitter": 100,
      "delay_jitter_unit": "ms",
      "delay_corr": 0,
      "loss_pct": 0,
      "loss_corr": 0,
      "dupe_pct": 0,
      "dupe_corr": 0,
      "corrupt_pct": 0,
      "corrupt_corr": 0,
      "reorder_pct": 0,
      "reorder_corr": 0,
      "reorder_gap": 0,
      "rate": 0,
      "rate_unit": "",
      "rate_pkt_overhead": 0,
      "rate_cell_size": 0,
      "rate_cell_overhead": 0
    }
  }
}
`

type ShaperConfig struct {
	Host    string `json:"host"`
	Port    int    `json:"port"`
	Inbound struct {
		Device string `json:"device"`
		Netem  Netem  `json:"netem"`
	} `json:"inbound"`
	Outbound struct {
		Device string `json:"device"`
		Netem  Netem  `json:"netem"`
	} `json:"outbound"`
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
	if err := json.Unmarshal(buf, &cfg); err != nil {
		log.Fatalf("Failed to load configuration: %s\n", err.Error())
	}

	return &cfg
}

// SaveConfig serializes the specified configuration as json and writes it to
// the specified file.
func SaveConfig(cfg *ShaperConfig, path string) (success bool) {
	buf, err := json.MarshalIndent(*cfg, "", "  ")
	if err != nil {
		log.Printf("Failed to serialize config: %s\n", err.Error())
	} else if err = ioutil.WriteFile(path, buf, 0644); err != nil {
		log.Printf("Failed to write config to '%s': %s\n", path, err.Error())
	}

	return success
}
