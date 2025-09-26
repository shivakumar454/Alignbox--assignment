Chat Application

Features

Real-time messaging using Socket.IO

Anonymous or custom username support

Displays timestamps and sender avatars

Stores messages in an SQLite database (chat_app.db)

Prerequisites

Make sure you have Node.js and npm installed on your machine.

Check installation:

node -v
npm -v


Installation

Clone the repository:

git clone https://github.com/shivakumar454/chat-app.git


Navigate to the project directory:

cd chat-app


Install dependencies:

npm install

Running the Application

Start the server:

node server.js


The server will run on port 3000 by default.

Open your browser and navigate to:

http://localhost:3000


Choose to join as Anonymous or enter a Username to start chatting.

Notes

Make sure the chat_app.db file is in the root directory.

To reset messages, you can delete the chat_app.db file; it will be recreated when the server starts.
