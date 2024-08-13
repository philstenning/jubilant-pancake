import 'dotenv/config'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { sha256 } from 'js-sha256'
import { createS3Client, getCurrentItems, deleteFile, putFile } from './s3'

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

async function main() {
//   const client = createS3Client(region, accesskey, secret)

//   //   remove all files
//   const currentItems = await getCurrentItems(client, bucketName, prefix)
//   currentItems?.forEach((item) => {
//     if (item) {
//       deleteFile(client, item, bucketName)
//     }
//   })

  // add new files
  const emails = await getTempEmailAddresses()
  const hashed = await hashEmails(emails)

  for (const email of hashed) {
    const fileName = `${prefix}${email}.jpg`
    console.log(`added file:${fileName}`)
    // await putFile(client, fileName, counter.toString(), bucketName)
    // counter++
  }
//   hashed.forEach((email, i) => {
//     const fileName = `${prefix}${email}.jpg`
//     console.log(fileName)
//     putFile(client, fileName, i.toString(), bucketName)
//   })

//   const currentItems2 = await getCurrentItems(client, bucketName, prefix)
//   if (currentItems2) {
//     console.log(currentItems2)
//   } else {
//     console.log('no items to show')
//   }
}

main().catch(console.error)
