import { sha256 } from 'js-sha256'

import { createS3Client, getCurrentItems, deleteFile, putFile } from './s3'

if (process.env.EMAILS === undefined) {
  throw new Error('EMAILS environment variable is not set')
}
if (process.env.S3_BUCKET === undefined) {
  throw new Error('S3_BUCKET environment variable is empty')
}
if (process.env.S3_ACCESS_KEY === undefined) {
  throw new Error('S3_ACCESS_KEY environment variable is empty')
}
if (process.env.S3_SECRET === undefined) {
  throw new Error('S3_SECRET environment variable is empty')
}

const emails = process.env.EMAILS

const region = 'eu-west-1'
const prefix = '/rai/images/svg/'
const bucketName = process.env.S3_BUCKET
const accesskey = process.env.S3_ACCESS_KEY
const secret = process.env.S3_SECRET

function getTempEmailAddresses() {
  return emails.split('\n') // this is for windows check in github secrets
}

function hashEmails(emails: string[]) {
  return emails.map((email) => sha256(email.trim()))
}

async function main() {
  const client = createS3Client(region, accesskey, secret)

  //   remove all files
  const currentItems = await getCurrentItems(client, bucketName, prefix)
  if (currentItems !== undefined) {
    console.log(`deleting (${currentItems.length}) files`)
    let counter = 1
    for (const item of currentItems) {
      if (item) {
        await deleteFile(client, item, bucketName)
        console.log(`deleted ${counter} of ${currentItems.length}`)
        counter++
      }
    }
  }

  // add new files
  const allEmails = getTempEmailAddresses()
  const hashed = hashEmails(allEmails)
  let counter = 1
  for (const email of hashed) {
    const fileName = `${prefix}${email}.jpg`
    await putFile(client, fileName, counter.toString(), bucketName)
    console.log(`added file ${counter} of ${allEmails.length}: ${fileName}`)
    counter++
  }

  // check if all files are updated
  const updatedFiles = await getCurrentItems(client, bucketName, prefix)
  if (updatedFiles !== undefined && updatedFiles.length === allEmails.length) {
    console.log('All files are updated successfully')
  } else {
    throw new Error('Some files are not updated')
  }
}

main().catch(console.error)
