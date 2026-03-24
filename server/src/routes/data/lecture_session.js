const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'lecture_session',
  uuid: 'session_id'
});