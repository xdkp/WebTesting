const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const path = require('path');
const subdomain = require('express-subdomain');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//app.use(subdomain('subdomain1', subdomain1Router));
//app.use(subdomain('subdomain2', subdomain2Router));

// db setup
const resetAndInitializeDb = require('./initdb');
resetAndInitializeDb();

// routes
const authRoutes = require('./routes/authRoutes');
//const shopRoutes = require('./routes/shopRoutes');

// non-prod routes
const devRoutes = require('./routes/devRoutes');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRoutes);
//app.use(shopRoutes);
app.use('/dev', devRoutes);

const title = 'ジュラ島';

// auth middleware
const requireAuth = (req, res, next) => {
    const token = req.cookies ? req.cookies.token : null;
    if (!token) {
        return res.redirect(`/login?error=${encodeURIComponent('You need to login before accessing this page.')}`);
    }

    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded;
        next();
    } catch (ex) {
        return res.redirect(`/login?error=${encodeURIComponent('Invalid or expired token.')}`);
    }
};

// ### Top level pages ###

// index
app.get('/', (req, res) => {
    const errorMessage = req.query.error;
    const successMessage = req.query.success;
    res.render('index', { title: title, errorMessage: errorMessage, successMessage: successMessage });
});

// attractions
app.get('/attractions', requireAuth, async (req, res) => {
    const errorMessage = req.query.error;
    const successMessage = req.query.success;

    try {
        const result = await pool.query('SELECT * FROM attractions');
        const attractions = result.rows;
        res.render('attraction', { 
            title: title, 
            errorMessage: errorMessage, 
            successMessage: successMessage,
            attractions: attractions 
        });
    } catch (error) {
        console.error('Error fetching attractions:', error);
        res.redirect('/?error=Error fetching attractions');
    }
});


// shop
app.get('/shop', requireAuth, async (req, res) => {
    const errorMessage = req.query.error;
    const successMessage = req.query.success;
    const itemsPerPage = 12;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;

    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM items');
        const totalItems = parseInt(totalResult.rows[0].count, 10);
        const startIndex = (page - 1) * itemsPerPage;
        const result = await pool.query('SELECT * FROM items LIMIT $1 OFFSET $2', [itemsPerPage, startIndex]);
        const items = result.rows;

        res.render('shop', { 
            title: title, 
            errorMessage: errorMessage, 
            successMessage: successMessage,
            items: items,
            currentPage: page,
            totalPages: Math.ceil(totalItems / itemsPerPage)
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.redirect('/?error=Error fetching items');
    }
});


// login and register page
app.get('/login', (req, res) => {
    const errorMessage = req.query.error;
    const successMessage = req.query.success;
    res.render('auth', { title: title, errorMessage: errorMessage, successMessage: successMessage });
});

app.listen(port, () => {
    console.log(`Jurassic Island is online at http://localhost 🦖`);
});
