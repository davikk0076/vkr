const express = require("express")
const app = express()
const cors = require('cors')
const pool = require('./db');
const multer = require("multer");
const upload = multer();

app.use(cors())
app.use(express.json())
const userController = require('./controllers/userController');
const staticDataController = require('./controllers/staticDataController');
const voiceRecognitionController = require('./controllers/voiceRecognitionController');
const requestsController = require('./controllers/requestsController');
const volunteerController = require('./controllers/volunteerController');
const PORT = process.env.PORT;

app.get('/users', userController.getUsers);
app.post('/users', userController.createUser);
app.get('/users/:id', userController.getUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);
app.get('/login', userController.loginUser)
app.get('/roles', staticDataController.getStaticData);
app.get('/statuses', staticDataController.getStaticData);
app.get('/help_types', staticDataController.getStaticData);
app.post('/voice', upload.single("file"), voiceRecognitionController.getTextFromVoice);
app.post('/requests', requestsController.createRequest);
app.get('/help_requests', requestsController.getRequests);
app.post('/help_requests/:id/accept', requestsController.acceptRequest);
app.post('/help_requests/:id/complete', requestsController.completeRequest);
app.post('/volunteers', volunteerController.createVolunteer)
app.get('/volunteers/location/:id', volunteerController.getLocation)

app.listen(PORT, () => {
    console.log(`API работает на http://localhost:${PORT}`)
})
