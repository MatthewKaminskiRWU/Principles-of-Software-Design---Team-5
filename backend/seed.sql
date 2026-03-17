-- ==========================================
-- Table Creations & Constraints
-- ==========================================

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hash VARCHAR(64) NOT NULL UNIQUE,
    classTitle VARCHAR(255),
    professor VARCHAR(255),
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index the hash column 
CREATE INDEX idx_events_hash ON events(hash);

CREATE TABLE timeSlots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    -- MAY NEED TO CHANGE IN FUTURE
    slotType ENUM('50_min', '80_min', '170_min') NOT NULL
);

CREATE TABLE eventSlots (
    eventId INT NOT NULL,
    slotId INT NOT NULL,
    PRIMARY KEY (eventId, slotId),
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (slotId) REFERENCES timeSlots(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255), 
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE availability (
    userId INT NOT NULL,
    slotId INT NOT NULL,
    status ENUM('available', 'preferred', 'unavailable') NOT NULL,
    PRIMARY KEY (userId, slotId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (slotId) REFERENCES timeSlots(id) ON DELETE CASCADE
);

-- ==========================================
-- Dummy Data Insertion
-- ==========================================

-- 1. Create a Master List of Time Slots
INSERT INTO timeSlots (id, dayOfWeek, startTime, endTime, slotType) VALUES
(1, 'Monday', '09:00:00', '09:50:00', '50_min'),
(7, 'Tuesday', '10:00:00', '11:20:00', '80_min'),
(25, 'Wednesday', '18:00:00', '20:50:00', '170_min');

-- 2. Create a Professor's Event (rn its hardcoded to match the'abc123xyz' hash from JSON)
INSERT INTO events (id, hash, classTitle, professor) VALUES
(1, 'abc123xyz', 'SEC220: Intro to Databases', 'Dr. White');

-- 3. Link the Event to Specific Allowed Time Slots
INSERT INTO eventSlots (eventId, slotId) VALUES
(1, 1),
(1, 7),
(1, 25);

-- 4. Create a User (Student submitting availability)
INSERT INTO users (id, eventId, name, email) VALUES
(1, 1, 'Jane Doe', 'jdoe@g.rwu.edu');

-- 5. Insert the User's Availability Choices
INSERT INTO availability (userId, slotId, status) VALUES
(1, 1, 'available'),
(1, 7, 'available'),
(1, 25, 'preferred');
