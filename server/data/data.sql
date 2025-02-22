DROP TABLE IF EXISTS UserTable CASCADE;
DROP TABLE IF EXISTS CharacterTable CASCADE;
DROP TABLE IF EXISTS CharacterImages CASCADE;
DROP TABLE IF EXISTS ConversationTable CASCADE;

CREATE TABLE UserTable (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    profile_pic VARCHAR(500) DEFAULT NULL,
    background_image VARCHAR(500) DEFAULT NULL
);

CREATE TABLE CharacterTable (
    character_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES UserTable(user_id),
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    personality_traits TEXT,
    background_story TEXT,
    age_range VARCHAR(50),
    occupation VARCHAR(255),
    skills TEXT,
    hobbies TEXT,
    physical_characteristics TEXT,
    relationship_dynamics TEXT,
    personal_goals TEXT,
    strengths_weaknesses TEXT,
    profile_pic VARCHAR(500) DEFAULT NULL
);

CREATE TABLE CharacterImages (
    image_id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES CharacterTable(character_id),
    image_url TEXT,
    description TEXT
);

CREATE TABLE ConversationTable (
    conversation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES UserTable(user_id),
    character_id INTEGER REFERENCES CharacterTable(character_id),
    message TEXT NOT NULL,
    sender VARCHAR(50) NOT NULL,  
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO UserTable (name, email, phone_number) VALUES('Kush Ahir','ka8540@g.rit.edu','+15859575220') 