variable "mongo_password" {
  description = "MongoDB Password"
  type        = string
  sensitive   = true
}

variable "mongo_user" {
  description = "MongoDB User"
  type        = string
}

variable "mongo_replica_set_key" {
  description = "MongoDB Replica Set Key"
  type        = string
  sensitive   = true
}