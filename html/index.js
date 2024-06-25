document.addEventListener('submit', (e) => {
    e.preventDefault()
    progressConversation()
})

//const openAIApiKey = process.env.OPENAI_API_KEY

function progressConversation() {
    var userInput = document.getElementById('user-input')
    var chatbotConversation = document.getElementById('chatbot-conversation-container')
    var question = userInput.value
    userInput.value = ''

    // add human message
    var newHumanSpeechBubble = document.createElement('div')
    newHumanSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newHumanSpeechBubble)
    newHumanSpeechBubble.textContent = question
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight

    // add AI message
    var newAiSpeechBubble = document.createElement('div')
    newAiSpeechBubble.classList.add('speech', 'speech-ai')
    chatbotConversation.appendChild(newAiSpeechBubble)
    newAiSpeechBubble.textContent = result
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
}