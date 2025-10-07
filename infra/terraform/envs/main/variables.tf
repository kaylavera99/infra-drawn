variable "region" {
  description = "aws region"
  type        = string
  default     = "us-east-1"
}

variable "env" {
  description = "deployment environment name used for bucket name"
  type        = string
  default     = "main"
}