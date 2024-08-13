import { sha256 } from 'js-sha256'

console.log(process.env.EMAILS ?? 'my-emails are secret')
const emails = process.env.EMAILS ?? 'my-emails are secret'
console.log('working')

function getTempEmailAddresses() {
  return emails.split('\r\n') // this is for windows check in github secrets
}

function hashEmails(emails: string[]) {
  return emails.map((email) => sha256(email.trim()))
}

async function main() {
  const emails = getTempEmailAddresses()
  const hashedEmails = hashEmails(emails)
  hashedEmails.forEach((email) => console.log(email))
}

main().catch(console.error)
