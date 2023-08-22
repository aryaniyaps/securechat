job "minio" {
  datacenters = ["dc1"]

  group "minio-group" {
    count = 1

    volume "minio" {
      type      = "host"
      read_only = false
      source    = "minio"
    }

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
      // the error is most likely due to incorrect TLS config here
      // https://github.com/bitnami/containers/issues/22216
      user = "root"

      volume_mount {
        volume      = "minio"
        destination = "/data"
        read_only   = false
      }

      config {
        image = "bitnami/minio:2023"

        ports = ["web"]
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
  }
}
