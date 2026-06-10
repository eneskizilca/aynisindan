output "ec2_public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "Public IP of the EC2 App Server"
}

output "ec2_public_dns" {
  value       = aws_instance.app_server.public_dns
  description = "Public DNS of the EC2 App Server"
}

output "rds_endpoint" {
  value       = aws_db_instance.rds.endpoint
  description = "The endpoint of the RDS database instance"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.sketch_bucket.id
  description = "The name of the S3 bucket created for sketches"
}

output "ecr_repository_urls" {
  value = {
    backend      = aws_ecr_repository.backend.repository_url
    chat_catalog = aws_ecr_repository.chat_catalog.repository_url
    frontend     = aws_ecr_repository.frontend.repository_url
  }
  description = "The URLs of the ECR repositories for container registry"
}
