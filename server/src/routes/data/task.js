const createCrudRouter = require('../../controllers/crud_controller');

const tasksRouter = createCrudRouter({
  entity: 'task',
  uuid: 'task_id'
});

tasksRouter.get('/belongto/:id/:index', async (req, res) => {
  const { id, index } = req.params;

  try {
    const { data, error } = await tasksRouter.supabase
      .from('task')
      .select('*')
      .eq('lecture_id', id)
      .eq('index', Number(index));

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0)
      return res.status(404).json({ error: `Task ${index} not found`, lecture_id: id });

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

tasksRouter.get('/belongto/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await tasksRouter.supabase
      .from('task')
      .select('*')
      .eq('lecture_id', id);

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0)
      return res.status(404).json({ error: 'No tasks found for this lecture', lecture_id: id });

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = tasksRouter;