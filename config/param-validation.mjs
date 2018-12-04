import Joi from 'joi';

export default {
  // POST /tsm/routeOptimizer
  routeOptimizer: {
    body: {
      departureTime: Joi.date().timestamp().required(),
      home: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      tasks: Joi.array().items({
        id: Joi.number().required(),
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        duration: Joi.number().required(),
      }).required(),
    },
  },
};
