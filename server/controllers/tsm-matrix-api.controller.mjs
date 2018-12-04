import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.API_KEY;

async function getMatrix(points) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${points}&destinations=${points}&key=${apiKey}`;
  try {
    const matrix = await axios.get(url);
    return matrix.data;
  } catch (error) {
    throw { status: error.response.status, message: error.response.data.error_message };
  }
}

// we take one row of the matrix and look for the closest point
function getClosestToOnePoint(distances, pointsToAvoid) {
  const closestPoint = {
    position: null,
    travelDistance: null,
  };
  distances.elements.forEach((stop, index) => {
    const duration = stop.duration.value;
    if (duration !== 0 // 0 means this is our starting point
      && (duration < closestPoint.travelDistance || !closestPoint.travelDistance)
      && pointsToAvoid.indexOf(index) === -1 // we didn't already go to this point
    ) {
      closestPoint.position = index;
      closestPoint.travelDistance = duration;
    }
  });
  return closestPoint;
}

// we look for the closest point from home and so on until we completed our course
function getScheduleByFastestFromStartingPoint(points) {
  // we start with home
  let currentPoint = {
    position: 0, // index in matrix
    travelDistance: 0,
  };
  const schedule = [];
  for (let i = 0; i < points.length; i += 1) {
    const indexes = schedule.map(point => point.position);
    const currentClosest = getClosestToOnePoint(points[currentPoint.position], indexes);
    schedule.push(currentPoint);
    currentPoint = currentClosest;
  }
  // we will put home inside the schedule separately
  schedule.shift();
  return schedule;
}

// POST /tsm/matrix/routeOptimizer
async function routeOptimizer(req, res, next) {
  // syntax for the google distance matrix API: 'origins=41.43206,-81.38992|-33.86748,151.20699'
  const home = `${req.body.home.lat},${req.body.home.lng}`;
  const destinations = req.body.tasks.map(task => `${task.lat},${task.lng}`).join('|');
  const allPoints = `${home}|${destinations}`;

  try {
    const matrix = await getMatrix(allPoints);
    const scheduleByIndexes = getScheduleByFastestFromStartingPoint(matrix.rows);
    const schedule = {
      totalTime: null,
      schedule: [
        { // starting point is always home
          id: 1,
          destination: matrix.destination_addresses[0],
          startsAt: req.body.departureTime.getTime(),
          endsAt: req.body.departureTime.getTime(),
          lat: req.body.home.lat,
          lng: req.body.home.lng,
        },
      ],
    };

    let backHome;
    // we add all points
    scheduleByIndexes.forEach((point, index, array) => {
      const startsAt = schedule.schedule[index].endsAt + point.travelDistance;
      const endsAt = startsAt + (req.body.tasks[point.position - 1].duration * 60);
      schedule.schedule.push({
        id: index + 2, // we already have id:1 in our schedule array (home)
        destination: matrix.destination_addresses[point.position], // google convert coordinates into addresses, might as well use it
        startsAt,
        endsAt,
        lat: req.body.tasks[point.position - 1].lat, // point represents the index in the matrix array
        lng: req.body.tasks[point.position - 1].lng, // matrix contains one more entry than tasks (home)
      });
      if (index === array.length - 1) // backHome = end of last task + distance from home
      { backHome = matrix.rows[point.position].elements[0].duration.value + endsAt; }
    });
    // we add the return home
    schedule.schedule.push({
      id: schedule.schedule.length + 1,
      destination: schedule.schedule[0].destination,
      startsAt: backHome,
      endsAt: backHome,
      lat: req.body.home.lat,
      lng: req.body.home.lng,
    });
    const lastIndex = schedule.schedule.length - 1;
    schedule.totalTime = Math.round((schedule.schedule[lastIndex].endsAt - schedule.schedule[0].startsAt) / 60);
    res.json(schedule);
  } catch (err) {
    const error = {
      unexpectedError: true,
      message: err.message,
      status: err.status,
    };
    next(error);
  }
}

export default { routeOptimizer };
