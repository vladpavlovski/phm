import { S3, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Bucket = process.env.AWS_S3_BUCKET
const s3Region = process.env.AWS_S3_REGION
const accessKeyId = process.env.AWS_S3_REGION
const secretAccessKey = process.env.AWS_HMS_SECRET_ACCESS_KEY

const s3Client = new S3({
  region: s3Region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
})

module.exports.handler = async event => {
  const body = JSON.parse(event.body)
  const { filename, filetype } = body

  if (!filename || !filetype) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing fileName or fileType on body',
      }),
    }
  }

  const s3Params = {
    Bucket: s3Bucket,
    Key: filename,
    ContentType: filetype,
    ACL: 'public-read',
  }

  const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`
  const command = new PutObjectCommand(s3Params)

  const signedRequest = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      signedRequest,
      url,
    }),
  }
}
