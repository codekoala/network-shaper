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
	"os"
)

var (
	VERSION string

	// host is the interface that will accept web requests. Use the default
	// "0.0.0.0" to bind to all interfaces
	host = flag.String("bind", "0.0.0.0", "Bind to this address for the web UI")

	// port is the port which shall accept web requests on the interface
	// specified above. The default is port 81 as a cheap check for root
	// privileges (which you need in order to use netem itself)
	port = flag.Int("port", 80, "Bind to this port")

	// nicName is the name of the network interface to which netem settings
	// will be applied
	nicName string
)

func init() {
	log.Println("Starting Network Shaper", VERSION)

	flag.Parse()

	if len(os.Args) < 2 {
		log.Fatalln("Please specify a network interface")
	} else if len(os.Args) > 2 {
		log.Fatalln("Too many arguments")
	}

	nics, _ := net.Interfaces()
	for _, nic := range nics {
		if nic.Name == os.Args[1] {
			nicName = os.Args[1]
			return
		}
	}

	log.Fatalln("Invalid network interface name")
}

func main() {
	// allow netem configuration to be removed
	http.HandleFunc("/remove", removeConfig)

	// allow netem configuration to be updated
	http.HandleFunc("/apply", applyConfig)

	// expose the current netem configuration
	http.HandleFunc("/refresh", refreshConfig)

	// serve static files for the web UI
	http.Handle("/", http.FileServer(&assetfs.AssetFS{
		Asset:    Asset,
		AssetDir: AssetDir,
		Prefix:   "../dist",
	}))

	// begin accepting web requests
	bind := fmt.Sprintf("%s:%d", *host, *port)
	log.Printf("Listening at http://%s\n", bind)

	if err := http.ListenAndServe(bind, nil); err != nil {
		log.Fatalln(err)
	}
}

// refreshConfig queries the current netem configuration for the specified
// device and returns it as JSON to the client. Configuration may be requested
// using any HTTP method.
func refreshConfig(w http.ResponseWriter, req *http.Request) {
	n := ParseCurrentNetem(nicName)
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
func applyConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	var msg string
	log.Println("Updating netem for", nicName)

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
	err = netem.Apply(nicName)
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
func removeConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	log.Println("Removing netem configuration for", nicName)
	RemoveNetemConfig(nicName)

	refreshConfig(w, req)
}
