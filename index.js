const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize the SQLite database
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', (req, res) => {
  const { username, password, email, first_name, last_name, phone_number, address, city, state, zip_code, country } = req.body;
  const query = `INSERT INTO users (username, password, email, first_name, last_name, phone_number, address, city, state, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [username, password, email, first_name, last_name, phone_number, address, city, state, zip_code, country], function(err) {
    if (err) {
      res.status(500).send('Error occurred while registering the user');
    } else {
      res.send(`User created with ID: ${this.lastID}`);
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error occurred during login');
    } else {
      if (row) {
        res.send(`Welcome ${row.username}!`);
      } else {
        res.status(400).send('Invalid username or password');
      }
    }
  });
});

app.get('/user/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send('Error occurred while fetching user data');
    } else {
      if (row) {
        res.json(row);
      } else {
        res.status(404).send('User not found');
      }
    }
  });
});

app.put('/user/:id', (req, res) => {
  const id = req.params.id;
  const { username, password, email, first_name, last_name, phone_number, address, city, state, zip_code, country } = req.body;
  const query = `UPDATE users SET username = ?, password = ?, email = ?, first_name = ?, last_name = ?, phone_number = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, [username, password, email, first_name, last_name, phone_number, address, city, state, zip_code, country, id], function(err) {
    if (err) {
      res.status(500).send('Error occurred while updating user data');
    } else {
      if (this.changes > 0) {
        res.send('User updated successfully');
      } else {
        res.status(404).send('User not found');
      }
    }
  });
});

app.delete('/user/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).send('Error occurred while deleting user');
    } else {
      if (this.changes > 0) {
        res.send('User deleted successfully');
      } else {
        res.status(404).send('User not found');
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});