package main

import (
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

var (
	// DELAY_RE is used to parse packet delay configuration from tc
	DELAY_RE = regexp.MustCompile(`delay\s+(?P<delay>\d+(?:\.\d+)?)(?P<delay_unit>(?:m|u)s)(?:\s+(?P<delay_jitter>\d+(?:\.\d+)?)(?P<delay_jitter_unit>(?:m|u)s)(?:\s+(?P<delay_corr>\d+(?:\.\d+)?)%)?)?`)

	// LOSS_RE is used to parse packet loss configuration from tc
	LOSS_RE = regexp.MustCompile(`loss\s+(?P<loss_pct>\d+(?:\.\d+)?)%(?:\s+(?P<loss_corr>\d+(?:\.\d+)?)%)?`)

	// DUPE_RE is used to parse packet duplication configuration from tc
	DUPE_RE = regexp.MustCompile(`duplicate\s+(?P<dup_pct>\d+(?:\.\d+)?)%(?:\s+(?P<dup_corr>\d+(?:\.\d+)?)%)?`)

	// REORDER_RE is used to parse packet reordering configuration from tc
	REORDER_RE = regexp.MustCompile(`reorder\s+(?P<reorder_pct>\d+(?:\.\d+)?)%(?:\s+(?P<reorder_corr>\d+(?:\.\d+)?)%)?`)

	// GAP_RE is used to parse packet reordering gap configuration from tc
	GAP_RE = regexp.MustCompile(`gap\s+(?P<reorder_gap>\d+)`)

	// CORRUPT_RE is used to parse packet corruption configuration from tc
	CORRUPT_RE = regexp.MustCompile(`corrupt\s+(?P<corrupt_pct>\d+(?:\.\d+)?)%(?:\s+(?P<corrupt_corr>\d+(?:\.\d+)?)%)?`)

	// RATE_RE is used to parse rate limiting configuration from tc
	RATE_RE = regexp.MustCompile(`rate\s+(?P<rate>\d+(?:\.\d+)?)(?P<rate_unit>bit|kbit|mbit|gbit|tbit|bps|kbps|mbps|gbps|tbps)(?:\s+packetoverhead\s+(?P<rate_packet_overhead>\d+)(?:\s+cellsize\s+(?P<rate_cell_size>\d+)(?:\s+celloverhead\s+(?P<rate_cell_overhead>\d+))?)?)?`)
)

// Netem represents the netem configuration of a specific network interface
type Netem struct {
	// packet delay configuration
	Delay           float64 `json:"delay"`
	DelayUnit       string  `json:"delay_unit"`
	DelayJitter     float64 `json:"delay_jitter"`
	DelayJitterUnit string  `json:"delay_jitter_unit"`
	DelayCorr       float64 `json:"delay_corr"`

	// packet loss configuration
	LossPct  float64 `json:"loss_pct"`
	LossCorr float64 `json:"loss_corr"`

	// packet duplication configuration
	DupePct  float64 `json:"dupe_pct"`
	DupeCorr float64 `json:"dupe_corr"`

	// packet corruption configuration
	CorruptPct  float64 `json:"corrupt_pct"`
	CorruptCorr float64 `json:"corrupt_corr"`

	// packet reordering configuration
	ReorderPct  float64 `json:"reorder_pct"`
	ReorderCorr float64 `json:"reorder_corr"`
	ReorderGap  int64   `json:"reorder_gap"`

	// rate limiting configuration
	Rate             float64 `json:"rate"`
	RateUnit         string  `json:"rate_unit"`
	RatePktOverhead  int64   `json:"rate_pkt_overhead"`
	RateCellSize     int64   `json:"rate_cell_size"`
	RateCellOverhead int64   `json:"rate_cell_overhead"`
}

func (n *Netem) Parse(rule string) {
	n.ParseDelay(rule)
	n.ParseLoss(rule)
	n.ParseDuplication(rule)
	n.ParseCorruption(rule)
	n.ParseReorder(rule)
	n.ParseRate(rule)
}

func (n *Netem) Apply(device string) error {
	var (
		args []string
		unit string
	)

	if n.Delay > 0 {
		unit = GetTimeUnit(n.DelayUnit, "ms")
		args = append(args, "delay")
		args = append(args, f2str(n.Delay)+unit)

		if n.DelayJitter > 0 {
			unit = GetTimeUnit(n.DelayJitterUnit, "ms")
			args = append(args, f2str(n.DelayJitter)+unit)

			if n.DelayCorr > 0 {
				args = append(args, f2str(n.DelayCorr)+"%")
			}
		}

		// packet reordering requires a delay to be specified
		if n.ReorderPct > 0 {
			args = append(args, "reorder")
			args = append(args, f2str(n.ReorderPct)+"%")
			if n.ReorderCorr > 0 {
				args = append(args, f2str(n.ReorderCorr)+"%")
			}

			if n.ReorderGap > 0 {
				args = append(args, "gap")
				args = append(args, strconv.FormatInt(n.ReorderGap, 10))
			}
		}

	}

	if n.CorruptPct > 0 {
		args = append(args, "corrupt")
		args = append(args, f2str(n.CorruptPct)+"%")
		if n.CorruptCorr > 0 {
			args = append(args, f2str(n.CorruptCorr)+"%")
		}
	}

	if n.DupePct > 0 {
		args = append(args, "duplicate")
		args = append(args, f2str(n.DupePct)+"%")
		if n.DupeCorr > 0 {
			args = append(args, f2str(n.DupeCorr)+"%")
		}
	}

	if n.LossPct > 0 {
		args = append(args, "loss")
		args = append(args, f2str(n.LossPct)+"%")
		if n.LossCorr > 0 {
			args = append(args, f2str(n.LossCorr)+"%")
		}
	}

	if n.Rate > 0 {
		args = append(args, "rate")
		unit = GetRateUnit(n.RateUnit, "kbit")
		args = append(args, f2str(n.Rate)+unit)

		// packet overhead can be negative or positive
		if n.RatePktOverhead != 0 {
			args = append(args, strconv.FormatInt(n.RatePktOverhead, 10))

			// cell size is unsigned
			if n.RateCellSize > 0 {
				args = append(args, strconv.FormatInt(n.RateCellSize, 10))

				// cell overhead can be negative or positive
				if n.RateCellOverhead != 0 {
					args = append(args, strconv.FormatInt(n.RateCellOverhead, 10))
				}
			}
		}
	}

	// try to apply the settings if we have any to set
	if len(args) > 0 {
		defArgs := []string{"qdisc", "replace", "dev", device, "root", "netem"}
		args = append(defArgs, args...)

		log.Println("Applying: tc", strings.Join(args, " "))
		out, err := exec.Command("tc", args...).CombinedOutput()
		if err != nil {
			log.Println("Error: ", string(out))
			return err
		}

		return nil
	}

	// if we don't have any valid netem configuration, we're effectively
	// removing our netem policy
	return RemoveNetemConfig(device)
}

func (n *Netem) ParseDelay(rule string) {
	match := DELAY_RE.FindStringSubmatch(rule)
	if len(match) >= 3 {
		n.Delay = str2f(match[1])
		n.DelayUnit = match[2]

		if len(match) >= 5 {
			n.DelayJitter = str2f(match[3])
			n.DelayJitterUnit = match[4]

			if len(match) == 6 {
				n.DelayCorr = str2f(match[5])
			}
		}
	}
}

func (n *Netem) ParseLoss(rule string) {
	match := LOSS_RE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.LossPct = str2f(match[1])

		if len(match) == 3 {
			n.LossCorr = str2f(match[2])
		}
	}
}

