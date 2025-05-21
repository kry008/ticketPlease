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
    try {
        const ticket = req.body.code;

        // Walidacja formatu
        if (!ticket || !ticket.includes('ticket://') || !ticket.includes('?pass=')) {
            return res.status(400).json({ error: 'Invalid ticket format' });
        }

        const pass = ticket.split('?pass=')[1];
        const id = ticket.split('ticket://')[1].split('?pass=')[0];

        console.log('Ticket:', ticket);
        console.log('ID:', id);
        console.log('Pass:', pass);

        // Pobierz dane biletu
        const [ticketRows] = await con.execute(
            `SELECT 
                tickets.id AS idTicket,
                tickets.name AS ticketHolder,
                tickets.email AS email,
                tickets.active AS active,
                ticketTypes.name AS ticketType,
                ticketTypes.date AS date
            FROM tickets
            JOIN ticketTypes ON tickets.type = ticketTypes.id
            WHERE tickets.id = ? AND tickets.pass = ?`,
            [id, pass]
        );

        if (ticketRows.length === 0) {
            return res.status(404).json({ error: 'Ticket not found or invalid pass' });
        }

        const ticketInfo = ticketRows[0];

        // Sprawdź, czy użytkownik już skanował ten bilet w ostatnich 15 sekundach
        const [recentCheck] = await con.execute(
            `SELECT id FROM ticketCheck 
             WHERE ticketId = ? AND userId = ? 
             AND TIMESTAMPDIFF(SECOND, time, NOW()) < 15`,
            [ticketInfo.idTicket, req.session.user.id]
        );

        // Jeśli nie — dodaj wpis
        if (recentCheck.length === 0) {
            await con.execute(
                'INSERT INTO ticketCheck (ticketId, userId) VALUES (?, ?)',
                [ticketInfo.idTicket, req.session.user.id]
            );
        }

        // Zlicz aktualną liczbę skanów
        const [countResult] = await con.execute(
            'SELECT COUNT(*) AS checkCount FROM ticketCheck WHERE ticketId = ?',
            [ticketInfo.idTicket]
        );

        ticketInfo.checkCount = countResult[0].checkCount;
        ticketInfo.valid = ticketInfo.active === 1;

        return res.status(200).json({
            message: 'Ticket found',
            data: ticketInfo
        });

    } catch (err) {
        console.error('API checkTicket error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


export default router
