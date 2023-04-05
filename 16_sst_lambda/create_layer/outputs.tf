################################################################################
# Lambda
################################################################################

output "aws_lambda_layer_version_arn" {
  description = "Arn of layer"
  value       = aws_lambda_layer_version.lambda_soxlayer.arn
}



