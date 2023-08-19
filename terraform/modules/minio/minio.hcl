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
      }

      env {
        MINIO_ROOT_USER = "${minio_access_key}"
        MINIO_ROOT_PASSWORD = "${minio_secret_key}"
        MINIO_DEFAULT_BUCKETS = "${minio_default_buckets}"
        MINIO_SERVER_URL = "${minio_server_url}"
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
