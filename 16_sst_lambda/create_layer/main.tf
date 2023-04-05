terraform {
  required_version = "=1.3.7"

  backend "local" {
    path = "./state/terraform.tfstate"
  }
}

provider "aws" {
  region = var.lambda_region
  default_tags {
    tags = {
      "created_by"  = "terraform"
      "application" = "16_sst_lambda"
      "owner"       = "chrisguest"
    }
  }
}
