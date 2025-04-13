import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()
import ejs from 'ejs'
const app = express()
const port = process.env.PORT || 3000
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', './views')
import session from 'express-session';

app.use(session({
  secret: process.env.SECRET_KEY || 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
const con = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT
});

var siteName = process.env.TITLE
async function settings()
{
  const [rows, fields] = await con.execute('SELECT value FROM settings WHERE name = ?', ['siteName'])
  if (rows.length > 0) {
    siteName = rows[0].value
  }
}

app.all('*', (req, res, next) => {
  //console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)

  req.siteName = siteName
  
  //console.log(req.body)
  next()
})

app.get('/', (req, res) => {

  var menuHome = [
    { name: 'home', url: '/', active: true },
    { name: 'panel', url: '/panel' }
  ]
  return res.render('index', { menu: menuHome, siteName: siteName, title: 'Home' })
})


app.get('/panel', (req, res) => {
  return res.redirect('/panel/dashboard')
})

app.get('/panel/login', (req, res) => {
  var menuHome = [
    { name: 'home', url: '/', active: false },
    { name: 'panel', url: '/panel' }
  ]
  return res.render('login', { menu: menuHome, siteName: siteName, title: 'Login', error: false })
})

app.get('/panel/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err)
      return res.status(500).send('Internal Server Error')
    }
    res.clearCookie('connect.sid', { path: '/' })
    return res.redirect('/panel/login')
  })
})

app.post('/panel/login', async (req, res) => {
  const { login, password } = req.body;
  //console.log("Login attempt:", login, password);

  try {
    const [rows] = await con.execute(
      'SELECT * FROM user WHERE login = ? AND pass = SHA1(?)',
      [login, password]
    );

    if (rows.length > 0) {
      req.session.user = rows[0];
      req.session.user = rows[0];
      await con.execute('UPDATE user SET lastLogin = ? WHERE id = ?', [new Date(), rows[0].id]);
      return res.redirect('/panel/dashboard');
    } else {
      return res.render('login', { menu: menuHome, siteName, title: 'Login', error: "Wrong login or password, try again" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).send("Internal Server Error");
  }
});


import panelRoutes from './routes/panel.js'
app.use('/panel', panelRoutes)
import apiRouters from './routes/api.js'
app.use('/api', apiRouters)

app.all('*', (req, res) => {
  var menuHome = [
    { name: 'home', url: '/', active: false },
    { name: 'panel', url: '/panel' }
  ]
  return res.status(404).render('404', {
    siteName: siteName,
    menu: menuHome,
    title: '404 Not Found'
  })
})

await settings().then(() => {
  app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })
}).catch((err) => {
  console.error('Error fetching settings:', err);
  process.exit(1); // Exit the process with an error code
})