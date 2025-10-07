terraform {
    required_version = ">=1.6.0"
}

provider "aws" {
    region = var.region
}

data "aws_caller_identity" "me" {}



locals {
    bucket_name = "infra-drawn-${var.env}-${data.aws_caller_identity.me.account_id}"

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