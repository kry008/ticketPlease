import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()
const router = express.Router()
import session from 'express-session';
import ejs, { render } from 'ejs'

const con = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT
});

router.all('*', (req, res, next) => {
    //check if session exists
    if (!req.session.user) {
        return res.redirect('/panel/login')
    }
    next()
})

router.all('/dashboard', (req, res) => {
    //show all session data
    res.render('dashboard', {
        title: 'Dashboard',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user
    })
})

router.get('/users', async (req, res) => {
    const [rows] = await con.execute('SELECT id, login, email, name, admin, lastLogin FROM user WHERE active = 1')
    res.render('users', {
        title: 'Users',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        users: rows,
        error: false,
        success: false,
        myId: req.session.user.id
    })
})

router.post('/users', async (req, res) => {
    //in body action = add or delete
    var action = req.body.action
    if(action == 'add')
    {
        var login = req.body.login
        var email = req.body.email
        var name = req.body.name
        var password = req.body.password
        var admin = req.body.admin
        await con.execute('INSERT INTO user (login, email, name, pass, admin) VALUES (?, ?, ?, ?, ?)', [login, email, name, password, admin])
    }
    else if(action == 'delete')
    {
        var id = req.body.id
        await con.execute('UPDATE user SET active = 0 WHERE id = ?', [id])
        const [rows] = await con.execute('SELECT id, login, email, name, admin, lastLogin FROM user WHERE active = 1')
        return res.render('users', {
            title: 'Users',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            users: rows,
            success: 'User deleted successfully',
            error: false,
            myId: req.session.user.id
        })
    }
    else
    {
        console.log('Unknown action:', action)
        return res.render('users', {
            title: 'Users',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            users: rows,
            eeror: 'Error: Unknown action',
            success: false,
            myId: req.session.user.id
        })
    }
    const [rows] = await con.execute('SELECT id, login, email, name, admin, lastLogin FROM user WHERE active = 1')
    return res.render('users', {
        title: 'Users',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        users: rows,
        success: 'User added successfully',
        error: false,
        myId: req.session.user.id
    })
})

router.get('/ticketTypes', async (req, res) => {
    const [rows] = await con.execute('SELECT id, name, onTicket, numberOfLines, date, img, config, emailMessage, whoAdded, lastEdit FROM ticketTypes WHERE active = 1')
    res.render('ticketTypes', {
        title: 'Ticket Types',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        ticketTypes: rows,
        error: false,
        success: false
    })
})

