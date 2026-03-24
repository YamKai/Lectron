const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'Enrollment',
  uuid: 'enrollment_id'
});