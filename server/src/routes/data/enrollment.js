const createCrudRouter = require('../../controllers/crud_controller');

const enrollmentRouter = createCrudRouter({
  entity: 'enrollment',
  uuid: 'enrollment_id',
});

// GET /api/enrollments/user/:userId -> all enrollments for a user
enrollmentRouter.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await enrollmentRouter.supabase
      .from('enrollment')
      .select('*')
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = enrollmentRouter;
