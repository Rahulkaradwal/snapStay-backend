# Node.js RESTful API for SnapStay

Welcome to the Node.js RESTful API project! This API is designed to handle user authentication, profile management, and more. It is built using Node.js with Express, MongoDB, JSON Web Tokens for authentication, and integrates several third-party services including AWS S3 for file storage, Nodemailer for email handling, OAuth2 for secure access, and Stripe for payment processing.

## Table of Contents
- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction
This API is designed for managing user data with secure authentication and various user operations. It supports file uploads, email notifications, OAuth2 integration, and payment handling via Stripe. For a detailed overview of the API endpoints, refer to the [Postman Documentation](https://documenter.getpostman.com/view/28355899/2sA3XQh2Cb).

## Technologies Used
- **Node.js**: JavaScript runtime environment used for building server-side applications.
- **Express**: Web application framework for Node.js, used for building RESTful APIs.
- **MongoDB**: NoSQL database used for storing user data.
- **JSON Web Token (JWT)**: Used for secure user authentication.
- **AWS S3**: Amazon Web Services S3 for file storage.
- **Multer**: Middleware for handling `multipart/form-data`, used for file uploads.
- **Nodemailer**: Module for sending emails.
- **OAuth2**: Used for secure user authentication with third-party services.
- **Stripe**: Payment processing service.

## Getting Started
To get started with this API, follow the instructions below to set up your environment and start using the endpoints.

### Prerequisites
- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **MongoDB** (for data storage)
- **AWS S3 account** (for file storage)
- **Stripe account** (for payment processing)

### Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/Rahulkaradwal/snapStay-backend
    cd snapStay-backend
    ```

2. **Install the dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Create a `.env` file in the root directory with the following example contents:
    ```
    PORT=3000
    USERNAME=mongodb database username
    DATABSE_PASSWORD=mongodb database password
    PORT=3000
    DATABASE=mongodb+srv://rahulkaradwal:<PASSWORD>@snapstay.u7mmacv.mongodb.net/?retryWrites=true&w=majority&appName=snapStay
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=1h
    
    OAUTH_CLIENT_ID= your oAuth Clinet key
    OAUTH_CLIENT_SECRET =your oAuth Client secrety key
    OAUTH_REDIRECT_URL=your oAuth Client Redirect url
    OAUTH_REFRESH_TOKEN= oAuth Refresh Token
    
    STRIPE_PUBLISH_KEY=stripe public key
    STRIPE_SECRET_KEY= stripe secret key  
        
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    S3_BUCKET_NAME=your_s3_bucket_name
    
    ```

4. **Start the server:**
    ```bash
    npm start
    ```

## API Endpoints
The following is a brief overview of the available API endpoints. For detailed information, refer to the [Postman Documentation](https://documenter.getpostman.com/view/28355899/2sA3XQh2Cb).

### Authentication
- **POST /auth/signup**: Register a new user.
- **POST /auth/login**: Log in a user and receive a JWT token.

### User Management
- **GET /users/me**: Retrieve the logged-in user's profile.
- **PATCH /users/updateMe**: Update the logged-in user's profile.
- **DELETE /users/deleteMe**: Deactivate the logged-in user's account.
- 
- **GET /cabins/**: Get cabins.
- **GET /get-my-bookings**: Get booked cabin.
- 
- **POST /users/forgetPassword/:id** Get the email link to reset the password.
- **POST /users/resetPassword**: Update the password with email link.
- **POST /usres/updatePassword**: Update the password, when currently logged in.

### Admin Operations
- **GET /users**: Retrieve a list of all users (Admin only).
- **PATCH /users/:id**: Update a user's profile by ID (Admin only).
- **DELETE /users/:id**: Delete a user by ID (Admin only).
- **ADD /cabins/**: Add cabins (Admin only).
- **DELETE /cabins/:id**: Delete cabin by ID (Admin Only).
- **PATCH /cabins/:id**: Update cabin by ID (Admin Only).
- **GET /bookings/get-all-bookings**: Get all the bookings (Admin Only).


## Usage
To use the API, you can use any HTTP client such as Postman or cURL. Below are examples of how to call the endpoints.

### Example: Fetching User Profile
Using cURL:
```bash
curl -X GET "http://localhost:3000/users/me" -H "Authorization: Bearer <your_token>"
```

### Example: Updating User Profile
Using cURL:
```bash
curl -X PATCH "http://localhost:3000/users/updateMe" -H "Authorization: Bearer <your_token>" -d '{"name":"New Name"}' -H "Content-Type: application/json"
```

### Example: Uploading a File
Using cURL:
```bash
curl -X POST "http://localhost:3000/users/upload" -H "Authorization: Bearer <your_token>" -F "file=@/path/to/your/file.jpg"
```

## Testing
Unit tests are provided to ensure the API works as expected. To run the tests, use the following command:
```bash
npm test
```

Ensure you have the necessary testing framework (e.g., Jest or Mocha) set up in your `package.json`.

## Contributing
Contributions are welcome! To contribute, follow these steps:
1. **Fork the repository:**
    ```bash
    git clone https://github.com/yourusername/yourrepository.git
    cd yourrepository
    ```

2. **Create a new branch:**
    ```bash
    git checkout -b feature/your-feature
    ```

3. **Make your changes.**

4. **Commit your changes:**
    ```bash
    git commit -m 'Add your feature'
    ```

5. **Push to the branch:**
    ```bash
    git push origin feature/your-feature
    ```

6. **Open a pull request.**

Please make sure to update tests as appropriate and follow the code style guidelines.

---

This project is still under development, and this is the part of https://github.com/Rahulkaradwal/snapstay project.
