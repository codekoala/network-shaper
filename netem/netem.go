// Package netem provides utilities for parsing and setting netem configuration.
package netem

import (
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"github.com/rs/zerolog/log"
)

var (
	// DelayRE is used to parse packet delay configuration from tc
	DelayRE = regexp.MustCompile(`delay\s+(?P<delay>\d+(?:\.\d+)?)(?P<delay_unit>(?:m|u)?s)(?:\s+(?P<delay_jitter>\d+(?:\.\d+)?)(?P<delay_jitter_unit>(?:m|u)?s)(?:\s+(?P<delay_corr>\d+(?:\.\d+)?)%)?)?`)

	// LossRE is used to parse packet loss configuration from tc
	LossRE = regexp.MustCompile(`loss\s+(?P<loss_pct>\d+(?:\.\d+)?)%(?:\s+(?P<loss_corr>\d+(?:\.\d+)?)%)?`)

	// DupeRE is used to parse packet duplication configuration from tc
	DupeRE = regexp.MustCompile(`duplicate\s+(?P<dup_pct>\d+(?:\.\d+)?)%(?:\s+(?P<dup_corr>\d+(?:\.\d+)?)%)?`)

	// ReorderRE is used to parse packet reordering configuration from tc
	ReorderRE = regexp.MustCompile(`reorder\s+(?P<reorder_pct>\d+(?:\.\d+)?)%(?:\s+(?P<reorder_corr>\d+(?:\.\d+)?)%)?`)

	// GapRE is used to parse packet reordering gap configuration from tc
	GapRE = regexp.MustCompile(`gap\s+(?P<reorder_gap>\d+)`)

	// CorruptRE is used to parse packet corruption configuration from tc
	CorruptRE = regexp.MustCompile(`corrupt\s+(?P<corrupt_pct>\d+(?:\.\d+)?)%(?:\s+(?P<corrupt_corr>\d+(?:\.\d+)?)%)?`)

	// RateRE is used to parse rate limiting configuration from tc
	RateRE = regexp.MustCompile(`rate\s+(?P<rate>\d+(?:\.\d+)?)(?P<rate_unit>bit|kbit|mbit|gbit|tbit|bps|kbps|mbps|gbps|tbps)(?:\s+packetoverhead\s+(?P<rate_packet_overhead>\d+)(?:\s+cellsize\s+(?P<rate_cell_size>\d+)(?:\s+celloverhead\s+(?P<rate_cell_overhead>\d+))?)?)?`)
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

// HasDelaySettings method returns true if any delay settings are set
func (n *Netem) HasDelaySettings() bool {
	return n.Delay > 0 || n.DelayJitter > 0 || n.DelayCorr > 0 || n.HasReorderSettings()
}

// HasReorderSettings method returns true if any reorder settings are set
func (n *Netem) HasReorderSettings() bool {
	return n.ReorderPct > 0 || n.ReorderCorr > 0 || n.ReorderGap > 0
}

// HasRateLimitSettings method returns true if any rate limit settings are set
func (n *Netem) HasRateLimitSettings() bool {
	return n.Rate > 0 || n.RatePktOverhead != 0 || n.RateCellSize > 0 || n.RateCellOverhead != 0
}

// Parse method parses the netem state described by `rule`.
func (n *Netem) Parse(rule string) {
	n.ParseDelay(rule)
	n.ParseLoss(rule)
	n.ParseDuplication(rule)
	n.ParseCorruption(rule)
	n.ParseReorder(rule)
	n.ParseRate(rule)
}

// Apply method configures netem for the specified device.
func (n *Netem) Apply(device string) error {
	var (
		args []string
		unit string
	)

	l := log.With().Str("device", device).Logger()

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

		l.Info().Str("rule", strings.Join(args, " ")).Msg("applying rule")
		out, err := exec.Command("tc", args...).CombinedOutput()
		if err != nil {
			l.Error().Err(err).Str("output", string(out)).Msg("failed to apply rule")
			return err
		}

		return nil
	}

	// if we don't have any valid netem configuration, we're effectively
	// removing our netem policy
	return RemoveNetemConfig(device)
}

// ParseDelay method attempts to parse the delay settings from a netem rule string.
func (n *Netem) ParseDelay(rule string) {
	match := DelayRE.FindStringSubmatch(rule)
	if len(match) >= 3 {
		n.Delay, n.DelayUnit = UnitToMs(str2f(match[1]), match[2])

		if len(match) >= 5 {
			n.DelayJitter, n.DelayJitterUnit = UnitToMs(str2f(match[3]), match[4])

			if len(match) == 6 {
				n.DelayCorr = str2f(match[5])
			}
		}
	}
}

// ParseLoss method attempts to parse the packet loss settings from a netem rule string.
func (n *Netem) ParseLoss(rule string) {
	match := LossRE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.LossPct = str2f(match[1])

		if len(match) == 3 {
			n.LossCorr = str2f(match[2])
		}
	}
}

// ParseDuplication method attempts to parse the packet duplication settings from a netem rule string.
func (n *Netem) ParseDuplication(rule string) {
	match := DupeRE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.DupePct = str2f(match[1])

		if len(match) == 3 {
			n.DupeCorr = str2f(match[2])
		}
	}
}

// ParseCorruption method attempts to parse the corruption settings from a netem rule string.
func (n *Netem) ParseCorruption(rule string) {
	match := CorruptRE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.CorruptPct = str2f(match[1])

		if len(match) == 3 {
			n.CorruptCorr = str2f(match[2])
		}
	}
}

// ParseReorder method attempts to parse the packet reordering settings from a netem rule string.
func (n *Netem) ParseReorder(rule string) {
	match := ReorderRE.FindStringSubmatch(rule)
	if len(match) >= 2 {
		n.ReorderPct = str2f(match[1])

		if len(match) == 3 {
			n.ReorderCorr = str2f(match[2])
		}

		match = GapRE.FindStringSubmatch(rule)
		if len(match) == 2 {
			n.ReorderGap = str2i(match[1])
		}
	}
}

// ParseRate method attempts to parse the rate limiting settings from a netem rule string.
func (n *Netem) ParseRate(rule string) {
	match := RateRE.FindStringSubmatch(rule)
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
