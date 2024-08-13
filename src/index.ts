import 'dotenv/config'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { sha256 } from 'js-sha256'
import {
  S3Client,
  type S3ClientConfig,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

async function getTempEmailAddresses() {
  const __dirname = join(process.cwd(), 'src')
  const dataPath = join(__dirname, 'data', 'temp-emails.txt')
  const data = await readFile(dataPath, 'utf-8')
  return data.split('\r\n') // this is for windows check in github secrets
}

const prefix = '/rai/images/svg/'
const bucketName = process.env.S3_BUCKET ?? 'my-bucket-name'
const accesskey = process.env.S3_ACCESS_KEY ?? 'my-access'
const secret = process.env.S3_SECRET ?? 'my-secret'
const region = 'eu-west-1'

async function hashEmails(emails: string[]) {
  return emails.map((email) => sha256(email.trim()))
}

function createSvg(data: string) {
  return `<svg version="1.1" width="300" height="200" xmlns="http://www.w3.org/2000/svg"> 
    <rect width="100%" height="100%" fill="red" />
    <circle cx="150" cy="100" r="80" fill="green" />
    <text x="150" y="125" font-size="60" text-anchor="middle" fill="white"> item ${data}</text>
</svg>`
}

function createS3Client() {
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

async function getCurrentItems(client: S3Client) {
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

async function putFile(client: S3Client, fileName: string, svgText: string) {
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

async function deleteFile(client: S3Client, fileName: string) {
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

async function main() {
  const client = createS3Client()

  //   remove all files
  const currentItems = await getCurrentItems(client)
  currentItems?.forEach((item) => {
    if (item) {
      deleteFile(client, item)
    }
  })

  // add new files
  const emails = await getTempEmailAddresses()
  const hashed = await hashEmails(emails)
  hashed.forEach((email, i) => {
    const fileName = `${prefix}${email}.jpg`
    console.log(fileName)
    putFile(client, fileName, i.toString())
  })

  const currentItems2 = await getCurrentItems(client)
  if (currentItems2) {
    console.log(currentItems2)
  } else {
    console.log('no items to show')
  }
}

main().catch(console.error)
