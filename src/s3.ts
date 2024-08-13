import {
  S3Client,
  type S3ClientConfig,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { createSvg } from './utils.js'

export function createS3Client(
  region: string,
  accesskey: string,
  secret: string
): S3Client {
  //   console.log(accesskey, secret)
  const clientConfig: S3ClientConfig = {
    region,
    credentials: {
      accessKeyId: accesskey,
      secretAccessKey: secret,
    },
  }
  return new S3Client(clientConfig)
}

export async function getCurrentItems(
  client: S3Client,
  bucketName: string,
  prefix: string
) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    MaxKeys: 1000,
    Prefix: prefix,
  })

  try {
    const response = await client.send(command)
    return response.Contents?.map((item) => item.Key)
  } catch (e) {
    console.log(e)
  }
}

export async function putFile(
  client: S3Client,
  fileName: string,
  svgText: string,
  bucketName: string
) {
  //image/svg+xml
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: createSvg(svgText),
    ContentType: 'image/svg+xml',
  })

  try {
    const response = await client.send(command)
    // console.log(response)
  } catch (e) {
    console.log(e)
  }
}

export async function deleteFile(
  client: S3Client,
  fileName: string,
  bucketName: string
) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  })

  try {
    const response = await client.send(command)
    // console.log(response)
  } catch (e) {
    console.log(e)
  }
}
