job "centrifugo" {
  datacenters = ["dc1"]

  group "centrifugo-group" {
    count = 1

    network {
      mode = "bridge"
      port "web" {
        static = 8000
        to     = 8000
      }
    }

    service {
      name = "centrifugo"
      tags = ["centrifugo"]
      port = "web"

      connect {
        sidecar_service {}
      }
    }

    task "centrifugo" {
      driver = "docker"

      config {
        image = "aryaniyaps/securechat-centrifugo:latest"

        ports = ["web"]
      }

      env {
        CENTRIFUGO_API_KEY = "${centrifugo_api_key}"
        CENTRIFUGO_ADMIN_PASSWORD = "${centrifugo_admin_password}"
        CENTRIFUGO_ADMIN_SECRET = "${centrifugo_admin_secret}"
      }

      resources {
        cpu    = 300 # Modify based on your needs
        memory = 200 # Modify based on your needs
      }
    }
  }
}
