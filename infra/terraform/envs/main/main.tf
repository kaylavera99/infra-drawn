terraform {
    required_version = ">=1.6.0"
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~>5.0"
        }
        archive = {
            source = "hashicorp/archive"
            version ="~>2.5"
        }
        random = {
            source = "hashicorp/random"
            version = "~>3.6"
        }
    }
    backend "s3" {}
}

provider "aws" {
    region = var.region
}

data "aws_caller_identity" "current" {}

resource "random_id" "bucket_suffix" {
    byte_length = 3
    keepers = {
        account_id = data.aws_caller_identity.current.account_id
        env = var.env
    }
}

locals {
    bucket_name = "infra-drawn-${var.env}-${data.aws_caller_identity.current.account_id}-${random_id.bucket_suffix.hex}"

    site_directory = "${path.module}/site"

    files = fileset(local.site_directory, "**")

    mime = {
        
        html = "text/html"
        css  = "text/css"
        js   = "application/javascript"
        json = "application/json"
        svg  = "image/svg+xml"
        png  = "image/png"
        jpg  = "image/jpeg"
        jpeg = "image/jpeg"
        webp = "image/webp"
        ico  = "image/x-icon"
        map  = "application/json"
    }

}


resource  "aws_s3_bucket" "static_site" {
    bucket =  local.bucket_name
    force_destroy = true
    tags = { 
        Project = "infra-drawn", 
        Env = var.env
    }

#   lifecycle {
#       prevent_destroy = true
#   }
}



resource "aws_s3_bucket_public_access_block" "public_access" {
    bucket = aws_s3_bucket.static_site.id
    block_public_acls = true
    block_public_policy = false
    ignore_public_acls = true
    restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "website" {
    bucket = aws_s3_bucket.static_site.id

    index_document {
        suffix = "index.html"
    }
    error_document {
        key = "404.html"
    }
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.static_site.id
  depends_on = [aws_s3_bucket_public_access_block.public_access]

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid       = "PublicReadGetObject",
      Effect    = "Allow",
      Principal = "*",
      Action    = ["s3:GetObject"],
      Resource  = "${aws_s3_bucket.static_site.arn}/*"
    }]
  })
}



resource "aws_s3_object" "assets" {
    for_each = {
        for f in local.files : f => f
    }
    bucket = aws_s3_bucket.static_site.id
    key = each.key
    source = "${local.site_directory}/${each.key}"
    etag = filemd5("${local.site_directory}/${each.key}")
    content_type = try(
        lookup(local.mime, element(regexall("\\.([^.]+)$", each.key), 0)[0]),
        null
    )
}


# -- lambda role

resource "aws_iam_role" "lambda_exec" {
    name = "infra-drawn-lambda-exec-${var.env}"
    assume_role_policy = jsonencode({
        Version = "2012-10-17",
        Statement = [{
            Effect = "Allow",
            Principal = { Service = "lambda.amazonaws.com"},
            Action = "sts:AssumeRole"
        }]
    })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
    role = aws_iam_role.lambda_exec.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# -- Zip handler
data "archive_file" "api_zip" {
    type = "zip"
    source_file = abspath("${path.module}/../../../../services/api/lambda.mjs")
    output_path = "${path.module}/api.zip"

}

# -- lambda function

resource "aws_lambda_function" "generate" {
    function_name = "infra-drawn-generate-${var.env}"
    role = aws_iam_role.lambda_exec.arn
    runtime = "nodejs20.x"
    handler = "lambda.handler"

    filename = data.archive_file.api_zip.output_path
    source_code_hash = data.archive_file.api_zip.output_base64sha256

    timeout = 30
    memory_size = 512

    environment {
        variables = {
            OPENAI_API_KEY = var.openai_api_key
        }
    }

    tags = { Project = "infra-drawn", Env = var.env}
}

# -- public facing https url for lambda
resource "aws_lambda_function_url" "generate" {
    function_name = aws_lambda_function.generate.function_name
    authorization_type = "NONE"

    cors {
        allow_origins = ["*"]
        allow_methods = ["post", "options"]
        allow_headers = ["content-type"]
    }

}

output "api_url" {
    value = aws_lambda_function_url.generate.function_url
}