const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'enrollment',
  uuid: 'enrollment_id'
});