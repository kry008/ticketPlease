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
        success: false
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
            error: false
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
            success: false
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
        error: false
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
            dateShow: dateShow
        }
        var config = JSON.stringify(config)
        var img = req.body.img
        //var config = req.body.config
        var emailMessage = req.body.emailMessage
        var whoAdded = req.session.user.id
        await con.execute('INSERT INTO ticketTypes (name, onTicket, numberOfLines, date, img, config, emailMessage, whoAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, onTicket, numberOfLines, date, img, config, emailMessage, whoAdded])
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
        var pass = randomChars(32)
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
    //req body action = check
    if(req.body.action != 'check')
    {
        console.log('Unknown action:', req.body.action)
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
        })
    }
    else
    {
        //jeżeli nie znajdziesz na początku ticket:// oraz w środku ?pass= to nie jest ticket
        if(!req.body.code.includes('ticket://') || !req.body.code.includes('?pass='))
        {
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
            })

        }
        //check if ticket is valid
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
            await con.execute('INSERT INTO ticketCheck (ticketId, userId) VALUES (?, ?)', [rows[0].idTicket, req.session.user.id])
            var notValidTicket = false
            if(rows[0].active == 0)
            {
                var notValidTicket = true
            }
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
                ticketInfo: rows[0],
                notValidTicket: notValidTicket
            })
        }
    }
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
    })
})

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
        const [rows] = await con.execute("SELECT `tickets`.`id` AS 'idTicket', `tickets`.`name` AS 'ticketHolder', `tickets`.`email` AS 'email', `tickets`.`active` AS 'active', `ticketTypes`.`name` AS 'ticketType', `ticketTypes`.`date` AS 'date', COUNT(`ticketCheck`.`id`) AS 'checkCount' FROM `tickets` JOIN `ticketTypes` ON `tickets`.`type` = `ticketTypes`.`id` LEFT JOIN `ticketCheck` ON `tickets`.`id` = `ticketCheck`.`ticketId` AND `tickets`.id = ? GROUP BY `tickets`.`id`;", [id])
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
