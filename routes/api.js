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

export default router
