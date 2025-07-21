variable "bucket_name" {
    description = "infra_drawn_static"
    type = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}