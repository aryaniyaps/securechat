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

variable "pusher_app_id" {
  description = "Pusher App ID"
  type        = string
  default     = "app-id"
}

variable "pusher_app_key" {
  description = "Pusher App Key"
  type        = string
  default     = "app-key"
}

variable "pusher_cluster" {
  description = "Pusher Cluster"
  type        = string
  default     = "self-hosted"
}

variable "pusher_secret" {
  description = "Pusher Secret"
  type        = string
  sensitive   = true
}

variable "pusher_use_tls" {
  description = "Pusher Use TLS"
  type        = string
  default     = "false"
}

variable "pusher_host" {
  description = "Pusher Host"
  type        = string
  default     = "soketi"
}

variable "pusher_port" {
  description = "Pusher Port"
  type        = string
  default     = "6001"
}

variable "postgres_user" {
  description = "Postgres User"
  type        = string
}

variable "postgres_db" {
  description = "Postgres Database"
  type        = string
}

variable "postgres_password" {
  description = "Postgres Password"
  type        = string
  sensitive   = true
}

variable "pusher_scheme" {
  description = "Pusher Scheme"
  type        = string
  default     = "https"
}

variable "minio_server_url" {
  description = "MinIO Server URL"
  type        = string
  default     = "https://minio.vnadi.com"
}

