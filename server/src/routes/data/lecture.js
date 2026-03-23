const express = require('express');
const router = express.Router();
const supabase = require('../../supabaseClient');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Lecture')
    .select('*')
    .eq('lecture_id', id)
    .maybeSingle();

  if (error) return res.status(500).json(error);
  if (!data) return res.status(404).json({ error: 'Lecture not found' , lecture_id: id, 'UUID received from URL:' : req.params.id});

  res.json(data);
});

router.post('/', async (req, res) => {
  const lecture = req.body;
  const { data, error } = await supabase
    .from('Lecture')
    .insert([lecture])
    .select();

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json(error);
  }

  res.status(201).json(data[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedLecture = req.body;

  try {
    const { data, error } = await supabase
      .from('Lecture')
      .update(updatedLecture)
      .eq('lecture_id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update lecture' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Lecture not found', lecture_id: id });
    }

    res.json(data[0]);

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Lecture')
    .delete()
    .eq('lecture_id', id);

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to delete lecture' });
  }

  res.json({ message: 'Lecture deleted successfully' });
});

module.exports = router;