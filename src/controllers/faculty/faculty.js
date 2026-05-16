import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

// Route handler for the faculty list page
const facultyListPage = (req, res) => {
    const sortBy = req.query.sort || 'name';
    const facultyMembers = getSortedFaculty(sortBy);
    res.render('faculty/list', {
        title: 'Faculty',
        facultyMembers,
        currentSort: sortBy
        });
        };

// Route handler for an individual faculty detail page

const facultyDetailPage = (req, res, next) => {
        const facultyId = req.params.facultyId;
        const facultyMember = getFacultyById(facultyId);
            if (!facultyMember) {
                const err = new Error(`Faculty member ${facultyId} not found`);
                        err.status = 404;
                    
                        return next(err);
                 }           
    res.render('faculty/detail', {
                title: facultyMember.name,
                faculty: { ...facultyMember, id: facultyId }

                    });
};

export { facultyListPage, facultyDetailPage };