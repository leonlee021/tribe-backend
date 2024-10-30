const { Task, User } = require('../models'); 

async function createTestTask() {
    const user = await User.findByPk(1); // Find user with id 1

    if (!user) {
        console.log('User not found');
        return;
    }

    const task = await Task.create({
        requestType: 'Test',
        postContent: 'This is a test task',
        locationDependent: false,
        location: 'Test Location',
        deadline: new Date(),
        price: 10,
        specificHelper: false,
        helperUsername: '',
        userId: user.id, // Associate the task with the user
    });

    console.log('Task created:', task);
}

createTestTask();
