const createCrudRouter = require('../../controllers/crud_controller');

const lectureSessionRouter = createCrudRouter({
  entity: 'lecture_session',
  uuid: 'session_id',
});

// GET /api/lecture-sessions/lecture/:lectureId/user/:userId -> a session for a user
lectureSessionRouter.get('/lecture/:lectureId/user/:userId', async (req, res) => {
  const { lectureId, userId } = req.params;
  try {
    const { data, error } = await lectureSessionRouter.supabase
      .from('lecture_session')
      .select('*')
      .eq('lecture_id', lectureId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    // Return null body (204) when no session exists yet — client will POST to create one.
    if (!data) return res.status(404).json({ error: 'Session not found' });
    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = lectureSessionRouter;


// POST /api/lecture-sessions/:id/save-code
lectureSessionRouter.post('/:id/save-code', async (req, res) => {
  const { id } = req.params;
  const { code_input } = req.body;
  if (typeof code_input !== 'string') {
    return res.status(400).json({ error: 'code_input must be a string' });
  }
  try {
    const { data, error } = await lectureSessionRouter.supabase
      .from('lecture_session')
      .update({ code_input })
      .eq('session_id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Session not found' });
    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
