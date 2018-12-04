import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.API_KEY;

async function getDirections(home, waypoints) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${home}&destination=${home}&waypoints=optimize:true|${waypoints}&key=${apiKey}`;
  try {
    const directions = await axios.get(url);
    return directions.data;
  } catch (error) {
    throw { status: error.response.status, message: error.response.data.error_message };
  }
}

// POST /tsm/directions/routeOptimizer
async function routeOptimizer(req, res, next) {
  const home = `${req.body.home.lat},${req.body.home.lng}`;
  const waypoints = req.body.tasks.map(task => `${task.lat},${task.lng}`).join('|');

  try {
    const directions = await getDirections(home, waypoints);
    const path = directions.routes[0].legs;
    const schedule = {
      totalTime: null,
      schedule: [{ // starting point is always home
        id: 1,
        destination: path[0].start_address,
        startsAt: req.body.departureTime.getTime(),
        endsAt: req.body.departureTime.getTime(),
        lat: req.body.home.lat,
        lng: req.body.home.lng,
      }],
    };
    const waypointsOrder = directions.routes[0].waypoint_order;
    // we add all points
    path.forEach((point, index) => {
      const startsAt = schedule.schedule[index].endsAt + point.duration.value;
      const taskIndex = Number.isInteger(waypointsOrder[index]) ? waypointsOrder[index] : null;
      const endsAt = Number.isInteger(taskIndex) ? startsAt + (req.body.tasks[taskIndex].duration * 60) : null;
      schedule.schedule.push({
        id: index + 2,
        destination: point.end_address,
        startsAt,
        endsAt: endsAt || startsAt, // when back home these values are the same
        lat: taskIndex ? req.body.tasks[taskIndex].lat : req.body.home.lat,
        lng: taskIndex ? req.body.tasks[taskIndex].lng : req.body.home.lng,
      });
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
