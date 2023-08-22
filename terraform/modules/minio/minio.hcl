job "minio" {
  datacenters = ["dc1"]

  group "minio-group" {
    count = 1

    network {
      mode = "bridge"
      port "web" {
        static = 9000
        to     = 9000
      }
    }

    service {
      name = "minio"
      tags = ["minio"]
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

    task "minio" {
      driver = "docker"

      template {
        data = <<EOH
        MINIO_ROOT_USER={{ with secret "secret/data/minio" }}{{ .Data.data.access_key }}{{ end }}
        MINIO_ROOT_PASSWORD={{ with secret "secret/data/minio" }}{{ .Data.data.secret_key }}{{ end }}
        MINIO_DEFAULT_BUCKETS={{ with secret "secret/data/minio" }}{{ .Data.data.default_buckets }}{{ end }}
        MINIO_SERVER_URL={{ with secret "secret/data/minio" }}{{ .Data.data.server_url }}{{ end }}
        EOH

        destination = "secrets/env"
        env = true
      }

      config {
        image = "bitnami/minio:2023"

        port_map {
          web = 9000
        }

        volumes = [
          "minio_data:/data"
        ]
      }

      resources {
        cpu    = 300 # Modify based on your needs
        memory = 150 # Modify based on your needs
      }
    }

    volume "minio_data" {
      type      = "host"
      read_only = false
      source    = "minio_data"
    }
  }
}
