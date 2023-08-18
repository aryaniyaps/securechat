job "minio" {
  datacenters = ["dc1"]

  group "minio-group" {
    count = 1

    task "minio" {
      driver = "docker"

      config {
        image = "bitnami/minio:2023"

        port_map {
          web = 9000
        }

        volumes = [
          "minio_data:/data"
        ]

        env {
          MINIO_ROOT_USER = "${MINIO_ACCESS_KEY}"
          MINIO_ROOT_PASSWORD = "${MINIO_SECRET_KEY}"
          MINIO_DEFAULT_BUCKETS = "${MINIO_DEFAULT_BUCKETS}"
          MINIO_SERVER_URL = "${MINIO_SERVER_URL}"
        }
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 512 # Modify based on your needs

        network {
          port "web" {}
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
      }
    }

    volume "minio_data" {
      type      = "host"
      read_only = false
      source    = "minio_data"
    }
  }
}
