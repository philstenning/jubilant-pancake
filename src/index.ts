import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { sha256 } from 'js-sha256'
import { rimraf } from 'rimraf'
// import { createS3Client, getCurrentItems, deleteFile, putFile } from './s3'
import { makeDirectory } from 'make-dir'
async function getTempEmailAddresses() {
  const __dirname = join(process.cwd(), 'src')
  const dataPath = join(__dirname, 'data', 'temp-emails.txt')
  const data = await readFile(dataPath, 'utf-8')
  return data.split('\r\n') // this is for windows check in github secrets
}

const prefix = '/rai/images/svg/'
const destination = join(process.cwd(), 'public', prefix)

const bucketName = process.env.S3_BUCKET ?? 'my-bucket-name'
const accesskey = process.env.S3_ACCESS_KEY ?? 'my-access'
const secret = process.env.S3_SECRET ?? 'my-secret'
const region = 'eu-west-1'

async function hashEmails(emails: string[]) {
  return emails.map((email) => sha256(email.trim()))
}

async function main() {
    // console.log(destination);
  await rimraf(destination)
    const emails = await getTempEmailAddresses()
    const hashed = await hashEmails(emails)
    await makeDirectory(destination)
    let counter = 1
    for (const email of hashed) {
      const fileName = `${email}.jpg`
      const dest = join(destination, fileName)
      console.log(`added file:${fileName}`)
      try {
        await writeFile(dest, email)
        console.log(`file ${counter} of ${hashed.length}: ${fileName}`)
      } catch (e) {
        console.error(`Error writing file:. ${e}`)
      }
        counter++
    }
}

main().catch(console.error)
