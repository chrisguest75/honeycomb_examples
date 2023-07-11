
variable "TAG" {
  default = "latest"
}

#***********************************************
# ffmpeg layer
#***********************************************

target "ffmpeg" {
  args = {}
  context = "."
  dockerfile = "Dockerfile.ffmpeglayer"
  labels = {
    "org.opencontainers.image.title"= "lambda-ffmpeglayer:${TAG}"
  }
  tags = ["lambda-ffmpeglayer:${TAG}"]
  target = "zip"
  output = ["type=local,dest=./ffmpeglayer"]
}

#***********************************************
# sox layer
#***********************************************

target "sox" {
  args = {}
  context = "."
  dockerfile = "Dockerfile.soxlayer"
  labels = {
    "org.opencontainers.image.title"= "lambda-soxlayer:${TAG}"
  }
  tags = ["lambda-soxlayer:${TAG}"]
  target = "zip"
  output = ["type=local,dest=./soxlayer"]
}

group "default" {
  targets = [
    "ffmpeg", 
    "sox", 
    ]
}
