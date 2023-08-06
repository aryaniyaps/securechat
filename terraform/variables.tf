variable "do_token" {
  description = "Your DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_fingerprint" {
  description = "Your SSH key fingerprint"
  type        = string
}

variable "pvt_key" {
  description = "Path to your private SSH key"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Database URL"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth Secret"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth URL"
  type        = string
  default     = "https://vnadi.com"
}

variable "nextauth_url_internal" {
  description = "NextAuth Internal URL"
  type        = string
  default     = "http://app:3000"
}

variable "google_client_id" {
  description = "Google Client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google Client Secret"
  type        = string
  sensitive   = true
}

variable "email_server" {
  description = "Email Server"
  type        = string
  sensitive   = true
}

variable "email_from" {
  description = "Email From"
  type        = string
  default     = "Aryan Iyappan aryaniyaps@vnadi.com"
}

variable "minio_access_key" {
  description = "MinIO Access Key"
  type        = string
}

variable "minio_secret_key" {
  description = "MinIO Secret Key"
  type        = string
  sensitive   = true
}

variable "minio_end_point" {
  description = "MinIO Endpoint"
  type        = string
  default     = "minio"
}

variable "minio_port" {
  description = "MinIO Port"
  type        = string
  default     = "9000"
}

variable "minio_use_ssl" {
  description = "MinIO Use SSL"
  type        = string
  default     = "false"
}

variable "minio_bucket_name" {
  description = "MinIO Bucket Name"
  type        = string
  default     = "avatars"
}



variable "centrifugo_url" {
  description = "Centrifugo URL"
  type        = string
  default     = "wss://socket.vnadi.com/connection/websocket"
}

variable "centrifugo_allowed_origins" {
  description = "Centrifugo Allowed Origins"
  type        = string
  default     = "https://vnadi.com"
}

variable "centrifugo_secret" {
  description = "Centrifugo Secret"
  type        = string
  sensitive   = true
}

variable "centrifugo_admin_password" {
  description = "Centrifugo Admin Password"
  type        = string
  sensitive   = true
}

variable "centrifugo_admin_secret" {
  description = "Centrifugo Admin Secret"
  type        = string
  sensitive   = true
}

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

variable "minio_server_url" {
  description = "MinIO Server URL"
  type        = string
  default     = "https://minio.vnadi.com"
}