router.post('/ticketTypes', async (req, res) => {
    //in body action = add or delete
    var action = req.body.action
    if(action == 'add')
    {
        var name = req.body.name
        var onTicket = req.body.onTicket
        var numberOfLines = req.body.numberOfLines
        var dateFrom = req.body.dateFrom
        var dateTo = req.body.dateTo
        var nameShow = req.body.nameShow
        var dateShow = req.body.dateShow
        var color = req.body.color
        var emailTitle = req.body.emailTitle
        if(dateFrom == dateTo)
        {
            var date = dateFrom;
        }
        else if(dateFrom && dateTo)
        {
            var date = dateFrom + ' - ' + dateTo;
        }
        else
        {
            var date = '';
        }

        var config = {
            nameShow: nameShow,
            dateShow: dateShow,
            color: color
        }
        var config = JSON.stringify(config)
        var img = req.body.img
        //var config = req.body.config
        var emailMessage = req.body.emailMessage
        var whoAdded = req.session.user.id
        await con.execute('INSERT INTO ticketTypes (name, onTicket, numberOfLines, date, img, config, emailMessage, whoAdded, emailTitle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, onTicket, numberOfLines, date, img, config, emailMessage, whoAdded, emailTitle])
    }
    else if(action == 'delete')
    {
        var id = req.body.id
        await con.execute('UPDATE ticketTypes SET active = 0 WHERE id = ?', [id])
        const [rows] = await con.execute('SELECT id, name, onTicket, numberOfLines, date, img, config, emailMessage, whoAdded FROM ticketTypes WHERE active = 1')
        return res.render('ticketTypes', {
            title: 'Ticket Types',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            ticketTypes: rows,
            success: 'Ticket Type deleted successfully',
            error: false
        })
    }
    else
    {
        console.log('Unknown action:', action)
        return res.render('ticketTypes', {
            title: 'Ticket Types',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            ticketTypes: rows,
            eeror: 'Error: Unknown action',
            success: false
        })
    }
    const [rows] = await con.execute('SELECT id, name, onTicket, numberOfLines, date, img, config, emailMessage FROM ticketTypes WHERE active = 1')
    return res.render('ticketTypes', {
        title: 'Ticket Types',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        ticketTypes: rows,
        success: 'Ticket Type added successfully',
        error: false
    })
})

router.get('/addTicketPanel', (req, res) => {
    res.render('addTicketPanel', {
        title: 'Add Ticket',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user
    })
})

router.get('/addTicketSingle', async (req, res) => {
    const [rows] = await con.execute('SELECT id, name, onTicket, date FROM ticketTypes WHERE active = 1')
    res.render('addTicketSingle', {
        title: 'Add Ticket',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user,
        ticketTypes: rows,
        error: false,
        success: false
    })
})

router.post('/addTicketSingle', async (req, res) => {
    //in body action = add or delete
    var action = req.body.action
    if(action == 'add')
    {
        var name = req.body.name
        var pass = randomChars(24)
        var email = req.body.email
        var type = req.body.type
        var addedBy = req.session.user.id
        await con.execute('INSERT INTO tickets (name, pass, email, type, addedBy) VALUES (?, ?, ?, ?, ?)', [name, pass, email, type, addedBy])
    }
    else if(action == 'delete')
    {
        var id = req.body.id
        await con.execute('UPDATE tickets SET active = 0 WHERE id = ?', [id])
        const [rows] = await con.execute('SELECT id, name, onTicket, date FROM ticketTypes WHERE active = 1')
        return res.render('addTicketSingle', {
            title: 'Add Ticket',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user,
            ticketTypes: rows,
            success: 'Ticket deleted successfully',
            error: false,
        })
    }
    else
    {
        console.log('Unknown action:', action)
        return res.render('addTicketSingle', {
            title: 'Add Ticket',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user,
            ticketTypes: rows,
            eeror: 'Error: Unknown action',
            success: false,
        })
    }
    const [rows] = await con.execute('SELECT id, name, onTicket, date FROM ticketTypes WHERE active = 1')
    return res.render('addTicketSingle', {
        title: 'Add Ticket',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user,
        ticketTypes: rows,
        success: 'Ticket added successfully',
        error: false
    })
})

router.get('/ticketList', async (req, res) => {
    const [row2] = await con.execute('SELECT `tickets`.`id`, `tickets`.`name`, `tickets`.`pass`, `tickets`.`email`, `emailSended`, `ticketTypes`.`name` AS `nazwaTypu`, `ticketTypes`.`date` AS `dataWydarzenia`, `user`.`name` AS `dodal` FROM `tickets`, `user`, `ticketTypes` WHERE `user`.`id` = `addedBy` AND `tickets`.`active` = 1 AND `ticketTypes`.`id` = `type`;')
    res.render('ticketList', {
        title: 'Ticket List',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user, 
        error: false,
        success: false,
        tickets: row2
    })
})

router.post('/ticketList', async (req, res) => {
    //only delete
    if(req.body.action != 'delete')
    {
        console.log('Unknown action:', req.body.action)
        return res.render('ticketList', {
            title: 'Ticket List',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: 'Error: Unknown action',
            success: false
        })
    }
    var id = req.body.id
    await con.execute('UPDATE tickets SET active = 0 WHERE id = ?', [id])
    const [row2] = await con.execute('SELECT `tickets`.`id`, `tickets`.`name`, `tickets`.`pass`, `tickets`.`email`, `emailSended`, `ticketTypes`.`name` AS `nazwaTypu`, `ticketTypes`.`date` AS `dataWydarzenia`, `user`.`name` AS `dodal` FROM `tickets`, `user`, `ticketTypes` WHERE `user`.`id` = `addedBy` AND `tickets`.`active` = 1 AND `ticketTypes`.`id` = `type`;')
    return res.render('ticketList', {
        title: 'Add Ticket',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user, 
        success: 'Ticket deleted successfully',
        error: false,
        tickets: row2
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err)
            return res.status(500).send('Internal Server Error')
        }
        res.clearCookie('connect.sid', { path: '/' })
        return res.redirect('/panel/login')
    })
})

