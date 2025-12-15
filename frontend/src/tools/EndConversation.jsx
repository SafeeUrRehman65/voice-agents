const EndConversation = (webSocketRef, setPromptResponse) => {
  webSocketRef?.current?.close();
  setPromptResponse([]);
};

export default EndConversation;
