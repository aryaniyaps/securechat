job "caddy" {
  datacenters = ["dc1"]

  group "caddy-group" {
    count = 1

    volume "caddy" {
      type      = "host"
      read_only = false
      source    = "caddy"
    }

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

      user = "root"

      volume_mount {
        volume      = "caddy"
        destination = "/data/caddy"
        read_only   = false
      }

      config {
        image = "aryaniyaps/securechat-caddy:latest"

        ports = ["http", "https"]
      }

      env {
        DIGITALOCEAN_API_TOKEN = "${do_token}"
        ACME_EMAIL = "${acme_email}"
      }

      resources {
        cpu    = 300 # Modify based on your needs
        memory = 100 # Modify based on your needs
      }
    }
  }
}
