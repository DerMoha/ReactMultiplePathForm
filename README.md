# Questionnaire Builder with Multiple Paths

A full-stack web application for creating and taking questionnaires with branching logic and multiple paths. Built with React, Node.js/Express, and MariaDB.

## Features

- **Questionnaire Builder**: Create questionnaires with multiple questions
- **Multiple Question Types**: Support for single-choice and multiple-choice questions
- **Branching Logic**: Questions can follow different paths based on user selections
- **Sequential Paths**: Multiple selections trigger sequential navigation through different paths
- **Response Tracking**: Store user responses in the database
- **Modern UI**: Clean and responsive user interface

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MySQL2 for MariaDB connection
- CORS for cross-origin requests

### Database
- MariaDB

## Project Structure

```
ReactMultiplePathForm/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page with questionnaire list
│   │   │   ├── Builder.js        # Questionnaire builder
│   │   │   └── Viewer.js         # Questionnaire viewer/taker
│   │   ├── services/
│   │   │   └── api.js            # API service
│   │   ├── utils/
│   │   │   └── generateId.js     # ID generation utility
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # Database connection
│   │   │   └── initDb.js         # Database initialization script
│   │   ├── controllers/
│   │   │   ├── questionnaireController.js
│   │   │   └── responseController.js
│   │   ├── models/
│   │   │   ├── questionnaireModel.js
│   │   │   ├── questionModel.js
│   │   │   ├── optionModel.js
│   │   │   └── responseModel.js
│   │   ├── routes/
│   │   │   ├── questionnaireRoutes.js
│   │   │   └── responseRoutes.js
│   │   └── index.js              # Server entry point
│   ├── .env
│   └── package.json
└── README.md
```

## Database Schema

### Tables

1. **questionnaires**
   - id (PRIMARY KEY)
   - title
   - description
   - created_at
   - updated_at

2. **questions**
   - id (PRIMARY KEY)
   - questionnaire_id (FOREIGN KEY)
   - text
   - type (single/multiple)
   - order_index
   - parent_option_id
   - created_at

3. **options**
   - id (PRIMARY KEY)
   - question_id (FOREIGN KEY)
   - text
   - order_index
   - next_question_id
   - created_at

4. **responses**
   - id (PRIMARY KEY)
   - questionnaire_id (FOREIGN KEY)
   - session_id
   - question_id (FOREIGN KEY)
   - option_id (FOREIGN KEY)
   - created_at

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MariaDB (v10.5 or higher)
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ReactMultiplePathForm
```

### Step 2: Set Up MariaDB

1. Install MariaDB if not already installed:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install mariadb-server

   # macOS (using Homebrew)
   brew install mariadb

   # Windows
   # Download from https://mariadb.org/download/
   ```

2. Start MariaDB service:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mariadb

   # macOS
   brew services start mariadb

   # Windows
   # Use MariaDB service from Services panel
   ```

3. Secure your installation (optional but recommended):
   ```bash
   sudo mysql_secure_installation
   ```

### Step 3: Configure Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Edit `server/.env` file with your MariaDB credentials:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=questionnaire_db
     DB_PORT=3306
     ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```
   This will create the database and all required tables.

### Step 4: Configure Frontend

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The frontend is already configured to use the backend API (via proxy in package.json)

## Running the Application

### Option 1: Run Backend and Frontend Separately

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   The server will run on http://localhost:5000

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```
   The app will open in your browser at http://localhost:3000

### Option 2: Use a Process Manager

You can use `concurrently` or `pm2` to run both servers together.

## Usage

### Creating a Questionnaire

1. Click "Create New Questionnaire" on the home page
2. Enter a title and description
3. Add questions:
   - Click "Add Question"
   - Enter question text
   - Select question type (Single Choice or Multiple Choice)
   - Add options for the question
4. Click "Save" to save your questionnaire

### Taking a Questionnaire

1. From the home page, click "Take Quiz" on any questionnaire
2. Read and answer each question
3. For single-choice questions, select one option
4. For multiple-choice questions, you can select multiple options
5. Click "Next" to proceed
6. Complete all questions to finish

### Path Logic

- **Single Choice**: Selecting an option moves you to the next question in sequence
- **Multiple Choice**: Selecting multiple options creates a queue of paths to explore sequentially

## API Endpoints

### Questionnaires

- `GET /api/questionnaires` - Get all questionnaires
- `GET /api/questionnaires/:id` - Get questionnaire by ID with questions
- `POST /api/questionnaires` - Create new questionnaire
- `PUT /api/questionnaires/:id` - Update questionnaire
- `DELETE /api/questionnaires/:id` - Delete questionnaire
- `POST /api/questionnaires/save-complete` - Save complete questionnaire with questions

### Responses

- `POST /api/responses` - Save a response
- `GET /api/responses/session/:sessionId` - Get responses by session
- `DELETE /api/responses/session/:sessionId` - Delete session responses

## Development

### Backend Development

```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development

```bash
cd client
npm start  # Runs with hot reload
```

## Troubleshooting

### Database Connection Issues

1. Verify MariaDB is running:
   ```bash
   sudo systemctl status mariadb
   ```

2. Test connection:
   ```bash
   mysql -u root -p
   ```

3. Check credentials in `server/.env`

### Port Already in Use

If port 5000 or 3000 is already in use:
- Change `PORT` in `server/.env`
- Update `REACT_APP_API_URL` in `client/.env`

### Dependencies Issues

Clear node_modules and reinstall:
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] Advanced branching logic with conditions
- [ ] Question templates
- [ ] Export questionnaire results to CSV/Excel
- [ ] User authentication and authorization
- [ ] Share questionnaires via unique links
- [ ] Analytics dashboard
- [ ] Conditional logic based on previous answers
- [ ] Question validation and required fields
- [ ] Multi-language support

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
