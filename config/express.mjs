import express from 'express';
import bodyParser from 'body-parser';
import routes from '../server/routes/index.route';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

// errors handler
app.use((err, req, res, next) => {
  // joi errors
  if (err && err.errors) {
    const errors = [];
    err.errors.map(error => errors.push(error.messages[0].replace(/\"/g, '')));
    res.status(err.status).send({ errors });
  } else if (err instanceof SyntaxError && err.status === 400) {
    res.status(err.status).send({ errors: ['Bad JSON'] });
  } else if (err.unexpectedError) {
    res.status(err.status).send({ errors: [err.message] });
  }
});

export default app;
