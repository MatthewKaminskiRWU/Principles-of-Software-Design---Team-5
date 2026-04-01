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
-- Note: Many slots represent multiple days (e.g. MWF), 
-- but we store the primary day here for DB consistency.
INSERT INTO timeSlots (id, dayOfWeek, startTime, endTime, slotType) VALUES
-- MWF 50 min slots
(1, 'Monday', '08:00:00', '08:50:00', '50_min'),
(2, 'Monday', '09:00:00', '09:50:00', '50_min'),
(3, 'Monday', '10:00:00', '10:50:00', '50_min'),
(4, 'Monday', '11:00:00', '11:50:00', '50_min'),
(5, 'Monday', '12:00:00', '12:50:00', '50_min'),
(6, 'Monday', '13:00:00', '13:50:00', '50_min'),
-- MWTh 80 min slots
(7, 'Monday', '14:00:00', '15:20:00', '80_min'),
(8, 'Monday', '15:30:00', '16:50:00', '80_min'),
(9, 'Monday', '17:00:00', '18:20:00', '80_min'),
-- TTh 80 min slots
(21, 'Tuesday', '08:00:00', '09:20:00', '80_min'),
(22, 'Tuesday', '09:30:00', '10:50:00', '80_min'),
(23, 'Tuesday', '11:00:00', '12:20:00', '80_min'),
(24, 'Tuesday', '12:30:00', '13:50:00', '80_min'),
-- TF 80 min slots
(25, 'Tuesday', '14:00:00', '15:20:00', '80_min'),
(26, 'Tuesday', '15:30:00', '16:50:00', '80_min'),
(27, 'Tuesday', '17:00:00', '18:20:00', '80_min'),
-- Evening courses (170 min)
(12, 'Monday', '18:30:00', '21:30:00', '170_min'),
(120, 'Monday', '18:30:00', '21:30:00', '170_min'),
(13, 'Tuesday', '18:30:00', '21:30:00', '170_min'),
(130, 'Tuesday', '18:30:00', '21:30:00', '170_min'),
(14, 'Wednesday', '18:30:00', '21:30:00', '170_min'),
(140, 'Wednesday', '18:30:00', '21:30:00', '170_min'),
(15, 'Thursday', '18:30:00', '21:30:00', '170_min'),
(150, 'Thursday', '18:30:00', '21:30:00', '170_min');

-- 2. Create a Professor's Event (initial dummy event)
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
