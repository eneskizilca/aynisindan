variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources"
  default     = "eu-central-1"
}

variable "project_name" {
  type        = string
  description = "Project prefix for resource names"
  default     = "aynisindan"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the custom VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private subnets"
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type for running the docker compose stack"
  default     = "t3.small"
}

variable "db_username" {
  type        = string
  description = "Username for PostgreSQL database"
  default     = "postgres"
}

variable "db_password" {
  type        = string
  description = "Password for PostgreSQL database. Should be set via environment variable or tfvars"
  default     = "aynisindansecurepwd123"
  sensitive   = true
}

variable "aws_access_key" {
  type        = string
  description = "AWS IAM access key for S3 uploads. Set via TF_VAR_aws_access_key or terraform.tfvars"
  sensitive   = true
}

variable "aws_secret_key" {
  type        = string
  description = "AWS IAM secret key for S3 uploads. Set via TF_VAR_aws_secret_key or terraform.tfvars"
  sensitive   = true
}
