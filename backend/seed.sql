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
-- Every individual day/time combo is its own row.
INSERT INTO timeSlots (id, dayOfWeek, startTime, endTime, slotType) VALUES
-- 50-min slots (MWF)
(1, 'Monday', '08:00:00', '08:50:00', '50_min'),
(2, 'Wednesday', '08:00:00', '08:50:00', '50_min'),
(3, 'Friday', '08:00:00', '08:50:00', '50_min'),
(4, 'Monday', '09:00:00', '09:50:00', '50_min'),
(5, 'Wednesday', '09:00:00', '09:50:00', '50_min'),
(6, 'Friday', '09:00:00', '09:50:00', '50_min'),
(7, 'Monday', '10:00:00', '10:50:00', '50_min'),
(8, 'Wednesday', '10:00:00', '10:50:00', '50_min'),
(9, 'Friday', '10:00:00', '10:50:00', '50_min'),
(10, 'Monday', '11:00:00', '11:50:00', '50_min'),
(11, 'Wednesday', '11:00:00', '11:50:00', '50_min'),
(12, 'Friday', '11:00:00', '11:50:00', '50_min'),
(13, 'Monday', '12:00:00', '12:50:00', '50_min'),
(14, 'Wednesday', '12:00:00', '12:50:00', '50_min'),
(15, 'Friday', '12:00:00', '12:50:00', '50_min'),
(16, 'Monday', '13:00:00', '13:50:00', '50_min'),
(17, 'Wednesday', '13:00:00', '13:50:00', '50_min'),
(18, 'Friday', '13:00:00', '13:50:00', '50_min'),

-- 80-min slots (T/Th)
(21, 'Tuesday', '08:00:00', '09:20:00', '80_min'),
(22, 'Thursday', '08:00:00', '09:20:00', '80_min'),
(23, 'Tuesday', '09:30:00', '10:50:00', '80_min'),
(24, 'Thursday', '09:30:00', '10:50:00', '80_min'),
(25, 'Tuesday', '11:00:00', '12:20:00', '80_min'),
(26, 'Thursday', '11:00:00', '12:20:00', '80_min'),
(27, 'Tuesday', '12:30:00', '13:50:00', '80_min'),
(28, 'Thursday', '12:30:00', '13:50:00', '80_min'),

-- 80-min slots (MWTh)
(31, 'Monday', '14:00:00', '15:20:00', '80_min'),
(32, 'Wednesday', '14:00:00', '15:20:00', '80_min'),
(33, 'Thursday', '14:00:00', '15:20:00', '80_min'),
(34, 'Monday', '15:30:00', '16:50:00', '80_min'),
(35, 'Wednesday', '15:30:00', '16:50:00', '80_min'),
(36, 'Thursday', '15:30:00', '16:50:00', '80_min'),
(37, 'Monday', '17:00:00', '18:20:00', '80_min'),
(38, 'Wednesday', '17:00:00', '18:20:00', '80_min'),
(39, 'Thursday', '17:00:00', '18:20:00', '80_min'),

-- 80-min slots (TF)
(41, 'Tuesday', '14:00:00', '15:20:00', '80_min'),
(42, 'Friday', '14:00:00', '15:20:00', '80_min'),
(43, 'Tuesday', '15:30:00', '16:50:00', '80_min'),
(44, 'Friday', '15:30:00', '16:50:00', '80_min'),
(45, 'Tuesday', '17:00:00', '18:20:00', '80_min'),
(46, 'Friday', '17:00:00', '18:20:00', '80_min'),

-- Evening slots (170 min) - BR1
(51, 'Monday', '18:30:00', '21:30:00', '170_min'),
(52, 'Tuesday', '18:30:00', '21:30:00', '170_min'),
(53, 'Wednesday', '18:30:00', '21:30:00', '170_min'),
(54, 'Thursday', '18:30:00', '21:30:00', '170_min'),

-- Evening slots (170 min) - PVD
(61, 'Monday', '18:30:00', '21:30:00', '170_min'),
(62, 'Tuesday', '18:30:00', '21:30:00', '170_min'),
(63, 'Wednesday', '18:30:00', '21:30:00', '170_min'),
(64, 'Thursday', '18:30:00', '21:30:00', '170_min');

-- 2. Create a Professor's Event (initial dummy event)
INSERT INTO events (id, hash, classTitle, professor) VALUES
(1, 'abc123xyz', 'SEC220: Intro to Databases', 'Dr. White');

-- 3. Link the Event to Specific Allowed Time Slots
-- Picking a few individual slots
INSERT INTO eventSlots (eventId, slotId) VALUES
(1, 1), (1, 2), (1, 3),   -- M/W/F 8:00
(1, 31), (1, 32), (1, 33); -- M/W/Th 2:00

-- 4. Create a User (Student submitting availability)
INSERT INTO users (id, eventId, name, email) VALUES
(1, 1, 'Jane Doe', 'jdoe@g.rwu.edu');

-- 5. Insert the User's Availability Choices
INSERT INTO availability (userId, slotId, status) VALUES
(1, 1, 'available'),
(1, 2, 'available'),
(1, 3, 'preferred'),
(1, 31, 'available'),
(1, 32, 'unavailable'),
(1, 33, 'preferred');
