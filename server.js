//Create and export your Express app from a root-level file
//variable allocation and requirements
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorhandler = require('errorhandler');

const apiRouter = require('./api/api');

const app = new express();
const PORT = process.env.PORT || 4000;

//bodyparser and cors use -- cross origin requests
app.use (cors());

//parse JSON body to req.body
app.use(bodyParser.json())

//dev info logging
app.use(morgan('dev'));

//api Router mount
app.use('/api', apiRouter);

//errorhandler
app.use(errorhandler());

//static content from public folder - can remove
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
