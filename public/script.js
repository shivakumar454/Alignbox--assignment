const socket = io("http://localhost:3000");


const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const modalOverlay = document.getElementById('modalOverlay');
const usernameInput = document.getElementById('usernameInput');
const anonymousBtn = document.getElementById('anonymousBtn');
const setUsernameBtn = document.getElementById('setUsernameBtn');
const anonymousStatus = document.getElementById('anonymousStatus');

let currentUser = {
    username: '',
    isAnonymous: true,
    socketId: ''
};

window.addEventListener('load', () => {
    modalOverlay.style.display = 'flex';
});

anonymousBtn.addEventListener('click', () => {
    currentUser.isAnonymous = true;
    currentUser.username = 'Anonymous';
    modalOverlay.style.display = 'none';
    anonymousStatus.classList.add('show');
    connectToChat();
});

setUsernameBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser.isAnonymous = false;
        currentUser.username = username;
        modalOverlay.style.display = 'none';
        anonymousStatus.classList.remove('show');
        connectToChat();
    } else {
        alert('Please enter a username');
    }
});

function connectToChat() {
    currentUser.socketId = socket.id;
    
    socket.emit('get_messages');
    
    console.log('Connected to chat as:', currentUser.username);
}

socket.on('previous_messages', (messages) => {
    messagesContainer.innerHTML = '';
    messages.forEach(message => {
        displayMessage(message, false);
    });
    scrollToBottom();
});

socket.on('new_message', (message) => {
    const isOwnMessage = message.sender_id === socket.id;
    displayMessage(message, isOwnMessage);
    scrollToBottom();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        const messageData = {
            message: message,
            username: currentUser.username,
            isAnonymous: currentUser.isAnonymous
        };
        
        socket.emit('send_message', messageData);
        messageInput.value = '';
        sendButton.disabled = false;
    }
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

messageInput.addEventListener('input', () => {
    sendButton.disabled = messageInput.value.trim() === '';
});

function displayMessage(message, isOwnMessage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwnMessage ? 'own' : ''}`;
    
    const timestamp = new Date(message.created_at);
    const timeString = timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    const avatarContent = getAvatarContent(message.username, message.is_anonymous);
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${message.is_anonymous ? '' : 'online'}">
            ${avatarContent}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="sender-name">${message.username}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-bubble">
                ${escapeHtml(message.message)}
            </div>
            ${isOwnMessage ? '<div class="message-status">✓✓</div>' : ''}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

function getAvatarContent(username, isAnonymous) {
    if (isAnonymous) {
        return '👤';
    } else {
        return username.charAt(0).toUpperCase();
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

socket.on('connect', () => {
    console.log('Connected to server');
    currentUser.socketId = socket.id;
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    alert('Failed to connect to chat server. Please refresh the page.');
});
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setUsernameBtn.click();
    }
});

setTimeout(() => {
    if (messagesContainer.children.length === 0) {
        const sampleMessages = [
            {
                username: 'Anonymous',
                message: 'Is anyone there!!',
                is_anonymous: true,
                created_at: new Date(Date.now() - 3600000),
                sender_id: 'sample1'
            },
            {
                username: 'Anonymous',
                message: 'Yeah yeah!!',
                is_anonymous: true,
                created_at: new Date(Date.now() - 3000000),
                sender_id: 'sample2'
            },
            {
                username: 'Abhay Shukla',
                message: 'There is a suprise Guys!!',
                is_anonymous: false,
                created_at: new Date(Date.now() - 1800000),
                sender_id: 'sample3'
            }
        ];
        
        sampleMessages.forEach(msg => displayMessage(msg, false));
        scrollToBottom();
    }
}, 2000);

sendButton.disabled = true;