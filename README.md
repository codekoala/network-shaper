Network Shaper
==============

This project is a very simplistic user interface for
[netem](http://www.linuxfoundation.org/collaborate/workgroups/networking/netem).
It is designed to allow users to apply basic traffic shaping rules to simulate
poor network conditions without being required to learn the ``netem`` command
line interface.

The UI is written using [polymer](https://www.polymer-project.org/1.0/), mostly
as an excuse for me to become familiar with polymer. The backend is written
in [Go](https://golang.org), and should have no external dependencies when
built (aside from ``tc``, of course).

I'm sure there are plenty of things that can be done to improve both the UI and
backend of this project. Contributions are more than welcome, particularly in
the area of cleaning out cruft from this repository (which was created using
the contents of the [polymer starter kit](https://github.com/PolymerElements/polymer-starter-kit/releases).

Assumptions
-----------

This tool was built for a particular scenario, and some assumptions are made
because of it.

* It is assumed that the service will run as root in order to apply changes to
  the network interfaces. No special logic currently exists to ensure that the
  executable can do what it needs to before starting to handle requests from
  the UI.
* It is assumed that the server will reside on a machine with two physical
  network interfaces, one for "external" traffic coming into the network
  controlled by this tool, and another interface for "internal" traffic leaving
  the controlled network.

  This tool has only been tested on a machine with two physical Gigabit network
  interfaces.

Screenshots
-----------

![All sections](screenshots/network-shaper-1.png?raw=true "All sections")
![Delay/Reorder packets](screenshots/network-shaper-2.png?raw=true "Delay/Reorder packets")
![Rate limiting](screenshots/network-shaper-3.png?raw=true "Rate limiting")
![Packet corruption, duplication, and loss](screenshots/network-shaper-4.png?raw=true "Packet corruption, duplication, and loss")
![Devices](screenshots/network-shaper-5.png?raw=true "Devices")

Building
--------

The requirements for building this project are:

* [nodejs](https://nodejs.org) for npm, to install other dependencies
* [gulp](http://gulpjs.com/) as a build tool
* [bower](http://bower.io/), a package manager
* Go 1.x (currently built with 1.4.2)
* [go-bindata](https://github.com/jteeuwen/go-bindata) to bundle static assets
  into the Go binary
* [go-bindata-assetfs](https://github.com/elazarl/go-bindata-assetfs) to easily
  serve the web UI
* [upx](http://upx.sourceforge.net/) to compress binaries
* [goupx](https://github.com/pwaller/goupx) to fix a bug in upx to handle
  64-bit Go binaries

The steps to build this tool are:

```sh
$ npm install gulp                                  # install gulp
$ npm install bower                                 # install bower
$ npm install                                       # install polymer starter kit dependencies
$ bower install                                     # install UI dependencies
$ go get github.com/jteeuwen/go-bindata/...         # for bundling the UI
$ go get github.com/elazarl/go-bindata-assetfs/...  # for serving the UI
$ make dist                                         # compile UI and executable
```

At this point, the ``network-shaper`` binary should appear in the ``server/``
directory. This is the final executable.

You can proceed to build an RPM using the following command:

```sh
$ make rpm
```

Or you may build an ArchLinux package:

```sh
$ make arch
```

Using This Tool
---------------

Once you have the ``network-shaper`` binary, you may invoke it using the
command line as such:

```sh
# network-shaper -c config.json
```

A sample configuration file can be found in the repository as ``sample.json``
and looks like this:

```json
{
  "host": "0.0.0.0",
  "port": 80,
  "inbound": {
    "device": "enp2s0",
    "netem": {
      "delay": 0,
      "delay_unit": "ms",
      "delay_jitter": 0,
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
      "rate_unit": "kbit",
      "rate_pkt_overhead": 0,
      "rate_cell_size": 0,
      "rate_cell_overhead": 0
    }
  },
  "outbound": {
    "device": "enp4s0",
    "netem": {
      "delay": 0,
      "delay_unit": "ms",
      "delay_jitter": 0,
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
      "rate_unit": "kbit",
      "rate_pkt_overhead": 0,
      "rate_cell_size": 0,
      "rate_cell_overhead": 0
    }
  }
}
```

The most basic configuration file would look like this:

```json
{
  "host": "0.0.0.0",
  "port": 80,
  "inbound": {
    "device": "enp2s0"
  },
  "outbound": {
    "device": "enp4s0"
  }
}
```

The rest of the configuration file is generated by the tool once you apply
settings.

The purpose of these configuration values are:

* ``host``: the IP to bind the web UI to. ``0.0.0.0`` means that the server
  will accept requests on any interface on the host machine. ``127.0.0.1``
  means the server will only accept requests made from the host itself.
* ``port``: the TCP port on which the server will accept requests. Note that
  if you have any other web server software installed and running, such as
  Apache or Nginx, port 80 will likely conflict with their default
  configuration.
* ``inbound.device``: the name of the network interface connected to the
  "internal" network, or the network that *is* influenced by the rules set
  by this tool.
* ``outbound.device``: the name of the network interface connected to the
  "external" network, or the network that *is not* influenced by the rules set
  by this tool.

Contributing
------------

We welcome your bug reports, PRs for improvements, docs and anything you think
would improve the experience for other developers.
