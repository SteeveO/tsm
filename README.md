# TSM
Simple node.js API solving the Traveling Salesman Problem for a technical assignment

## What was asked

### POST /routeOptimizer

- This method should consume the list of tasks, with their durations and coordinates, and return a **schedule**, that takes into account both the travel time between those points and the duration of the task at each point.
- The method should return the most efficient route, that accounts for **driving time**
- The task schedule returned should also take the **home coordinates** into account. *Example : If the first task is 30minutes away, and the departureTime is set to 09:00am, the first task should be scheduled at 09:30*

**Input :**

```javascript
{
   // Time at which we're leaving home
   "departureTime": "1508756400",
   "home": {
      "lat": 48.83310530000001,
      "lng": 2.333563799999979
   },
   "tasks":[
      {
         "id":1,
         "lat":48.8623348,
         "lng":2.3447356000000354,
         "duration":45 // Duration of the task, in minutes
      },
      {
        "id":2,
        "lat":48.879251,
        "lng":2.282264899999973,
        "duration": 60
      },
      {
        "id": 3,
        "lat": 48.7251521,
        "lng": 2.259899799999971,
        "duration": 30
      },
      {
        "id": 4,
        "lat": 48.83477,
        "lng": 2.370769999999993,
        "duration": 90
      }
   ]
}
```

**Output :**
```javascript
{
  "totalTime": 425, // Total time from leaving home to returning home

  // Array of tasks
  "schedule": [
    {
      "id": 1, // id of the task
      "startsAt": 1508756400, // UNIX timestamp of the starting time
      "endsAt": 1508756400, // UNIX timestamp of the ending time
      "lat":48.8623348,
      "lng":2.3447356000000354,
    },
    // .. etc ..
  ]
}
```

## What I did

### POST /tsm/matrix/routeOptimizer
At first I used the Distance Matrix API from Google. Given a set of coordinates, it gives you back a matrix with the driving time between each points. From there, having a rather weak math background and not that much time in front of me I went for the [Nearest Neighbour](https://en.wikipedia.org/wiki/Nearest_neighbour_algorithm) approach.

### POST /tsm/directions/routeOptimizer
Then I came across another Google API: the Directions API. A tool which, according to Google, given directions returns an efficient path. And who am I to argue with Google? So I developed a second route using this API, which was much quicker to implement. To my surprise, even if the Directions API's results are sometimes (often?) more efficient than mine, the gap between the two ain't that bad.

## How to use it

- checkout the project
- you need Node.js installed
- ```npm install``` (or ```yarn install``` if you use [Yarn](https://www.npmjs.com/package/yarn))
- get an [API KEY](https://developers.google.com/maps/documentation/distance-matrix/get-api-key) for google map services (choose the Routes option)
- in the .env file, fill the API_KEY variable
- start the server : ```npm run server``` or ```yarn server```
- you can now call the first version with inputs like the ones described above: **127.0.0.1:8080/api/tsm/matrix/routeOptimizer**
- and of course the second one: **127.0.0.1:8080/api/tsm/directions/routeOptimizer**
