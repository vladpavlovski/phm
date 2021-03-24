import AWS from 'aws-sdk'
const {
  AWS_S3_BUCKET,
  AWS_S3_REGION,
  AWS_HMS_ACCESS_KEY_ID,
  AWS_HMS_SECRET_ACCESS_KEY,
} = process.env

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: AWS_S3_REGION,
  credentials: new AWS.Credentials(
    AWS_HMS_ACCESS_KEY_ID,
    AWS_HMS_SECRET_ACCESS_KEY
  ),
})

module.exports.handler = async event => {
  const body = JSON.parse(event.body)
  const { filename, filetype } = body

  if (!filename || !filetype) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing filename or filetype on body',
      }),
    }
  }

  const s3Params = {
    Bucket: AWS_S3_BUCKET,
    Key: filename,
    ContentType: filetype,
    ACL: 'public-read',
  }

  const url = `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${filename}`

  const signedRequest = s3.getSignedUrl('putObject', s3Params)

  return {
    statusCode: 200,
    body: JSON.stringify({
      signedRequest,
      url,
    }),
  }
}
