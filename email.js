import mysql from 'mysql2/promise'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage, registerFont } from 'canvas'
import QRCode from 'qrcode'

dotenv.config()


const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
})


async function generateTicketImage(img, name, id, pass, color, ticketType, outputPath) {
  try {
    const baseImage = await loadImage(`ticket_img/${img}`)
    const width = 900
    const height = 300

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // BG
    ctx.drawImage(baseImage, 0, 0, width, height)

    // TXT
    ctx.fillStyle = color || '#000000'
    ctx.font = '34px sans-serif'
    const text = name
    const textX = 20
    
    var textY = height - 75
    if(ticketType == "")
      var textY = height - 40
    ctx.fillText(text, textX, textY)
    // QR Code 
    const qrBuffer = await QRCode.toBuffer(`ticket://${id}/?pass=${pass}`, {
      errorCorrectionLevel: 'L',
      type: 'image/png',
      width: 150,
      margin: 1
    })
    
    if(ticketType != "")
    {
      const ticketTypeX = 20
      const ticketTypeY = height - 25
      ctx.font = '24px sans-serif'
      ctx.fillStyle = color || '#000000'
      ctx.fillText(ticketType, ticketTypeX, ticketTypeY)
    }
    const qrImage = await loadImage(qrBuffer)
    const qrSize = 160
    const qrX = width - qrSize - 5
    const qrY = height - qrSize - 5
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)


    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outputPath, buffer)
    console.log('Img save:', outputPath)
    return outputPath
  } catch (err) {
    console.error('Img error:', err)
    throw err
  }
}

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

async function sendEmail(img, name, id, pass, color, email, html, ticketType, date, nameShow, emailTitle) {
  html = html.replace(/>{{name}}</g, ">"+name+"<")
  html = html.replace(/>{{id}}</g, ">"+id+"<")
  html = html.replace(/>{{pass}}</g, ">"+pass+"<")
  html = html.replace(/{{color}}/g, color)
  html = html.replace(/>{{email}}</g, ">"+email+"<")
  html = html.replace(/>{{ticketType}}</g, ">"+ticketType+"<")
  emailTitle = emailTitle.replace(/{{name}}</g, ">"+name+"<")
  emailTitle = emailTitle.replace(/>{{id}}</g, ">"+id+"<")
  if(nameShow == 0)
    ticketType = ""
  html = html.replace(/>{{date}}</g, ">"+date+"<")
  html = html.replace(/>{{img}}</g, `><img src="cid:ticket" alt="Ticket" filename="${ticketType}${name}"/><`)
  try {
    const settings = await getSettings()
    //console.log('Settings:', settings)
    const transporter = nodemailer.createTransport({
      host: settings.smtpServer,
      port: parseInt(settings.smtpPort),
      secure: settings.smtpTls === '1',
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass
      }
    })

    const ticketPath = await generateTicketImage(img, name, id, pass, color, ticketType, `out/${id}.png`)
    const mailOptions = {
      from: `"${settings.smtpSendAs}" <${settings.smtpFromEmail}>`,
      to: email,
      bcc: settings.smtpBcc || undefined,
      replyTo: settings.smtpReplyTo || undefined,
      subject: emailTitle || settings.smtpSubject || 'Your ticket',
      html: html,
      attachments: [
        {
          filename: `${name} - ${id}.png`,
          path: ticketPath,
          cid: 'ticket'
        },
        {
          filename: `${name} - ${id}.png`,
          path: ticketPath
        }
      ]
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('E-mail send:', info.messageId)
  } catch (err) {
    console.error('Error e-mail:', err)
  }
}



async function sendTickets() {
  try {

    const [rows] = await connection.execute('SELECT `tickets`.`id` AS id, `tickets`.`name` AS name, `tickets`.`email` as SendTo, `tickets`.`pass` as pass, `ticketTypes`.`img` as img, `ticketTypes`.`emailTitle` as emailTitle, `ticketTypes`.`date` as date, `ticketTypes`.`name` as ticketType, `ticketTypes`.`config` as config, `ticketTypes`.`emailMessage` as html FROM `tickets`, `ticketTypes` WHERE `tickets`.`type` = `ticketTypes`.id AND tickets.emailSended IS NULL AND `tickets`.`active` = 1 ORDER BY id LIMIT 1;')

    if (rows.length === 0) {
      console.log('No tickets to send')
      return
    }

    for (const row of rows) {
      const { id, name, SendTo, pass, img, config, html, ticketType, date, emailTitle } = row
      const { color, nameShow } = JSON.parse(config)
      await sendEmail(img, name, id, pass, color, SendTo, html, ticketType, date, nameShow, emailTitle)
      console.log('Ticket:', id, 'to', SendTo)
      await connection.execute('UPDATE `tickets` SET `emailSended` = NOW() WHERE `tickets`.`id` = ?', [id])
      console.log('Ticket updated:', id)
      return
    }
    return
  }
  catch (err) {
    console.error('Error:', err)
  }
}

setInterval(() => {
  sendTickets()
    .catch(err => {
      console.error('Error:', err)
    })
}, 10000)

/*
sendTestEmail()
  .catch(err => {
    console.error('Er:', err)
  })
*/