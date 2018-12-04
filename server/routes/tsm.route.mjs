import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import tsmCtrlMatrix from '../controllers/tsm-matrix-api.controller';
import tsmCtrlDirections from '../controllers/tsm-directions-api.controller';

const router = express.Router();

router.route('/matrix/routeOptimizer')
  .post(validate(paramValidation.routeOptimizer), tsmCtrlMatrix.routeOptimizer);

router.route('/directions/routeOptimizer')
  .post(validate(paramValidation.routeOptimizer), tsmCtrlDirections.routeOptimizer);


export default router;
