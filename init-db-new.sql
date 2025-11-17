-- New database schema for dynamic conditional forms

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sections table (for grouping questions)
CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  is_collapsible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_form_id (form_id),
  INDEX idx_order (form_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  text TEXT NOT NULL,
  type ENUM('radio', 'checkbox', 'text') NOT NULL,
  order_index INT NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  placeholder VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  INDEX idx_section_id (section_id),
  INDEX idx_order (section_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Options table (for radio and checkbox questions)
CREATE TABLE IF NOT EXISTS options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  text VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_order (question_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conditions table (for conditional logic)
CREATE TABLE IF NOT EXISTS conditions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,  -- The question to show/hide
  depends_on_option_id INT NOT NULL,  -- The option that must be selected
  condition_type ENUM('show_if_selected') DEFAULT 'show_if_selected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_option_id) REFERENCES options(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_depends_on (depends_on_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_form_id (form_id),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  option_id INT NULL,  -- NULL for text answers
  text_value TEXT NULL,  -- NULL for radio/checkbox answers
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
  INDEX idx_submission_id (submission_id),
  INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample form for testing
INSERT INTO forms (title, description) VALUES
('Breakfast Order Form', 'Tell us about your breakfast preferences');

INSERT INTO sections (form_id, title, order_index) VALUES
(1, 'Breakfast Selection', 0);

INSERT INTO questions (section_id, text, type, order_index, is_required) VALUES
(1, 'What would you like for breakfast?', 'checkbox', 0, true),
(1, 'How do you want your eggs?', 'text', 1, false),
(1, 'How do you want your bacon?', 'text', 2, false);

INSERT INTO options (question_id, text, value, order_index) VALUES
(1, 'Eggs', 'eggs', 0),
(1, 'Bacon', 'bacon', 1),
(1, 'Toast', 'toast', 2);

-- Conditional logic: Show egg question if eggs selected
INSERT INTO conditions (question_id, depends_on_option_id, condition_type) VALUES
(2, 1, 'show_if_selected'),
(3, 2, 'show_if_selected');
