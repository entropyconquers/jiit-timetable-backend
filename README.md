# jiit-timetable-backend

This is the backend for the [jiit-timetable](
    <!-- Link to the frontend repo -->
    https://github.com/entropyconquers/jiit-timetable-frontend.git
) app.

The backend is written in Node.js and MongoDB Atlas is used as the database.

```javascript
"Available Routes": [
        {
            "route": "/timetable",
            "method": "GET",
            "params": ["batch", "year"],
            "description": "Get timetable for a batch and year",
            "example": "/timetable?batch=2018&year=1",
            "Auth": "No"
        },
        {
            "route": "/timetable",
            "method": "POST",
            "params": ["year"],
            "description": "Add timetable for all batches of a year",
            "example": "/timetable?year=1",
            "Auth": "Yes",
        }
    ]
```

## Setup

### Prerequisites

-   [Node.js](https://nodejs.org/en/download/)
-   [MongoDB](https://www.mongodb.com/download-center/community)

### Installation

-   Clone the repository
-   Install the dependencies

        npm install

-   Create a `.env` file in the root directory and add the following
    environment variables

        PORT=3000
        MONGO_URI

-   Run the server
    
            npm start



