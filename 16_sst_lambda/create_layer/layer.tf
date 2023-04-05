resource "aws_lambda_layer_version" "lambda_soxlayer" {
  filename   = var.lambda_soxlayer_file
  layer_name = var.lambda_soxlayer_name
  source_code_hash    = "${filebase64sha256(var.lambda_soxlayer_file)}"
  compatible_runtimes = ["nodejs16.x"]
}

