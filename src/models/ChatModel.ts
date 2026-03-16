async function retrieveMemories() {

}

async function generateNewMemoryFromChat() {

}

async function updateMemories() {

    // this will be called manually (will end the chat) - if not called then memories aren't stored from that chat

}

async function deleteMemories() {
    // user can choose to delete all memories stored - does a blanket delete

}

async function createUserContext() {

    // get all memories, 10 recent journal entries, 15 recent goals

    // combine this in a prompt, ask gemini to create a 1 paragraph summary to serve as user context

    // this will be deleted at the end of a chat (handled in separate function)

}

async function endChat() {

}

async function chatCleanup() {

    // run this when the user enters the chat if they exited without ending chat properly

    
}

async function chat() {

}

export const ChatModel = {
  chat
}