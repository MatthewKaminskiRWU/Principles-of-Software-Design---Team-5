# Principles of Software Design
## Running with Docker

You can spin up the entire project (Database, Backend, and Frontend) using Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps
1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/MatthewKaminskiRWU/Principles-of-Software-Design---Team-5
   cd Principles-of-Software-Design---Team-5
   ```

2. **Run Docker Compose**:
   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - First find the IP of your network.
   - **Main Application**: `http://<YOUR-IP>:3000` (e.g., `http://10.50.1.20:3000`)
   - **Backend API**: `http://<YOUR-IP>:3000/api/` (Proxied internally)

By using the Docker setup, the application is automatically configured to work on the school's WAN. There is no need to hardcode IP addresses; simply share your computer's IP address with students and teachers, and they can access the scheduler on port 3000.

## Todo
**Frontend**
- [X] Finalize UI for course blocks
    - make sure course blocks are how we want them
    - add additional class times if needed
    - sort out the numbering
- [X] Use Fetch to point to the backend URL
    - (this will have to be done after the backend is complete)
    
**Backend**

- [x] Get boilderplate for backend using FastAPI (Mike will do this)
- [x] Create MariaDB database to store classes
    - seed.sql (generate dummy data)
    - create .env variables
    - schema.sql
- [x] Create docker compose to create database with dummy data
    - allow teammates to spin up their own database
- [x] Connect database to FastAPI

**Endpoints**

- [x] GET / boilerplate
- [x] GET /users/ -- get all the registered users
- [x] GET /users/{user_id} -- get one specific user
- [x] POST /users/ -- create a new user
- [x] POST /events/ -- create an event & link time slots
- [x] GET /events/{hash} -- get event & slot IDs by hash
- [x] POST /availability/ -- submit student availability
- [x] GET /events/{hash}/results -- display who is available when (for the teacher)
- [ ] Prevent CORS errors (good luck 😬)
<details>
  <summary>Database Schema</summary>

  ![Database Schema](./DB_Schema.png)

<p align="center">
  <a href="https://www.drawdb.app/editor?shareId=9a9cf9c3fe9ec6f7aa50fd5b8e62f81f">
    <code>View diagram source</code>
  </a>
</p>

</details>
