// Route handlers for static pages
const homePage = (req, res) => {
    res.render('home', { title: 'Home' });
};

const aboutPage = (req, res) => {
    res.render('about', { title: 'About' });
};

const demoPage = (req, res) => {
    res.render('demo', { title: 'Middleware Demo Page' });
};

const testConflictPage = (req, res, next) => {
    const err = new Error('This is a test conflict');
    err.status = 409;
    next(err);
};

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

export { homePage, aboutPage, demoPage, testConflictPage, testErrorPage };