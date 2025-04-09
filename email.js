import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

async function getSettings() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
  })

  const [rows] = await connection.execute('SELECT name, value FROM settings')
  await connection.end()

  const settings = {}
  for (const row of rows) {
    settings[row.name] = row.value
  }

  return settings
}

async function sendTestEmail() {
  try {
    const settings = await getSettings()
    console.log('Settings:', settings)
    const transporter = nodemailer.createTransport({
      host: settings.smtpServer,
      port: parseInt(settings.smtpPort),
      secure: settings.smtpTls === '1',
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass
      }
    })

    const mailOptions = {
      from: `"${settings.smtpSendAs}" <${settings.smtpFromEmail}>`,
      to: "email@gmail.com",
      bcc: settings.smtpBcc || undefined,
      subject: settings.smtpSubject || 'test',
      text: 'test'
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('E-mail send:', info.messageId)
  } catch (err) {
    console.error('Error e-mail:', err)
  }
}

sendTestEmail()
    .catch(err => {
        console.error('Błąd:', err)
    })