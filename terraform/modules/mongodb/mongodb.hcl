job "mongodb" {
  datacenters = ["dc1"]

  group "mongo-group" {
    count = 1

    task "mongodb" {
      driver = "docker"

      config {
        image = "bitnami/mongodb:6.0"

        port_map {
          db = 27017
        }

        volumes = [
          "mongodb_data:/bitnami/mongodb"
        ]

        env {
          MONGODB_REPLICA_SET_MODE = "primary"
          MONGODB_ADVERTISED_HOSTNAME = "mongodb"
          MONGODB_ROOT_PASSWORD = "${mongo_password}"
          MONGODB_ROOT_USER = "${mongo_user}"
          MONGODB_REPLICA_SET_KEY = "${mongo_replica_set_key}"
        }
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 512 # Modify based on your needs

        network {
          port "db" {}
        }
      }

      service {
        name = "mongodb"
        tags = ["mongodb"]
        port = "db"

        check {
          name     = "alive"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    volume "mongodb_data" {
      type      = "host"
      read_only = false
      source    = "mongodb_data"
    }
  }
}