router.get('/checkTicket', async (req, res) => {
    return res.render('checkTicket', {
        title: 'Check Ticket',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user, 
        error: false,
        success: false,
        ticketInfo: false,
        notValidTicket: false
    })
})

router.post('/checkTicket', async (req, res) => {
    if (req.body.action !== 'check') {
        console.log('Unknown action:', req.body.action);
        return res.render('checkTicket', {
            title: 'Check Ticket',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user,
            error: 'Error: Unknown action',
            success: false,
            ticketInfo: false,
            notValidTicket: false
        });
    }

    // Sprawdzenie formatu biletu
    if (!req.body.code.includes('ticket://') || !req.body.code.includes('?pass=')) {
        return res.render('checkTicket', {
            title: 'Check Ticket',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user,
            error: 'Error: Invalid ticket',
            success: false,
            ticketInfo: false,
            notValidTicket: false
        });
    }

    // Parsowanie ID i hasła
    const ticket = req.body.code;
    const pass = ticket.split('?pass=')[1];
    const id = ticket.split('ticket://')[1].split('?pass=')[0];

    console.log('Ticket:', ticket);
    console.log('ID:', id);
    console.log('Pass:', pass);

    // Pobierz dane biletu (bez count)
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
        return res.render('checkTicket', {
            title: 'Check Ticket',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user,
            error: false,
            success: false,
            ticketInfo: false,
            notValidTicket: true
        });
    }

    const ticketInfo = ticketRows[0];

    // Sprawdź, czy użytkownik już skanował ten bilet w ostatnich 15 sekundach
    const [recentScan] = await con.execute(
        `SELECT id FROM ticketCheck 
         WHERE ticketId = ? AND userId = ? 
         AND TIMESTAMPDIFF(SECOND, time, NOW()) < 15`,
        [ticketInfo.idTicket, req.session.user.id]
    );

    // Jeśli nie skanował - dodaj wpis
    if (recentScan.length === 0) {
        await con.execute(
            'INSERT INTO ticketCheck (ticketId, userId) VALUES (?, ?)',
            [ticketInfo.idTicket, req.session.user.id]
        );
    }

    // Pobierz aktualną liczbę skanów (po ewentualnym INSERT)
    const [checkCountResult] = await con.execute(
        'SELECT COUNT(*) AS checkCount FROM ticketCheck WHERE ticketId = ?',
        [ticketInfo.idTicket]
    );

    // Dodaj do obiektu
    ticketInfo.checkCount = checkCountResult[0].checkCount;

    // Sprawdzenie aktywności biletu
    const notValidTicket = ticketInfo.active === 0;

    return res.render('checkTicket', {
        title: 'Check Ticket',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user,
        error: false,
        success: false,
        ticketInfo: ticketInfo,
        notValidTicket: notValidTicket
    });
});


