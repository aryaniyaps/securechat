variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "acme_email" {
  description = "Email address to use for the ACME account managing the site certificates"
  type        = string
}

variable "ssh_fingerprint" {
  description = "SSH key fingerprint"
  type        = string
}

variable "pvt_key" {
  description = "Path to private SSH key"
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
  default     = "noreply@vnadi.com"
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

variable "minio_default_buckets" {
  description = "MinIO Default Buckets"
  type        = string
  default     = "avatars:public"
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

variable "ws_server_url" {
  description = "WS Server URL"
  type        = string
  default     = "http://ws-server:5000"
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
