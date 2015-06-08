package main

import (
	"github.com/elazarl/go-bindata-assetfs"

	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

func main() {
	n := ParseCurrentNetem("em1")
	j, _ := json.Marshal(n)
	log.Printf("%s\n", j)

	http.Handle("/", http.FileServer(&assetfs.AssetFS{Asset: Asset, AssetDir: AssetDir, Prefix: "../dist"}))
	http.HandleFunc("/remove", removeConfig)
	http.HandleFunc("/apply", applyConfig)
	http.HandleFunc("/refresh", refreshConfig)

	err := http.ListenAndServe(":5050", nil)
	if err != nil {
		log.Fatalln(err)
	}
}

func refreshConfig(w http.ResponseWriter, req *http.Request) {
	n := ParseCurrentNetem("em1")
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

func applyConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(400)
		return
	}

	var msg string
	log.Println("Updating netem...")

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		msg = "Failed to read request: " + err.Error()
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	var netem Netem
	err = json.Unmarshal(body, &netem)
	if err != nil {
		msg = "Failed to parse request: " + err.Error()
		log.Println(msg)

		w.WriteHeader(400)
		w.Write([]byte(msg))
		return
	}

	err = netem.Apply("em1")
	if err != nil {
		msg = "Failed to apply settings: " + err.Error()
		w.WriteHeader(400)
	} else {
		msg = "Settings applied successfully"
	}

	log.Println(msg)
	w.Write([]byte(msg))
}

func removeConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		w.WriteHeader(400)
		return
	}

	log.Println("Removing netem configuration")
	RemoveNetemConfig("em1")

	refreshConfig(w, req)
}
