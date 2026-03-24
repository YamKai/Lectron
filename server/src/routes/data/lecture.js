const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'lecture',
  uuid: 'lecture_id'
});