func (n *Netem) ParseDuplication(rule string) {
	match := DUPE_RE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.DupePct = str2f(match[1])

		if len(match) == 3 {
			n.DupeCorr = str2f(match[2])
		}
	}
}

func (n *Netem) ParseCorruption(rule string) {
	match := CORRUPT_RE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.CorruptPct = str2f(match[1])

		if len(match) == 3 {
			n.CorruptCorr = str2f(match[2])
		}
	}
}

func (n *Netem) ParseReorder(rule string) {
	match := REORDER_RE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.ReorderPct = str2f(match[1])

		if len(match) == 3 {
			n.ReorderCorr = str2f(match[2])
		}

		match = GAP_RE.FindStringSubmatch(rule)
		if len(match) == 2 {
			n.ReorderGap = str2i(match[1])
		}
	}
}

func (n *Netem) ParseRate(rule string) {
	match := RATE_RE.FindStringSubmatch(rule)
	if len(match) >= 3 {
		n.Rate = str2f(match[1])
		n.RateUnit = match[2]

		if len(match) >= 4 {
			n.RatePktOverhead = str2i(match[3])

			if len(match) >= 5 {
				n.RateCellSize = str2i(match[4])

				if len(match) == 6 {
					n.RateCellOverhead = str2i(match[5])
				}
			}
		}
	}
}
