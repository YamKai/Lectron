const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'Lecture',
  uuid: 'lecture_id'
});