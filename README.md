# Principles of Software Design
## Todo
**Frontend**
- [ ] Finalize UI for course blocks
    - make sure course blocks are how we want them
    - add additional class times if needed
    - sort out the numbering
- [ ] Use Fetch to point to the backend URL
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
- [ ] Create GET /courses and POST /courses endpoints
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
