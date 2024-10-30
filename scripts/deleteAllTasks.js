const { Task } = require('../models');

const deleteAllTasks = async () => {
    try {
      await Task.destroy({
        where: {},
        truncate: true,
        cascade: true // This will cascade the delete to associated records
      });
      console.log('All tasks and associated records have been deleted.');
    } catch (error) {
      console.error('Error deleting tasks:', error);
    }
  };
  
  deleteAllTasks();
  