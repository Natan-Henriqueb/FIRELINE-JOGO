
export default class SensorBridge {
  constructor(onDetection = () => {}) {
    this.onDetection = onDetection;

    this.connected = false;
    this.lastMessage = null;
    this.lastDetection = false;
  }

  // Recebe os dados enviados pelo dispositivo
  receive(data) {
    let message = data;

    // Converte JSON em objeto, caso necessário
    if (typeof data === "string") {
      try {
        message = JSON.parse(data);
      } catch (error) {
        console.error("Mensagem inválida recebida do sensor:", error);
        return false;
      }
    }

    if (!message || typeof message !== "object") {
      console.warn("Formato de mensagem inválido.");
      return false;
    }

    this.lastMessage = message;

    // Verifica se o sensor enviou uma detecção válida
    if (typeof message.smokeDetected === "boolean") {
      this.connected = true;

      if (message.smokeDetected && !this.lastDetection) {
        this.onDetection(message);
      }

      this.lastDetection = message.smokeDetected;

      return true;
    }

    console.warn("A mensagem não contém smokeDetected válido.");
    return false;
  }

  // Atualiza o estado da conexão
  setConnected(status) {
    this.connected = Boolean(status);
  }

  // Retorna o estado da conexão
  isConnected() {
    return this.connected;
  }

  // Retorna a última mensagem recebida
  getLastMessage() {
    return this.lastMessage;
  }

  // Retorna o estado atual da detecção
  isSmokeDetected() {
    return this.lastDetection;
  }

  // Reseta os dados
  reset() {
    this.lastMessage = null;
    this.lastDetection = false;
  }

  // Desconecta o sensor
  disconnect() {
    this.connected = false;
    this.reset();
  }
}
