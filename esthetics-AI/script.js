const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    // Send user message to conversational AI API
    fetch('https://api.example.com/converse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })
      .then(response => response.json())
      .then(data => {
        // Display AI response
        const aiResponse = data.response;
        chatLog.innerHTML += `<p><strong>Esthetics AI:</strong> ${aiResponse}</p>`;
        userInput.value = '';
      })
      .catch(error => console.error(error));
  }
});
