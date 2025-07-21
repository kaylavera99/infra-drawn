provider "aws" {
    region = "us-east-1"
}

resource  "aws_s3_bucket" "static_site" {
    bucket = var.bucket_name
}

resource "aws_s3_bucket_website_configuration" "site" {
    bucket = aws_s3_bucket.static_site.id

    index_document {
        suffix = "index.html"
        
    }
    error_document {
        key = "index.html"
    }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
    bucket = aws_s3_bucket.static_site.id
    block_public_acls = false
    block_public_policy = false
    ignore_public_acls = false
    restrict_public_buckets = false
}


resource "aws_s3_bucket_policy" "public_read" {
    bucket = aws_s3_bucket.static_site.id

    depends_on = [
        aws_s3_bucket_public_access_block.public_access
    ]

    policy = jsonencode({
        Version = "2012-10-17",
        Statement = [{
            Sid = "PublicReadGetObject",
            Effect = "Allow",
            Principal = "*",
            Action = ["s3:GetObject"],
            Resource = "${aws_s3_bucket.static_site.arn}/*"
        }]
    })
}




resource "aws_s3_object" "website_files" {
    for_each = fileset("../public", "**")

    bucket = aws_s3_bucket.static_site.id
    key = each.value
    source = "../public/${each.value}"
    etag = filemd5("../public/${each.value}")
    content_type = lookup({
        "html" = "text/html", 
        "css" = "text/css", 
        "js" = "application/javascript"
    }, split(".", each.value)[1], "text/plain")
}