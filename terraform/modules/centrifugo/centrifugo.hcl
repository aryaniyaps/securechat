job "centrifugo" {
  datacenters = ["dc1"]

  group "centrifugo-group" {
    count = 1

    task "centrifugo" {
      driver = "docker"

      config {
        image = "aryaniyaps/securechat-centrifugo:latest"

        port_map {
          web = 8000  # Assuming default Centrifugo port is 8000, adjust if needed
        }
      }

      env {
        CENTRIFUGO_API_KEY = "${centrifugo_api_key}"
        CENTRIFUGO_ADMIN_PASSWORD = "${centrifugo_admin_password}"
        CENTRIFUGO_ADMIN_SECRET = "${centrifugo_admin_secret}"
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 512 # Modify based on your needs

        network {
          port "web" {}
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
      }
    }
  }
}
