import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

// Route handler for the faculty list page
const facultyListPage = async (req, res) => {
    const sortBy = req.query.sort || 'name';
    const facultyMembers = await getSortedFaculty(sortBy);
    res.render('faculty/list', {
        title: 'Faculty',
        facultyMembers,
        currentSort: sortBy
        });
        };

// Route handler for an individual faculty detail page

const facultyDetailPage = async (req, res, next) => {
        const facultySlug = req.params.facultySlug;
    const facultyMember = await getFacultyBySlug(facultySlug);
            if (Object.keys(facultyMember).length === 0) {
                const err = new Error(`Faculty member ${facultySlug} not found`);
                        err.status = 404;
                    
                        return next(err);
                 }           
    res.render('faculty/detail', {
                title: facultyMember.name,
                faculty: { ...facultyMember, id: facultyMember.id }

                    });
};

export { facultyListPage, facultyDetailPage };