package main

import (
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

var (
	LIMIT_RE = regexp.MustCompile(`limit\s+(?P<limit>\d+)`)

	DELAY_RE = regexp.MustCompile(`delay\s+(?P<delay>\d+(?:\.\d+)?)(?P<delay_unit>(?:m|u)s)(?:\s+(?P<delay_jitter>\d+(?:\.\d+)?)(?P<delay_jitter_unit>(?:m|u)s)(?:\s+(?P<delay_corr>\d+(?:\.\d+)?)%)?)?`)

	LOSS_RE = regexp.MustCompile(`loss\s+(?P<loss_pct>\d+(?:\.\d+)?)%(?:\s+(?P<loss_corr>\d+(?:\.\d+)?)%)?`)

	DUPE_RE = regexp.MustCompile(`duplicate\s+(?P<dup_pct>\d+(?:\.\d+)?)%(?:\s+(?P<dup_corr>\d+(?:\.\d+)?)%)?`)

	REORDER_RE = regexp.MustCompile(`reorder\s+(?P<reorder_pct>\d+(?:\.\d+)?)%(?:\s+(?P<reorder_corr>\d+(?:\.\d+)?)%)?`)
	GAP_RE     = regexp.MustCompile(`gap\s+(?P<reorder_gap>\d+)`)

	CORRUPT_RE = regexp.MustCompile(`corrupt\s+(?P<corrupt_pct>\d+(?:\.\d+)?)%(?:\s+(?P<corrupt_corr>\d+(?:\.\d+)?)%)?`)

	RATE_RE = regexp.MustCompile(`rate\s+(?P<rate>\d+(?:\.\d+)?)(?P<rate_unit>bit|kbit|mbit|gbit|tbit|bps|kbps|mbps|gbps|tbps)(?:\s+packetoverhead\s+(?P<rate_packet_overhead>\d+)(?:\s+cellsize\s+(?P<rate_cell_size>\d+)(?:\s+celloverhead\s+(?P<rate_cell_overhead>\d+))?)?)?`)

	PARSERS = []*regexp.Regexp{LIMIT_RE, DELAY_RE, LOSS_RE, DUPE_RE, REORDER_RE, GAP_RE, CORRUPT_RE, RATE_RE}

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

type Netem struct {
	Delay           float64 `json:"delay"`
	DelayUnit       string  `json:"delay_unit"`
	DelayJitter     float64 `json:"delay_jitter"`
	DelayJitterUnit string  `json:"delay_jitter_unit"`
	DelayCorr       float64 `json:"delay_corr"`

	LossPct  float64 `json:"loss_pct"`
	LossCorr float64 `json:"loss_corr"`

	DupePct  float64 `json:"dupe_pct"`
	DupeCorr float64 `json:"dupe_corr"`

	CorruptPct  float64 `json:"corrupt_pct"`
	CorruptCorr float64 `json:"corrupt_corr"`

	ReorderPct  float64 `json:"reorder_pct"`
	ReorderCorr float64 `json:"reorder_corr"`
	ReorderGap  int64   `json:"reorder_gap"`

	Rate             float64 `json:"rate"`
	RateUnit         string  `json:"rate_unit"`
	RatePktOverhead  int64   `json:"rate_pkt_overhead"`
	RateCellSize     int64   `json:"rate_cell_size"`
	RateCellOverhead int64   `json:"rate_cell_overhead"`
}

func GetTimeUnit(unit, def string) string {
	u, ok := VALID_TIME_UNITS[unit]
	if !ok {
		u = def
	}

	return u
}

func GetRateUnit(unit, def string) string {
	u, ok := VALID_RATE_UNITS[unit]
	if !ok {
		u = def
	}

	return u
}

func ParseCurrentNetem(device string) *Netem {
	out, err := exec.Command("tc", "qdisc", "show", "dev", device).Output()
	if err != nil {
		log.Fatal(err)
	}

	rules := strings.ToLower(string(out))
	//log.Printf("Found rules: %s\n", rules)

	return ParseNetem(rules)
}

func ParseNetem(rule string) *Netem {
	netem := Netem{}

	netem.Parse(rule)

	return &netem
}

func RemoveNetemConfig(nic string) error {
	cmd := exec.Command("tc", "qdisc", "del", "dev", nic, "root")
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Println("Failed to remove netem settings: " + err.Error())
		log.Println(string(out))
		return err
	}

	log.Println("Successfully removed netem settings")

	return nil
}

func (n *Netem) Parse(rule string) {
	n.ParseDelay(rule)
	n.ParseLoss(rule)
	n.ParseDuplication(rule)
	n.ParseCorruption(rule)
	n.ParseReorder(rule)
	n.ParseRate(rule)
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

		if n.RatePktOverhead != 0 {
			args = append(args, strconv.FormatInt(n.RatePktOverhead, 10))

			if n.RateCellSize > 0 {
				args = append(args, strconv.FormatInt(n.RateCellSize, 10))

				if n.RateCellOverhead != 0 {
					args = append(args, strconv.FormatInt(n.RateCellOverhead, 10))
				}
			}
		}
	}

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
