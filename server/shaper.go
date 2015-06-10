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

	// inDev (internal device) is the name of the network interface which
	// connects to the same switch/router of the machines whose traffic shall
	// be shaped
	inDev = flag.String("int", "", "Name of NIC on internal network")

	// exDev (external device) is the name of the network interface which
	// connects the restricted devices to other services, such as the Internet
	exDev = flag.String("ext", "", "Name of NIC on external network")

	// host is the interface that will accept web requests. Use the default
	// "0.0.0.0" to bind to all interfaces
	host = flag.String("bind", "0.0.0.0", "Bind to this address for the web UI")

	// port is the port which shall accept web requests on the interface
	// specified above. The default is port 81 as a cheap check for root
	// privileges (which you need in order to use netem itself)
	port = flag.Int("port", 80, "Bind to this port")
)

func init() {
	var inValid, exValid bool

	log.Println("Starting Network Shaper", VERSION)

	flag.Parse()

	nics, _ := net.Interfaces()
	for _, nic := range nics {
		if nic.Name == *inDev {
			inValid = true
		}
		if nic.Name == *exDev {
			exValid = true
		}
	}

	if !inValid {
		log.Fatalln("Invalid internal network interface name:", *inDev)
	}

	if !exValid {
		log.Fatalln("Invalid external network interface name:", *exDev)
	}

	if *inDev == *exDev {
		log.Fatalln("You must specify different NICs for your internal and external networks")
	}
}

func main() {
	// allow netem configuration to be removed
	http.HandleFunc("/remove/internal", func(w http.ResponseWriter, req *http.Request) {
		removeConfig(*inDev, w, req)
	})
	http.HandleFunc("/remove/external", func(w http.ResponseWriter, req *http.Request) {
		removeConfig(*exDev, w, req)
	})

	// allow netem configuration to be updated
	http.HandleFunc("/apply/internal", func(w http.ResponseWriter, req *http.Request) {
		applyConfig(*inDev, w, req)
	})
	http.HandleFunc("/apply/external", func(w http.ResponseWriter, req *http.Request) {
		applyConfig(*exDev, w, req)
	})

	// expose the current netem configuration
	http.HandleFunc("/refresh/internal", func(w http.ResponseWriter, req *http.Request) {
		refreshConfig(*inDev, w, req)
	})
	http.HandleFunc("/refresh/external", func(w http.ResponseWriter, req *http.Request) {
		refreshConfig(*exDev, w, req)
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
	bind := fmt.Sprintf("%s:%d", *host, *port)
	log.Printf("Listening at http://%s\n", bind)
	log.Println("Internal NIC:", *inDev)
	log.Println("External NIC:", *exDev)

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
