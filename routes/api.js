import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()
const router = express.Router()
const con = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT
});

router.all('*', (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        con.execute('SELECT `user` FROM `apiKeys` WHERE `active` = 1 AND `keyCode` = ?', [token])
            .then(([rows]) => {
                if (rows.length > 0) {
                    req.user = rows[0].user;
                    console.log(req.user);
                    
                    next();
                } else {
                    res.status(401).json({ error: 'Unauthorized' });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    } else {
        res.status(203).json({ error: 'Unauthorized, no token' });
    }
})


router.all('/', (req, res) => {
    res.status(202).json({ message: 'API is working' });
})

router.get('/settings', async (req, res) => {
    try {
        const [rows] = await con.execute('SELECT * FROM settings WHERE name = "siteName"');
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/checkTicket', async (req, res) => {
    var ticket = req.body.code
    var pass = ticket.split('?pass=')[1]
    var id = ticket.split('ticket://')[1].split('?pass=')[0]
    console.log('Ticket:', ticket)
    console.log('ID:', id)
    console.log('Pass:', pass)
    const [rows] = await con.execute("SELECT `tickets`.`id` AS 'idTicket', `tickets`.`name` AS 'ticketHolder', `tickets`.`email` AS 'email', `tickets`.`active` AS 'active', `ticketTypes`.`name` AS 'ticketType', `ticketTypes`.`date` AS 'date', COUNT(`ticketCheck`.`id`) AS 'checkCount' FROM `tickets` JOIN `ticketTypes` ON `tickets`.`type` = `ticketTypes`.`id` LEFT JOIN `ticketCheck` ON `tickets`.`id` = `ticketCheck`.`ticketId` WHERE `tickets`.id = ? AND tickets.pass = ? GROUP BY `tickets`.`id`; ", [id, pass])
    console.log('Rows:', rows);
    if(rows.length > 0)
    {
        const [existingCheck] = await con.execute('SELECT id FROM ticketCheck WHERE ticketId = ? AND userId = ? AND timestampdiff(SECOND, time, NOW()) < 15', [rows[0].idTicket, req.session.user.id])
        if(existingCheck.length == 0) {
            await con.execute('INSERT INTO ticketCheck (ticketId, userId) VALUES (?, ?)', [rows[0].idTicket, req.session.user.id])
        }
        return res.status(200).json({ message: 'Ticket checked', data: rows[0] });
    }
    else
    {
        return res.status(404).json({ message: 'Ticket not found' });
    }
        
});

export default router
