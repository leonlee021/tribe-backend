const app = require('./app');
const port = process.env.PORT || 4000;

try {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} catch (error) {
    console.error('Error starting the server:', error);
}