router.get('/checkTicketManual', async (req, res) => {
    const [rows] = await con.execute("SELECT `tickets`.`id` AS 'idTicket', `tickets`.`name` AS 'ticketHolder', `tickets`.`email` AS 'email', `tickets`.`active` AS 'active', `ticketTypes`.`name` AS 'ticketType', `ticketTypes`.`date` AS 'date', COUNT(`ticketCheck`.`id`) AS 'checkCount' FROM `tickets` JOIN `ticketTypes` ON `tickets`.`type` = `ticketTypes`.`id` LEFT JOIN `ticketCheck` ON `tickets`.`id` = `ticketCheck`.`ticketId` GROUP BY `tickets`.`id`;"  )
    res.render('checkTicketManual', {
        title: 'Check Ticket Manual',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user, 
        error: false,
        success: false,
        ticketsRows: rows,
        ticketInfo: false,
        notValidTicket: false

    })
})

router.post('/checkTicketManual', async (req, res) => {
    var action = req.body.action
    if(action != 'check')
    {
        console.log('Unknown action:', action)
        return res.render('checkTicketManual', {
            title: 'Check Ticket Manual',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: 'Error: Unknown action',
            success: false,
            ticketsRows: rows,
            ticketInfo: false,
            notValidTicket: false
        })
    }
    else
    {
        var id = req.body.id
        console.log('ID:', id)
        const [rows] = await con.execute("SELECT `tickets`.`id` AS 'idTicket', `tickets`.`name` AS 'ticketHolder', `tickets`.`email` AS 'email', `tickets`.`active` AS 'active', `ticketTypes`.`name` AS 'ticketType', `ticketTypes`.`date` AS 'date', COUNT(`ticketCheck`.`id`) AS 'checkCount' FROM `tickets` JOIN `ticketTypes` ON `tickets`.`type` = `ticketTypes`.`id` LEFT JOIN `ticketCheck` ON `tickets`.`id` = `ticketCheck`.`ticketId` WHERE `tickets`.id = ? GROUP BY `tickets`.`id`;", [id])
        console.log('Rows:', rows);
        if(rows.length > 0)
        {
            await con.execute('INSERT INTO ticketCheck (ticketId, userId) VALUES (?, ?)', [rows[0].idTicket, req.session.user.id])
            var notValidTicket = false
            if(rows[0].active == 0)
            {
                var notValidTicket = true
            }
            const [row] = await con.execute("SELECT `tickets`.`id` AS 'idTicket', `tickets`.`name` AS 'ticketHolder', `tickets`.`email` AS 'email', `tickets`.`active` AS 'active', `ticketTypes`.`name` AS 'ticketType', `ticketTypes`.`date` AS 'date', COUNT(`ticketCheck`.`id`) AS 'checkCount' FROM `tickets` JOIN `ticketTypes` ON `tickets`.`type` = `ticketTypes`.`id` LEFT JOIN `ticketCheck` ON `tickets`.`id` = `ticketCheck`.`ticketId` GROUP BY `tickets`.`id`;")

            return res.render('checkTicketManual', {
                title: 'Check Ticket Manual',
                siteName: req.siteName,
                menu: [
                    { name: 'home', url: '/' },
                    { name: 'panel', url: '/panel/dashboard', active: true }
                ],
                user: req.session.user, 
                error: false,
                success: false,
                ticketsRows: row,
                ticketInfo: rows[0],
                notValidTicket: notValidTicket
            })
        }
    }
})

router.get('/settings', async (req, res) => {
    const [rows] = await con.execute('SELECT * FROM settings')
    res.render('settings', {
        title: 'Settings',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user, 
        error: false,
        success: false,
        settings: rows
    })
})

