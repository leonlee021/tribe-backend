// test/notifications.test.js
async function testNotification() {
    const testUser = await User.findOne({ where: { email: 'your-test-email@example.com' } });
    
    try {
        const response = await notificationController.sendPushNotification(
            testUser.id,
            'Test Notification',
            'Testing notification system',
            {
                taskId: 1,
                type: 'test',
                screen: 'HomeScreen'
            }
        );
        console.log('Test notification sent:', response);
    } catch (error) {
        console.error('Test failed:', error);
    }
}