const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Task 6 Helper: Check if the username is valid
const isValid = (username) => {
  if (username && username.trim().length >= 3) {
    return true;
  }
  return false;
};

// Check if a user with the given username already exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

// Authenticate user credentials
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

// Task 7: Log in as a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token containing the username in the payload
    let accessToken = jwt.sign(
      { data: username }, 
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username
    };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const reviewText = req.query.review; // Review passed as a query string parameter
  const username = req.user.data;      // Extracted from verified session JWT payload

  if (!reviewText) {
    return res.status(400).json({ message: "Review content cannot be empty" });
  }

  if (books[isbn]) {
    // Overwrites existing review for this user, or creates a new entry if it doesn't exist
    books[isbn].reviews[username] = reviewText;
    return res.status(200).json({ 
      message: `Review successfully added/updated for ISBN ${isbn}`, 
      reviews: books[isbn].reviews 
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.data; // Extracted from verified session JWT payload

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      // Filter out and delete only this specific user's review
      delete books[isbn].reviews[username];
      return res.status(200).json({ 
        message: `Review by user '${username}' for ISBN ${isbn} deleted successfully`, 
        reviews: books[isbn].reviews 
      });
    } else {
      return res.status(404).json({ message: "No review found for this user on this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.doesExist = doesExist;
