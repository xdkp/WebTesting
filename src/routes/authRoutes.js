const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const SALT_ROUNDS = 10;

const transporter = nodemailer.createTransport({
    host: 'mailhog',
    port: 1025,
    auth: null,
});

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const errorMessage = errors.array().map(err => err.msg).join(', ');
    res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
};

const userValidationRules = () => {
    return [
        body('firstname').trim().escape().notEmpty().isLength({ max: 50 }).withMessage('Invalid Firstname.'),
        body('lastname').trim().escape().notEmpty().isLength({ max: 50 }).withMessage('Invalid Lastname.'),
        body('email').isEmail().isLength({ max: 50 }).withMessage('Invalid email.').normalizeEmail(),
        body('password').isLength({ min: 8, max: 64 }).withMessage('Password must be at least 8 and maximum 64 characters.'),
    ];
};

router.post('/register', userValidationRules(), validate, async (req, res) => {
    const { firstname, lastname, password, email } = req.body;
    const type = 'unverified';
    let hashedPassword = null;

    if (password) {
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        hashedPassword = await bcrypt.hash(password, salt);
    } else {
        res.redirect(`/login?error=${encodeURIComponent('Error registering user.')}`);
    }

    try {
        const result = await pool.query(
        'INSERT INTO users (firstname, lastname, password, email, type) VALUES ($1, $2, $3, $4, $5) RETURNING id, firstname, email',
        [firstname, lastname, hashedPassword, email, type]
        );

        // add a function to create a unique link & implement the verificatin of that unique id
        const verificationLink = `http://localhost/verify/${result.rows[0].id}`;

        // Send verification email
        await transporter.sendMail({
            from: '"Your App" <no-reply@yourapp.com>',
            to: email,
            subject: 'Verify Your Email',
            html: `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`
        });
        res.redirect(`/login?success=${encodeURIComponent('User registered successfully. Please check your email to verify your account.')}`);
    } catch (error) {
        res.redirect(`/login?error=${encodeURIComponent('Error registering user: Email taken.')}`);
    }
});

const verifyValidationRules = () => {
    return [
        param('userId').isNumeric().withMessage('Invalid user id.').trim().escape(),
    ];
};

router.get('/verify/:userId', verifyValidationRules(), validate, async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE users SET type = $1 WHERE id = $2 AND type = $3',
            ['user', userId, 'unverified']
        );
    
        if (result.rowCount === 0) {
            res.redirect(`/login?error=${encodeURIComponent('User not found or already verified.')}`);
        } else {
            res.redirect(`/login?success=${encodeURIComponent('Account verified. You can now log in.')}`);
        }

    } catch (error) {
        res.redirect(`/login?error=${encodeURIComponent('Error verifying user.')}`);
    }
});

const loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email format.').normalizeEmail(),
        body('password').isLength({ min: 8, max: 64 }).withMessage('Password must be at least 8 and maximum 64 characters.')
    ];
};

router.post('/login', loginValidationRules(), validate, async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ id: user.id, username: user.username, type: user.type }, 'secret', { expiresIn: '24h' });
                res.cookie('token', token, { httpOnly: true, secure: false });
                res.redirect(`/?success=${encodeURIComponent('Logged in. Welcome to Jurassic Island')}`);
            } else {
                res.redirect(`/login?error=${encodeURIComponent('Username or password incorrect1.')}`);
            }
        } else {
            res.redirect(`/login?error=${encodeURIComponent('Username or password incorrect2.')}`);
        }
    } catch (error) {
        res.redirect(`/login?error=${encodeURIComponent('Error logging in.')}`);
    }
});

module.exports = router;
