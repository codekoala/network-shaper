package main

import (
	"github.com/elazarl/go-bindata-assetfs"

	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"strings"
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
}

func main() {
	// allow netem configuration to be removed
	http.HandleFunc("/remove", removeConfig)

	// allow netem configuration to be updated
	http.HandleFunc("/apply", applyConfig)

	// expose the current netem configuration
	http.HandleFunc("/refresh", refreshConfig)

	// allow the user to select from the NICs available on this system
	http.HandleFunc("/nics", getValidNics)

	// serve static files for the web UI
	http.Handle("/", http.FileServer(&assetfs.AssetFS{
		Asset:    Asset,
		AssetDir: AssetDir,
		Prefix:   "../dist",
	}))

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
			msg = "Settings applied successfully"
			config.Inbound = newConfig.Inbound
			config.Outbound = newConfig.Outbound
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

// getValidNics offers a list of NICs that are present on this system
func getValidNics(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		w.WriteHeader(405)
		return
	}

	var allNics []SimpleNic
	nics, _ := net.Interfaces()
	for _, nic := range nics {
		addrs, _ := nic.Addrs()
		for _, addrO := range addrs {
			addr := strings.Split(addrO.String(), "/")[0]
			ip := net.ParseIP(addr)
			if ip.To4() == nil {
				continue
			}

			// we have a good NIC!
			allNics = append(allNics, SimpleNic{
				Name:  nic.Name,
				Ip:    addr,
				Label: fmt.Sprintf("%s: %s", nic.Name, addr),
			})
			break
		}
	}

	nicsJson, err := json.Marshal(allNics)
	if err != nil {
		msg := "Failed to serialize NICs: " + err.Error()
		log.Println(msg)

		w.WriteHeader(500)
		w.Write([]byte(msg))
	} else {
		w.Write(nicsJson)
	}
}
