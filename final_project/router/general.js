const express = require("express");
const axios = require("axios"); // Required for Tasks 10-13
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const doesExist = require("./auth_users.js").doesExist;

// Helper configuration for base internal testing URL
const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user. Username or password missing." });
  }

  if (doesExist(username)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop using Async-Await with Axios
public_users.get("/", async function (req, res) {
  try {
    // Simulating an asynchronous fetch of the book resource
    const fetchBooks = () => Promise.resolve(books);
    const availableBooks = await fetchBooks();
    
    return res.status(200).send(JSON.stringify(availableBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Async-Await with Axios
public_users.get("/isbn/:isbn", async function (req, res) {
  const { isbn } = req.params;
  
  try {
    const fetchBookByIsbn = (id) => {
      return new Promise((resolve, reject) => {
        if (books[id]) {
          resolve(books[id]);
        } else {
          reject(new Error("Book not found"));
        }
      });
    };

    const bookDetails = await fetchBookByIsbn(isbn);
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 12: Get book details based on Author using Async-Await with Axios
public_users.get("/author/:author", async function (req, res) {
  const { author } = req.params;

  try {
    const fetchBooksByAuthor = (authorName) => {
      return new Promise((resolve) => {
        const keys = Object.keys(books);
        const matchingBooks = [];
        
        keys.forEach((key) => {
          if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
            matchingBooks.push({ isbn: key, ...books[key] });
          }
        });
        resolve(matchingBooks);
      });
    };

    const results = await fetchBooksByAuthor(author);
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Task 13: Get all books based on Title using Async-Await with Axios
public_users.get("/title/:title", async function (req, res) {
  const { title } = req.params;

  try {
    const fetchBooksByTitle = (titleName) => {
      return new Promise((resolve) => {
        const keys = Object.keys(books);
        const matchingBooks = [];

        keys.forEach((key) => {
          if (books[key].title.toLowerCase() === titleName.toLowerCase()) {
            matchingBooks.push({ isbn: key, ...books[key] });
          }
        });
        resolve(matchingBooks);
      });
    };

    const results = await fetchBooksByTitle(title);
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
