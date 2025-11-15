-- Database initialization script for Questionnaire Builder
-- This script is automatically run when MariaDB container starts

-- Create questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  questionnaire_id INT NOT NULL,
  text TEXT NOT NULL,
  type ENUM('single', 'multiple') DEFAULT 'single',
  order_index INT NOT NULL,
  parent_option_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
  INDEX idx_questionnaire_id (questionnaire_id),
  INDEX idx_parent_option_id (parent_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create options table
CREATE TABLE IF NOT EXISTS options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  text VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  next_question_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_next_question_id (next_question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  questionnaire_id INT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  question_id INT NOT NULL,
  option_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_questionnaire_id (questionnaire_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample questionnaire (optional - comment out if not needed)
INSERT INTO questionnaires (title, description) VALUES
('Sample Questionnaire', 'This is a sample questionnaire to test the system');

INSERT INTO questions (questionnaire_id, text, type, order_index) VALUES
(1, 'What is your favorite color?', 'single', 0);

INSERT INTO options (question_id, text, order_index) VALUES
(1, 'Red', 0),
(1, 'Blue', 1),
(1, 'Green', 2);
