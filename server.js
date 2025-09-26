const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./chat_app.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      is_anonymous BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      message TEXT NOT NULL,
      is_anonymous BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `;

  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(createMessagesTable, (err) => {
    if (err) {
      console.error('Error creating messages table:', err.message);
    } else {
      console.log('Messages table ready');
    }
  });
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('get_messages', () => {
    const query = `
      SELECT messages.*, users.username as user_name
      FROM messages 
      LEFT JOIN users ON messages.user_id = users.id 
      ORDER BY messages.created_at ASC
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching messages:', err.message);
        return;
      }
      socket.emit('previous_messages', rows);
    });
  });

  socket.on('send_message', (data) => {
    const { message, username, isAnonymous } = data;
    
    const insertMessage = `
      INSERT INTO messages (username, message, is_anonymous, created_at) 
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    const displayName = isAnonymous ? 'Anonymous' : username;
    
    db.run(insertMessage, [displayName, message, isAnonymous ? 1 : 0], function(err) {
      if (err) {
        console.error('Error inserting message:', err.message);
        return;
      }

      const messageData = {
        id: this.lastID,
        username: displayName,
        message: message,
        is_anonymous: isAnonymous,
        created_at: new Date().toISOString(),
        sender_id: socket.id
      };

      io.emit('new_message', messageData);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});