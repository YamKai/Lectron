const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'Lecture Session',
  uuid: 'session_id'
});