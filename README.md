# 💧 Water Tracker API

Water Tracker API is a RESTful API that helps users track their daily water intake, set hydration goals, and monitor progress over time.

## 🚀 Features

- User authentication (signup, login, logout, refresh token)
- Track daily water intake
- View daily and monthly hydration statistics
- Update user profile (including avatar and daily goal)
- Secure authentication with JWT tokens

## 📌 API Endpoints

| Method   | Endpoint             | Description                       | Auth Required |
| -------- | -------------------- | --------------------------------- | ------------- |
| `POST`   | `/auth/signup`       | Register a new user               | ❌            |
| `POST`   | `/auth/signin`       | Sign in a user                    | ❌            |
| `POST`   | `/auth/refresh`      | Refresh access token              | ✅            |
| `POST`   | `/auth/logout`       | Log out a user                    | ✅            |
| `GET`    | `/users`             | Get user profile data             | ✅            |
| `PATCH`  | `/users`             | Update user profile (name, email) | ✅            |
| `PATCH`  | `/users/avatar`      | Update user's avatar              | ✅            |
| `PATCH`  | `/water/daily-goal`  | Update user's daily water goal    | ✅            |
| `GET`    | `/water/day`         | Get daily water intake stats      | ✅            |
| `GET`    | `/water/month/:date` | Get monthly water stats           | ✅            |
| `DELETE` | `/water/entry:id`    | Delete a water intake record      | ✅            |
| `POST`   | `/water/entry`       | Add a water intake record         | ✅            |
| `PATCH`  | `/water/entry/:id`   | Add a water intake record         | ✅            |

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/yourusername/water-tracker-api.git
cd water-tracker-api
```

2️⃣ Install Dependencies
npm install

3️⃣ Set Up Environment Variables
Create a .env file in the root folder and add: 
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

4️⃣ Start the Server
npm run dev
The API will be running at http://localhost:3000/

🔐 Authentication
Users receive an access token and a refresh token upon login.
The access token is used for authenticated requests.
If the access token expires, use the /auth/refresh endpoint to obtain a new one.
📤 Example Request - Add Water Intake
sh
curl -X POST http://localhost:3000/water \
 -H "Authorization: Bearer your_access_token" \
 -H "Content-Type: application/json" \
 -d '{
"amount": 500,
"time": "14:30"
}'

🖼️ Example Request - Update Avatar
curl -X PATCH http://localhost:3000/users/avatar \
 -H "Authorization: Bearer your_access_token" \
 -F "avatar=@/path/to/avatar.jpg"

## Dependencies

This project uses the following dependencies:

- **bcrypt**: For hashing and comparing passwords.
- **cloudinary**: For managing and storing images in the cloud.
- **cookie-parser**: Middleware for parsing cookies.
- **cors**: Enables Cross-Origin Resource Sharing (CORS).
- **dotenv**: Loads environment variables from a `.env` file.
- **express**: Web framework for Node.js.
- **handlebars**: Template engine for rendering views.
- **http-errors**: Creates HTTP error responses.
- **joi**: Schema validation for request data.
- **jsonwebtoken**: For handling authentication tokens.
- **mongoose**: MongoDB object modeling tool.
- **multer**: Middleware for handling file uploads.
- **pino-http**: HTTP request logging.
- **swagger-ui-express**: Integrates Swagger for API documentation.

## Dev Dependencies

- **@eslint/js**: ESLint configuration for JavaScript.
- **@redocly/cli**: Tool for API documentation.
- **eslint**: Linter for enforcing code quality.
- **globals**: Provides a list of global variables.
- **nodemon**: Automatically restarts the server on code changes.
- **pino-pretty**: Formats logs in a readable format.

## Swagger docs

https://watertrackerbackend-5ymk.onrender.com/api-docs/

## Deployment

This project is deployed on **Render**. You can access the live API at:

https://watertrackerbackend-5ymk.onrender.com

Make sure to update the URL with your actual Render deployment link.
