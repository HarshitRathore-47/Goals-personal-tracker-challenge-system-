# Goals-personal-tracker-challenge-system-

# Personal Health Tracker

A full-stack web application to help users monitor and improve their daily health habits by tracking key lifestyle metrics, joining challenges, and viewing progress visually.

---

## Features

- **User Authentication:** Secure registration and login with hashed passwords and session management.
- **Daily Health & Fitness Input:** Log sleep hours, water intake, screen time, gym time, meal count, servings of fruits & vegetables, and steps walked.
- **Healthy Score Calculation:** Calculates a daily holistic health score (0-100) based on input metrics.
- **Challenges:** Join health challenges like hydration and mindfulness, unlocking achievement badges.
- **Interactive Calendar:** Visual calendar sidebar showing daily scores for the current month.
- **Score History Chart:** Line chart visualizing health score trends over time with color-coded points.
- **Achievements:** Earn and display badges for completed challenges.
- **Responsive UI:** Clean and accessible design using Tailwind CSS, works across devices.

---

## Tech Stack

- **Backend:** Node.js, Express.js — RESTful API and session-based authentication.
- **Database:** MongoDB with Mongoose ORM for storing user and tracker data.
- **Frontend:** HTML, CSS (TailwindCSS), and vanilla JavaScript.
- **Visualization:** Chart.js for rendering score history graphs.
- **Security:** bcrypt for password hashing, express-session for user session management.
- **Validation:** express-validator for server-side input validation.

---

## Setup Instructions

### Prerequisites

- Node.js (v14 or newer recommended)
- npm (comes with Node.js)
- MongoDB Atlas account or local MongoDB server


How others install dependencies
When someone clones your repo:

They get the package.json and package-lock.json files.
They run:
 copy
bash

npm install
This automatically downloads and installs all the required dependencies to node_modules.
How to ensure node_modules is excluded
Add node_modules to your .gitignore file (usually already present in most Node.js projects):

 copy
javascript

node_modules/
This prevents accidentally committing node_modules to your Git repository.

Summary for README install instructions
In your README, instruct users to:

 copy
bash

npm install
to install all dependencies based on the manifest files.

If you want, I can help generate .gitignore and README instructions to reflect this best practice!

Using the Application
Open your browser and go to http://localhost:3000.
Register a new account or log in with an existing user.
Access the dashboard to input daily health metrics.
View your daily scores, join challenges, earn badges, and track progress over time.


/models
  - userSchema.js       # User Mongoose schema
  - Tracker.js          # Tracker Mongoose schema
/routes
  - Users.js            # User authentication routes
  - TrackerRoute.js     # Tracker data submission and retrieval routes
/public
  - dashboard.html      # Authenticated user dashboard UI
  - login.html          # Login and registration UI
  - script.js           # Frontend JavaScript logic for dashboard
  - style.css           # Custom CSS styles
server.js               # Express server setup

License
This project is licensed under the MIT License.

Author
Harshit Rathore

Feel free to contribute or raise issues for bugs and feature requests.
Thank you for checking out the Personal Health Tracker!
