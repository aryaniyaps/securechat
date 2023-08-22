job "caddy" {
  datacenters = ["dc1"]

  group "caddy-group" {
    count = 1

    network {
      mode = "bridge"
      port "http" {
        static = 80
        to     = 80
      }
      port "https" {
        static = 443
        to     = 443
      }
    }

    service {
      name = "caddy"
      tags = ["caddy"]
      port = "http"

      check {
        name     = "http-alive"
        type     = "http"
        path     = "/"
        interval = "10s"
        timeout  = "2s"
      }

      check {
        name     = "https-alive"
        type     = "tcp"
        port     = "https"
        interval = "10s"
        timeout  = "2s"
      }

      connect {
        sidecar_service {}
      }
    }

    task "caddy" {
      driver = "docker"

      template {
        data = <<EOH
        DIGITALOCEAN_API_TOKEN={{ with secret "secret/data/caddy" }}{{ .Data.data.do_token }}{{ end }}
        ACME_EMAIL={{ with secret "secret/data/caddy" }}{{ .Data.data.acme_email }}{{ end }}
        EOH

        destination = "secrets/env"
        env = true
      }

      config {
        image = "aryaniyaps/securechat-caddy:latest"

        port_map {
          http = 80
          https = 443
        }

        volumes = [
          "caddy_data:/data/caddy"
        ]
      }

      resources {
        cpu    = 100 # Modify based on your needs
        memory = 50 # Modify based on your needs
      }
    }

    volume "caddy_data" {
      type      = "host"
      read_only = false
      source    = "caddy_data"
    }
  }
}
