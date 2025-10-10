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

variable "openai_api_key" {
  type = string
  sensitive = true
}