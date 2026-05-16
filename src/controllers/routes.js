import { Router } from 'express';
import { addDemoHeaders } from '../middleware/demo/headers.js';             // TODO: Add import statements for controllers and middleware
import { catalogPage, courseDetailPage, catalogByDepartmentPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testConflictPage, testErrorPage } from './index.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

// Create a new router instance
const router = Router();

// TODO: Add route definitions

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/departments', catalogByDepartmentPage);
router.get('/catalog/:courseId', courseDetailPage);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Faculty detail page

router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

// Route to trigger a test error
router.get('/test-conflict', testConflictPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);

export default router;