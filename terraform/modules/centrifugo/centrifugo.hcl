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

      check {
        name     = "alive"
        type     = "tcp"
        interval = "10s"
        timeout  = "2s"
      }

      connect {
        sidecar_service {}
      }
    }

    task "centrifugo" {
      driver = "docker"

      template {
        data = <<EOH
        CENTRIFUGO_API_KEY={{ with secret "secret/data/centrifugo" }}{{ .Data.data.api_key }}{{ end }}
        CENTRIFUGO_ADMIN_PASSWORD={{ with secret "secret/data/centrifugo" }}{{ .Data.data.admin_password }}{{ end }}
        CENTRIFUGO_ADMIN_SECRET={{ with secret "secret/data/centrifugo" }}{{ .Data.data.admin_secret }}{{ end }}
        EOH

        destination = "secrets/env"
        env = true
      }

      config {
        image = "aryaniyaps/securechat-centrifugo:latest"

        port_map {
          web = 8000  # Assuming default Centrifugo port is 8000, adjust if needed
        }
      }

      resources {
        cpu    = 300 # Modify based on your needs
        memory = 150 # Modify based on your needs
      }
    }
  }
}
