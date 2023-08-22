terraform {
  required_providers {
    nomad = {
      source  = "hashicorp/nomad"
      version = "1.4.20"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "3.19.0"
    }
  }
  required_version = ">= 1.5.5"
}
