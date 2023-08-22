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

      connect {
        sidecar_service {}
      }
    }

    task "minio" {
      driver = "docker"

      config {
        image = "bitnami/minio:2023"

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
        cpu    = 300 # Modify based on your needs
        memory = 200 # Modify based on your needs
      }
    }

    volume "minio_data" {
      type      = "host"
      read_only = false
      source    = "minio_data"
    }
  }
}
