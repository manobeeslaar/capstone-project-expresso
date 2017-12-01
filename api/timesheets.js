//variables and requirements
const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = express.Router();

//function required fields
function hasRequiredTimesheetFields(timesheetData) {
  return timesheetData.hours &&
  timesheetData.rate &&
  timesheetData.date;
}

//check whether the timesheet with the id from the route exists in the database
timesheetRouter.param('timesheetId', (req, res, next, id) => {
  const timesheetId = Number(id);
  db.get('SELECT * FROM Timesheet WHERE id = $id', { $id: timesheetId },
    (error, timesheet) => {
      if (error) {
        next(error);
      } else if (timesheet) {
        req.timesheet = timesheet;
        req.timesheetId = Number(id);
        next();
      } else {
      res.status(404).send();
    }
  });
});

//GET function
timesheetRouter.get('/', (req, res, next) => {
  const employee = req.employee;
  db.all('SELECT * FROM Timesheet WHERE employee_id = $employee_id', { $employee_id: employee.id },
    (error, timesheets) => {
      if (error) {
        return next(error);
      }
      res.send({ timesheets });
    })
});

//POST function
timesheetRouter.post('/', (req, res, next) => {
  const employee = req.employee;
  const timesheetData = req.body.timesheet;

  if (!hasRequiredTimesheetFields(timesheetData)) {
    return res.status(400).send();
  }

  db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)', {
    $hours: timesheetData.hours,
    $rate: timesheetData.rate,
    $date: timesheetData.date,
    $employee_id: employee.id,
  }, function(createError) {
    if (createError) {
      return next(createError);
    }

    db.get('SELECT * FROM timesheet WHERE id = $id', { $id: this.lastID },
      (selectError, timesheet) => {
        if (selectError) {
          return next(selectError);
        }
        res.status(201).send({ timesheet });
      });
  });
});

//POST function - UPDATE
timesheetRouter.get('/:timesheetId', (req, res, next) => {
  res.send({ timesheet: req.timesheet });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
  const timesheetData = req.body.timesheet;
  const timesheetId = req.timesheet.id;
  const employee = req.employee;

  if (!hasRequiredTimesheetFields(timesheetData)) {
    return res.status(400).send();
  }

  db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE Timesheet.id = $id', {
    $hours: timesheetData.hours,
    $rate: timesheetData.rate,
    $date: timesheetData.date,
    $employee_id: employee.id,
    $id: timesheetId,
  }, (updateError) => {
    if (updateError) {
      return next(updateError);
    }

    db.get('SELECT * FROM Timesheet WHERE id = $id', { $id: timesheetId }, (selectError, timesheet) => {
      if (selectError) {
        return next(selectError);
      }

      res.status(200).send({ timesheet });
    });
  });
});

//DELETE function
timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.timesheet.id;

  db.run('DELETE FROM Timesheet WHERE id = $id', { $id: timesheetId }, (error, timesheet) => {
    if (error) {
      return next(error);
    }

    res.status(204).send({ timesheet });
  });
});

module.exports = timesheetRouter;
