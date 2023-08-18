job "app" {
  datacenters = ["dc1"]

  group "app-group" {
    count = 1

    task "app" {
      driver = "docker"

      config {
        image = "aryaniyaps/securechat:latest"

        env {
          DATABASE_URL              = "${DATABASE_URL}"
          NEXTAUTH_SECRET           = "${NEXTAUTH_SECRET}"
          NEXTAUTH_URL              = "${NEXTAUTH_URL}"
          NEXTAUTH_URL_INTERNAL     = "${NEXTAUTH_URL_INTERNAL}"
          GOOGLE_CLIENT_ID          = "${GOOGLE_CLIENT_ID}"
          GOOGLE_CLIENT_SECRET      = "${GOOGLE_CLIENT_SECRET}"
          EMAIL_SERVER              = "${EMAIL_SERVER}"
          EMAIL_FROM                = "${EMAIL_FROM}"
          MINIO_ACCESS_KEY          = "${MINIO_ACCESS_KEY}"
          MINIO_SECRET_KEY          = "${MINIO_SECRET_KEY}"
          MINIO_END_POINT           = "${MINIO_END_POINT}"
          MINIO_PORT                = "${MINIO_PORT}"
          MINIO_USE_SSL             = "${MINIO_USE_SSL}"
          MINIO_BUCKET_NAME         = "${MINIO_BUCKET_NAME}"
          CENTRIFUGO_URL            = "${CENTRIFUGO_URL}"
          CENTRIFUGO_API_KEY        = "${CENTRIFUGO_API_KEY}"
        }
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 512 # Modify based on your needs

        network {
          mbits = 10
        }
      }

      service {
        name = "app"
        tags = ["app"]
        
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