router.post('/settings', async (req, res) => {
    //in body action = add or delete
    var action = req.body.action
    if(action == 'change')
    {
        var siteName = req.body.siteName
        var smtpServer = req.body.smtpServer
        var smtpUser = req.body.smtpUser
        var smtpPass = req.body.smtpPass
        var smtpSendAs = req.body.smtpSendAs
        var smtpPort = req.body.smtpPort
        var smtpTls = req.body.smtpTls
        var smtpBcc = req.body.smtpBcc
        var smtpSubject = req.body.smtpSubject
        var smtpFromEmail = req.body.smtpFromEmail

        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [siteName, 'siteName'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpServer, 'smtpServer'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpUser, 'smtpUser'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpPass, 'smtpPass'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpSendAs, 'smtpSendAs'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpPort, 'smtpPort'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpTls, 'smtpTls'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpBcc, 'smtpBcc'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpSubject, 'smtpSubject'])
        await con.execute('UPDATE settings SET value = ? WHERE name = ?', [smtpFromEmail, 'smtpFromEmail'])
    }
    else if(action == 'deleteAll')
    {
        await con.execute('SET FOREIGN_KEY_CHECKS = 0');
        await con.execute('TRUNCATE TABLE ticketCheck');
        await con.execute('TRUNCATE TABLE tickets');
        await con.execute('TRUNCATE TABLE ticketTypes');
        await con.execute('SET FOREIGN_KEY_CHECKS = 1');
    }
    else if(action == 'backup')
    {
        
    }
    else
    {
        console.log('Unknown action:', action)
        return res.render('settings', {
            title: 'Settings',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user,
            error: 'Error: Unknown action',
            success: false,
            settings: rows
        })
    }
    const [rows] = await con.execute('SELECT * FROM settings')
    return res.render('settings', {
        title: 'Settings',
        siteName: req.siteName,
        menu: [
            { name: 'home', url: '/' },
            { name: 'panel', url: '/panel/dashboard', active: true }
        ],
        user: req.session.user, 
        error: false,
        success: 'Settings updated successfully',
        settings: rows
    })
})

router.get('/api', async (req, res) => {
    const [rows] = await con.execute('SELECT * FROM apiKeys WHERE user = ? AND active = 1', [req.session.user.id])
    if(rows.length == 0)
    {
        return res.render('apiNew', {
            title: 'API',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: false,
            success: false,
            apiKey: false
        })
    }
    else
    {
        var apiKeyToRender = {'key': rows[0].keyCode, 'www': process.env.API_ADDRESS}
        return res.render('api', {
            title: 'API',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: false,
            success: false,
            apiKey: JSON.stringify(apiKeyToRender)
        })
    }
})

router.post('/api', async (req, res) => {
    //action = [reset or new]
    var action = req.body.action
    if(action == 'reset')
    {
        await con.execute('UPDATE apiKeys SET active = 0 WHERE user = ?', [req.session.user.id])
        var keyCode = randomChars(50)
        await con.execute('INSERT INTO apiKeys (keyCode, user) VALUES (?, ?)', [keyCode, req.session.user.id])
    }
    else if(action == 'new')
    {
        var keyCode = randomChars(50)
        await con.execute('INSERT INTO apiKeys (keyCode, user) VALUES (?, ?)', [keyCode, req.session.user.id])
    }
    else
    {
        console.log('Unknown action:', action)
        return res.render('newApi', {
            title: 'API',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: 'Error: Unknown action',
            success: false,
            apiKey: false
        })
    }
    const [rows] = await con.execute('SELECT * FROM apiKeys WHERE user = ? AND active = 1', [req.session.user.id])
    if(rows.length == 0)
    {
        return res.render('apiNew', {
            title: 'API',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: false,
            success: 'API key changed successfully',
            apiKey: false
        })
    }
    else
    {
        var apiKeyToRender = {'key': rows[0].keyCode, 'www': process.env.API_ADDRESS}        
        return res.render('api', {
            title: 'API',
            siteName: req.siteName,
            menu: [
                { name: 'home', url: '/' },
                { name: 'panel', url: '/panel/dashboard', active: true }
            ],
            user: req.session.user, 
            error: false,
            success: 'API key reset successfully',
            apiKey: JSON.stringify(apiKeyToRender)
        })
    }
})



function randomChars(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default router
