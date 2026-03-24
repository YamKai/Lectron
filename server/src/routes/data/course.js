const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'course',
  uuid: 'course_id'
});