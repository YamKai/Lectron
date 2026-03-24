
function createCrudRouter({ entity, uuid }) {
  const supabase = require('../supabaseClient');
  const express = require('express');
  const router = express.Router();
  router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(entity)
      .select('*')
      .eq(uuid, id)
      .maybeSingle();

    if (error) {
      console.error('Supabase GET error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({
        error: `${entity} not found`,
        [uuid]: id
      });
    }

    res.json(data);

  } catch (err) {
    console.error('Server GET error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const postData = req.body;

    const { data, error } = await supabase
      .from(entity)
      .insert([postData])
      .select();

    if (error) {
      console.error('Supabase POST error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);

  } catch (err) {
    console.error('Server POST error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const { data, error } = await supabase
      .from(entity)
      .update(updatedData)
      .eq(uuid, id)
      .select();

    if (error) {
      console.error('Supabase PATCH error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: `${entity} not found`,
        [uuid]: id
      });
    }

    res.json(data[0]);

  } catch (err) {
    console.error('Server PATCH error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(entity)
      .delete()
      .eq(uuid, id)
      .select();

    if (error) {
      console.error('Supabase DELETE error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: `${entity} not found`,
        [uuid]: id
      });
    }

    res.json({
      message: `${entity} deleted successfully`,
      [uuid]: id
    });

  } catch (err) {
    console.error('Server DELETE error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
  router.supabase = supabase;
  return router;
}

module.exports = createCrudRouter;