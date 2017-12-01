//variables and requirements
const express = require('express');
const apiRouter = express.Router();

//router functionality
const employeeRouter = require('./employees');
const menuRouter = require('./menus');

apiRouter.use('/employees', employeeRouter);
apiRouter.use('/menus', menuRouter);

//export
module.exports = apiRouter;
