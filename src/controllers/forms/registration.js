import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .normalizeEmail()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    // Render the registration form view (matches the file location)
    res.render('forms/registration/form', {
        title: 'User Registration'
    });
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
    // Store each validation error as a separate flash message
         errors.array().forEach(error => {
        req.flash('error', error.msg);
    });
        return res.redirect('/login'); 
    }

        // Extract validated data from request body
        const { name, email, password } = req.body;

        try {
            // Check if email already exists in database
            const exists = await emailExists(email);
            if (exists) {
                req.flash('warning', 'An account with that email already exists. Please log in instead.');
                return res.redirect('/login');
            }

            // Hash the password before saving to database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Save user to database with hashed password
            await saveUser(name, email, hashedPassword);
            req.flash('success', 'Registration successful. Please log in.');
            return res.redirect('/login');
        // NOTE: Later when we add authentication, we'll change this to require login first
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Unable to submit your email. Please try again later.');
        // TODO: Redirect back to /register
        return res.redirect('/login');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        // TODO: Call getAllUsers() and assign to users variable
        users = await getAllUsers();
    } catch (error) {
        // TODO: Log the error to console
        console.error('Error retriving users:', error);
        // users remains empty array on error
    }

    // TODO: Render the users list view (forms/registration/list)
    // TODO: Pass title: 'Registered Users' and the users variable in the data object
    return res.render('forms/registration/list', {
        title: 'Registered Users',
        users
    });
};

/**
 * GET /register - Display the registration form
 */
router.get('/', showRegistrationForm);

/**
 * POST /register - Handle registration form submission with validation
 */
router.post('/', registrationValidation, processRegistration);

/**
 * GET /register/list - Display all registered users
 */
router.get('/list', showAllUsers);

export default router;