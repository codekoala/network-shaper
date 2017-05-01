package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/elazarl/go-bindata-assetfs"
)

var (
	VERSION = "dev"

	// cfgPath is the path to the file containing configuration values for this
	// application
	cfgPath = flag.String("c", "/etc/network-shaper.json", "Path to configuration file")

	config *ShaperConfig
)

func init() {
	var inValid, exValid bool

	log.Println("Starting Network Shaper", VERSION)

	flag.Parse()
	config = GetConfig(*cfgPath)

	nics, _ := net.Interfaces()
	for _, nic := range nics {
		if nic.Name == config.Inbound.Device {
			inValid = true
		}
		if nic.Name == config.Outbound.Device {
			exValid = true
		}
	}

	if !inValid {
		log.Fatalln("Invalid internal network interface name:", config.Inbound.Device)
	}

	if !exValid {
		log.Fatalln("Invalid external network interface name:", config.Outbound.Device)
	}

	if config.Inbound.Device == config.Outbound.Device {
		log.Fatalln("You must specify different NICs for your internal and external networks")
	}

	if config.Inbound.Label == "" {
		config.Inbound.Label = "Inbound"
	}

	if config.Outbound.Label == "" {
		config.Outbound.Label = "Outbound"
	}
}

var (
	templateFuncs = template.FuncMap{
		"route": func() string {
			return `{{route}}`
		},
	}

	staticFs = http.FileServer(&assetfs.AssetFS{
		Asset:    Asset,
		AssetDir: AssetDir,
		Prefix:   "../dist",
	})
)

func main() {
	var (
		tpl   []byte
		index *template.Template
		err   error
	)

	if tpl, err = Asset("../dist/index.html"); err != nil {
		log.Fatalf("unable to load index template: %s", err)
	}

	if index, err = template.New("index").Funcs(templateFuncs).Parse(string(tpl)); err != nil {
		log.Fatalf("unable to parse index template: %s", err)
	}

	// allow netem configuration to be removed
	http.HandleFunc("/remove", removeConfig)

	// allow netem configuration to be updated
	http.HandleFunc("/apply", applyConfig)

	// expose the current netem configuration
	http.HandleFunc("/refresh", refreshConfig)

	// allow the user to select from the NICs available on this system
	http.HandleFunc("/nics", getValidNics)

	// serve static files for the web UI
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			index.Execute(w, config)
		} else {
			staticFs.ServeHTTP(w, r)
		}
	})

	// begin accepting web requests
	bind := fmt.Sprintf("%s:%d", config.Host, config.Port)
	log.Printf("Listening at http://%s\n", bind)
	log.Println("Internal NIC:", config.Inbound.Device)
	log.Println("External NIC:", config.Outbound.Device)

	log.Println("Restoring inbound shaping...")
	config.Inbound.Netem.Apply(config.Inbound.Device)

	log.Println("Restoring outbound shaping...")
	config.Outbound.Netem.Apply(config.Outbound.Device)

	if err := http.ListenAndServe(bind, nil); err != nil {
		log.Fatalln(err)
	}
}

// refreshConfig queries the current netem configuration and returns it as JSON
// to the client. Configuration may be requested using any HTTP method.
func refreshConfig(w http.ResponseWriter, req *http.Request) {
	config.Inbound.Netem = *ParseCurrentNetem(config.Inbound.Device)
	config.Outbound.Netem = *ParseCurrentNetem(config.Outbound.Device)

	j, err := json.Marshal(config)
	if err != nil {
		msg := "Failed to parse netem configuration: " + err.Error()
		log.Println(msg)

		w.WriteHeader(500)
		w.Write([]byte(msg))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(j)
}

// applyConfig tries to update netem configuration. Changes must be submitted
// as an HTTP POST request.
func applyConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	var msg string
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		msg = "Failed to read request: " + err.Error()
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	// parse the new netem settings sent by the client
	var newConfig ShaperConfig
	err = json.Unmarshal(body, &newConfig)
	if err != nil {
		msg = "Failed to parse request: " + err.Error()
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	// sanity check!
	if newConfig.Inbound.Device == newConfig.Outbound.Device {
		msg = "Inbound and outbound devices must not be the same"
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	// apply the new settings
	err = newConfig.Inbound.Netem.Apply(newConfig.Inbound.Device)
	if err != nil {
		w.WriteHeader(400)
		msg = "Failed to apply inbound settings: " + err.Error()
	} else {
		err = newConfig.Outbound.Netem.Apply(newConfig.Outbound.Device)
		if err != nil {
			w.WriteHeader(400)
			msg = "Failed to apply outbound settings: " + err.Error()
		} else {
			w.WriteHeader(202)
			msg = "Settings applied successfully"

			config.AllowNoIp = newConfig.AllowNoIp

			config.Inbound.Device = newConfig.Inbound.Device
			config.Inbound.Label = newConfig.Inbound.Label
			config.Inbound.Netem = newConfig.Inbound.Netem

			config.Outbound.Device = newConfig.Outbound.Device
			config.Outbound.Label = newConfig.Outbound.Label
			config.Outbound.Netem = newConfig.Outbound.Netem

			SaveConfig(config, *cfgPath)
		}
	}

	log.Println(msg)
	w.Write([]byte(msg))
}

// removeConfig will remove our netem settings, reverting back to the default
// configuration. Once complete, the new netem settings are sent back to the
// client.
func removeConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	log.Println("Removing netem configuration")
	RemoveNetemConfig(config.Inbound.Device)
	RemoveNetemConfig(config.Outbound.Device)

	refreshConfig(w, req)
}

type SimpleNic struct {
	Name  string `json:"name"`
	Ip    string `json:"ip"`
	Label string `json:"label"`
}

type ValidNicResponse struct {
	AllowNoIp     bool        `json:"allow_no_ip"`
	InboundLabel  string      `json:"inbound_label"`
	OutboundLabel string      `json:"outbound_label"`
	AllNics       []SimpleNic `json:"all_devices"`
}

// getValidNics offers a list of NICs that are present on this system
func getValidNics(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		w.WriteHeader(405)
		return
	}

	body := ValidNicResponse{
		AllowNoIp:     config.AllowNoIp,
		InboundLabel:  config.Inbound.Label,
		OutboundLabel: config.Outbound.Label,
	}

	nics, _ := net.Interfaces()
	for _, nic := range nics {
		added := false
		addrs, _ := nic.Addrs()
		for _, addrO := range addrs {
			addr := strings.Split(addrO.String(), "/")[0]
			ip := net.ParseIP(addr)
			if ip.To4() == nil {
				continue
			}

			// we have a good NIC!
			body.AllNics = append(body.AllNics, SimpleNic{
				Name:  nic.Name,
				Ip:    addr,
				Label: fmt.Sprintf("%s: %s", nic.Name, addr),
			})
			added = true
			break
		}

		if !added && config.AllowNoIp {
			body.AllNics = append(body.AllNics, SimpleNic{
				Name:  nic.Name,
				Label: nic.Name,
			})
		}
	}

	nicsJson, err := json.Marshal(body)
	if err != nil {
		msg := "Failed to serialize NICs: " + err.Error()
		log.Println(msg)

		w.WriteHeader(500)
		fmt.Fprintf(w, msg)
	} else {
		fmt.Fprintf(w, "%s", nicsJson)
	}
}
