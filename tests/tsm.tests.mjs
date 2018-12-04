import chai, { expect } from 'chai';
import tsmCtrlMatrix from '../server/controllers/tsm-matrix-api.controller';

const distances = {
  "elements": [
    {
      "distance": {
        "text": "1 m",
        "value": 0
      },
      "duration": {
        "text": "1 min",
        "value": 0
      },
      "status": "OK"
    },
    {
      "distance": {
        "text": "4.0 km",
        "value": 4011
      },
      "duration": {
        "text": "16 mins",
        "value": 964
      },
      "status": "OK"
    },
    {
      "distance": {
        "text": "13.0 km",
        "value": 13033
      },
      "duration": {
        "text": "24 mins",
        "value": 1413
      },
      "status": "OK"
    },
    {
      "distance": {
        "text": "18.9 km",
        "value": 18932
      },
      "duration": {
        "text": "23 mins",
        "value": 1392
      },
      "status": "OK"
    },
    {
      "distance": {
        "text": "3.1 km",
        "value": 3074
      },
      "duration": {
        "text": "11 mins",
        "value": 647
      },
      "status": "OK"
    }
  ]
};

const pointsToAvoid = [ 0, 4 ];

const expectedResult = { position: 1, travelDistance: 964 };

it('should return lowest non-zero value', () => {
  const isValid = tsmCtrlMatrix.getClosestToOnePoint(distances, pointsToAvoid);
  isValid.should.equal(expectedResult);
});
