# README

Demonstrate creation of lambda layers  

## Create Lambda

```sh
# config aws profile
. ./.env 

# init
terraform init

# plan 
terraform plan -var-file=./terraform.dev.tfvars

# create state
terraform apply -auto-approve -var-file=./terraform.dev.tfvars

# show decrypted state
terraform show -json | jq   
```

## Cleanup

```sh
terraform destroy

# NOTE: To be able to destroy ECR with images you have to have deployed it with force_delete=true
terraform destroy --target module.typescript_service.aws_ecr_repository.this
```

## Resources

* aws_lambda_layer_version always creates new version even though file doesn't change [here](https://github.com/hashicorp/terraform/issues/31451)

https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html