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

      connect {
        sidecar_service {}
      }
    }

    task "caddy" {
      driver = "docker"

      config {
        image = "aryaniyaps/securechat-caddy:latest"

        volumes = [
          "caddy_data:/data/caddy"
        ]
      }

      env {
        DIGITALOCEAN_API_TOKEN = "${do_token}"
        ACME_EMAIL = "${acme_email}"
      }

      resources {
        cpu    = 300 # Modify based on your needs
        memory = 200 # Modify based on your needs
      }
    }

    volume "caddy_data" {
      type      = "host"
      read_only = false
      source    = "caddy_data"
    }
  }
}
