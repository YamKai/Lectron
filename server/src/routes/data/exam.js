const createCrudRouter = require('../../controllers/crud_controller');

module.exports = createCrudRouter({
  entity: 'exam',
  uuid: 'exam_id'
});