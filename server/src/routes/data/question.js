const createCrudRouter = require('../../controllers/crud_controller');

const questionRouter = createCrudRouter({
  entity: 'question',
  uuid: 'question_id',
});

// GET /api/questions/exam/:examId -> all questions for an exam, sorted by index
questionRouter.get('/exam/:examId', async (req, res) => {
  const { examId } = req.params;
  try {
    const { data, error } = await questionRouter.supabase
      .from('question')
      .select('*')
      .eq('exam_id', examId)
      .order('question_index', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = questionRouter;
