import { startChat as startWebSocket } from "../services/chat.js";

const startChatController = async (req, res) => {
  console.log("Request received for creating a ws connection");
  try {
    const ws = startWebSocket();
    if (ws) {
      console.log("Server side websocket ready!");
    }
    res.send({ ok: true });
  } catch (error) {
    console.log(
      "Some error occured while connecting to server websocket",
      error
    );
    res.status(500).send({ error: "Websocket startup failed" });
  }
};

export default startChatController;
