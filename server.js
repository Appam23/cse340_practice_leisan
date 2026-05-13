/* *
* import library 
*/
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';


/**
 * Declare Important Variables
 */
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const name = process.env.NAME;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Setup Express Server
 */
const app = express();

/**
 * Configure Express middleware
 */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Global template variables middleware
 * 
 * Makes common variables available to all EJS templates without having to pass
 * them individually from each route handler
 */
app.use((req, res, next) => {
    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = NODE_ENV.toLowerCase() || 'production';

    // Continue to the next middleware or route handler
    next();
});

app.use((req, res, next) => {
    // Skip logging for routes that start with /. (like /.well-known/)
    if (!req.path.startsWith('/.')) {
        console.log(`${req.method} ${req.url}`);
    }
    next(); // Pass control to the next middleware or route
});

// Middleware to add global data to all templates
app.use((req, res, next) => {
    // Add current year for copyright
    res.locals.currentYear = new Date().getFullYear();

    next();
});

// Global middleware for time-based greeting
app.use((req, res, next) => {
    const currentHour = new Date().getHours();
    let currentTime;

    if (currentHour < 12) {
        currentTime= 'good morning!';
    } else if (currentHour < 17) {
        currentTime = 'good afternoon!';
    } else {
        currentTime = 'good evening!';
    }

    res.locals.greeting = `Hello ${currentTime}!`;

    next();
});

// Global middleware for season-based greeting
app.use((req, res, next) => {
    const currentMonth = new Date().getMonth();
    let currentSeason;

    if (currentMonth >= 2 && currentMonth <= 4) {
        currentSeason = 'spring :) ';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
        currentSeason = 'uff summer!';
    } else if (currentMonth >= 8 && currentMonth <= 10) {
        currentSeason = 'joyful fall!';
    } else {
        currentSeason = 'cold winter';
    }

    res.locals.seasonGreeting = `Happy ${currentSeason}!`;

    next();
});


// Global middleware for random theme selection
app.use((req, res, next) => {
    const themes = ['blue-theme', 'green-theme', 'red-theme', 'purple-theme', 'yellow-theme', 'yellow-green-theme'];

    // Pick a random theme from the array
    const randomIndex = Math.floor(Math.random() * themes.length);
    const randomTheme = themes[randomIndex];
    res.locals.bodyClass = randomTheme || 'blue-theme';

    next();
});

// Global middleware to share query parameters with templates
app.use((req, res, next) => {
    // Make req.query available to all templates for debugging and conditional rendering
    res.locals.queryParams = req.query || {};

    next();
});

// Route-specific middleware that sets custom headers
let demoPageRequestCount = 0;

const trackDemoPageRequests = (req, res, next) => {
    demoPageRequestCount += 1;
    res.locals.demoPageRequestCount = demoPageRequestCount;

    next();
};

const addDemoHeaders = (req, res, next) => {
    // Your task: Set custom headers using res.setHeader()
    res.setHeader('X-Demo-Page', 'true');
    // Add a header called 'X-Demo-Page' with value 'true'
    res.setHeader('X-Middleware-Demo', 'Test page for Demo!');
    // Add a header called 'X-Middleware-Demo' with any message you want

    next();
};

// Demo page route with header middleware
app.get('/demo', trackDemoPageRequests, addDemoHeaders, (req, res) => {
    res.render('demo', {
        title: 'Middleware Demo Page'
    });
});

// Course data - place this after imports, before routes
const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
        ]
    },
    'MATH110': {
        id: 'MATH110',
        title: 'College Algebra',
        description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
        credits: 4,
        sections: [
            { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
            { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
            { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'Academic Writing',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
        ]
    },
    'APPAM101': {
        id: 'APP101',
        title: 'Random Writing',
        description: 'Develop random writing skills for fun communication.',
        credits: 3,
        sections: [
            { time: '11:00 AM', room: 'GEB 1011', professor: 'Mr. Appam' },
            { time: '12:30 PM', room: 'GEB 3015', professor: 'Brother Wang' },
            { time: '3:00 PM', room: 'GEB 5003', professor: 'Sister Sweetie' }
        ]
    }
};

/**
 * Routes
 */
app.get('/', (req, res) => {
    const title = 'Welcome Home';
    res.render('home', { title });
});

app.get('/about', (req, res) => {
    const title = 'About Me';
    res.render('about', { title });
});

app.get('/products', (req, res) => {
    const title = 'Our Products';
    res.render('products', { title });
});

// Course catalog list page
app.get('/catalog', (req, res) => {
    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
});

// Enhanced course detail route with sorting
app.get('/catalog/:courseId', (req, res, next) => {
    const courseId = req.params.courseId;
    const course = courses[courseId];

    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    // Get sort parameter (default to 'time')
    const sortBy = req.query.sort || 'time';

    // Create a copy of sections to sort
    let sortedSections = [...course.sections];

    // Sort based on the parameter
    switch (sortBy) {
        case 'professor':
            sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
            break;
        case 'room':
            sortedSections.sort((a, b) => a.room.localeCompare(b.room));
            break;
        case 'time':
        default:
            // Keep original time order as default
            break;
    }

    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
});


// Test route for 500 errors
app.get('/test-error', (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
});

// Test route for 409 errors
app.get('/test-conflict', (req, res, next) => {
    const err = new Error('Conflict');
    err.status = 409;
    next(err);
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Course catalog list page (moved earlier to avoid being shadowed by 404)

// Global error handler
app.use((err, req, res, next) => {
    // Prevent infinite loops, if a response has already been sent, do nothing
    if (res.headersSent || res.finished) {
        return next(err);
    }

    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : status === 409 ? '409' : '500';

    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV // Our WebSocket check needs this and its convenient to pass along
    };

    // Render the appropriate error template with fallback
    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        // If rendering fails, send a simple error page instead
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
});

// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    import('ws')
        .then(({ WebSocketServer }) => {
            const wsPort = Number(PORT) + 1;
            const wsServer = new WebSocketServer({ port: wsPort });

            wsServer.on('listening', () => {
                console.log(`WebSocket server is running on port ${wsPort}`);
            });

            wsServer.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.warn(`WebSocket port ${wsPort} is already in use; skipping live reload server.`);
                    return;
                }

                console.error('WebSocket server error:', error);
            });
        })
        .catch((error) => {
            console.error('Failed to import ws module:', error);
        });
}

// Start the server and listen on the specified port

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});