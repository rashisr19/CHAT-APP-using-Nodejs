const socket = io('http://localhost:8000');

socket.on('chat-message', data => {
    console.log(data);
})
