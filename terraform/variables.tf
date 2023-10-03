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

variable "s3_access_key" {
  description = "S3 Access Key"
  type        = string
}

variable "s3_secret_key" {
  description = "S3 Secret Key"
  type        = string
  sensitive   = true
}

variable "s3_region" {
  description = "S3 Region"
  type        = string
  default     = "us-east-1"
}

variable "s3_end_point" {
  description = "S3 Endpoint"
  type        = string
  default     = "https://s3.vnadi.com"
}

variable "s3_avatar_bucket_name" {
  description = "S3 Avatar Bucket Name"
  type        = string
  default     = "avatars"
}

variable "s3_media_bucket_name" {
  description = "S3 Media Bucket Name"
  type        = string
  default     = "media"
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

variable "rabbitmq_url" {
  description = "RabbitMQ URL"
  type        = string
  sensitive   = true
}

variable "rabbitmq_queue_name" {
  description = "RabbitMQ Queue Name"
  type        = string
  default     = "events"
}

variable "rabbitmq_username" {
  description = "RabbitMQ Username"
  type        = string
  sensitive   = true
}

variable "rabbitmq_password" {
  description = "RabbitMQ Password"
  type        = string
  sensitive   = true
}

variable "token_verify_url" {
  description = "Token Verify URL"
  type        = string
  default     = "http://app:3000/api/gateway/verify-token"
}

variable "phx_host" {
  description = "Pheonix Server Host"
  type        = string
  default     = "vnadi.com"
}