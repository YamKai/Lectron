const createCrudRouter = require('../../controllers/crud_controller');

const examRouter = createCrudRouter({
  entity: 'exam',
  uuid: 'exam_id',
});

// GET /api/exams/course/:courseId -> all exams for a course
examRouter.get('/course/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const { data, error } = await examRouter.supabase
      .from('exam')
      .select('*')
      .eq('course_id', courseId)
      .order('exam_index', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = examRouter;
