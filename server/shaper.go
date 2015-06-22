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
)

var (
	VERSION = "dev"

	// cfgPath is the path to the file containing configuration values for this
	// application
	cfgPath = flag.String("c", "/etc/network-shaper.toml", "Path to configuration file")

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
	http.HandleFunc("/remove/internal", func(w http.ResponseWriter, req *http.Request) {
		removeConfig(config.Inbound.Device, w, req)
	})
	http.HandleFunc("/remove/external", func(w http.ResponseWriter, req *http.Request) {
		removeConfig(config.Outbound.Device, w, req)
	})

	// allow netem configuration to be updated
	http.HandleFunc("/apply/internal", func(w http.ResponseWriter, req *http.Request) {
		applyConfig(config.Inbound.Device, w, req)
	})
	http.HandleFunc("/apply/external", func(w http.ResponseWriter, req *http.Request) {
		applyConfig(config.Outbound.Device, w, req)
	})

	// expose the current netem configuration
	http.HandleFunc("/refresh/internal", func(w http.ResponseWriter, req *http.Request) {
		refreshConfig(config.Inbound.Device, w, req)
	})
	http.HandleFunc("/refresh/external", func(w http.ResponseWriter, req *http.Request) {
		refreshConfig(config.Outbound.Device, w, req)
	})

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

// refreshConfig queries the current netem configuration for the specified
// device and returns it as JSON to the client. Configuration may be requested
// using any HTTP method.
func refreshConfig(device string, w http.ResponseWriter, req *http.Request) {
	n := ParseCurrentNetem(device)
	j, err := json.Marshal(n)
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

// applyConfig tries to update netem configuration for the specified device.
// Changes must be submitted as an HTTP POST request.
func applyConfig(device string, w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	var msg string
	log.Println("Updating netem for", device)

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		msg = "Failed to read request: " + err.Error()
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	// parse the new netem settings sent by the client
	var netem Netem
	err = json.Unmarshal(body, &netem)
	if err != nil {
		msg = "Failed to parse request: " + err.Error()
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	// apply the new settings
	err = netem.Apply(device)
	if err != nil {
		w.WriteHeader(400)
		msg = "Failed to apply settings: " + err.Error()
	} else {
		msg = "Settings applied successfully"
		SaveConfig(config, *cfgPath)
	}

	log.Println(msg)
	w.Write([]byte(msg))
}

// removeConfig will remove our netem settings from the specified device,
// reverting back to the default configuration. Once complete, the device's
// netem settings are sent back to the client.
func removeConfig(device string, w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	log.Println("Removing netem configuration for", device)
	RemoveNetemConfig(device)

	refreshConfig(device, w, req)
}

// getValidNics offers a list of NICs that are present on this system
func getValidNics(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		w.WriteHeader(405)
		return
	}

	nics, _ := net.Interfaces()
	nicsJson, err := json.Marshal(nics)
	if err != nil {
		msg := "Failed to serialize NICs: " + err.Error()
		log.Println(msg)

		w.WriteHeader(500)
		w.Write([]byte(msg))
	} else {
		w.Write(nicsJson)
	}
}
