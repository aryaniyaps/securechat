job "mongodb" {
  datacenters = ["dc1"]

  group "mongo-group" {
    count = 1

    volume "mongodb" {
      type      = "host"
      read_only = false
      source    = "mongodb"
    }

    network {
      mode = "bridge"
      port "db" {
        static = 27017
        to     = 27017
      }
    }

    service {
      name = "mongodb"
      tags = ["mongodb"]
      port = "db"

      connect {
        sidecar_service {}
      }
    }

    task "mongodb" {
      driver = "docker"

      // the error is most likely due to incorrect TLS config here
      user = "root"

      volume_mount {
        volume      = "mongodb"
        destination = "/bitnami/mongodb"
        read_only   = false
      }

      config {
        image = "bitnami/mongodb:6.0"

        ports = ["db"]
      }

      env {
        MONGODB_REPLICA_SET_MODE = "primary"
        MONGODB_ADVERTISED_HOSTNAME = "mongodb.service.consul"
        MONGODB_ROOT_PASSWORD = "${mongo_password}"
        MONGODB_ROOT_USER = "${mongo_user}"
        MONGODB_REPLICA_SET_KEY = "${mongo_replica_set_key}"
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 400 # Modify based on your needs
      }
    }
  }
}
