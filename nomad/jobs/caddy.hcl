job "caddy" {
  datacenters = ["dc1"]

  group "caddy-group" {
    count = 1

    task "caddy" {
      driver = "docker"

      config {
        image = "aryaniyaps/securechat-caddy:latest"

        port_map {
          http = 80
          https = 443
        }

        volumes = [
          "caddy_data:/data/caddy"
        ]

        env {
          DIGITALOCEAN_API_TOKEN = "${DIGITALOCEAN_API_TOKEN}"
        }
      }

      resources {
        cpu    = 300 # Modify based on your needs
        memory = 256 # Modify based on your needs

        network {
          port "http" {
            static = 80
          }
          port "https" {
            static = 443
          }
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
      }
    }

    volume "caddy_data" {
      type      = "host"
      read_only = false
      source    = "caddy_data"
    }
  }
}
