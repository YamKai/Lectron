const createCrudRouter = require('../../controllers/crud_controller');

const examSessionRouter = createCrudRouter({
  entity: 'exam_session',
  uuid: 'exam_session_id',
});

// GET /api/exam-sessions/exam/:examId/user/:userId -> session for a user on an exam
examSessionRouter.get('/exam/:examId/user/:userId', async (req, res) => {
  const { examId, userId } = req.params;
  try {
    const { data, error } = await examSessionRouter.supabase
      .from('exam_session')
      .select('*')
      .eq('exam_id', examId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Exam session not found' });
    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = examSessionRouter;
