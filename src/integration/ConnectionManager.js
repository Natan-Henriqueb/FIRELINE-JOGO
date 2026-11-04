
export default class ConnectionManager {
  constructor() {
    this.socket = null;
    this.connected = false;

    this.onMessage = null;
    this.onConnect = null;
    this.onDisconnect = null;
    this.onError = null;
  }

  // Conecta ao servidor
  connect(url) {
    if (this.socket) {
      this.disconnect();
    }

    if (!url || !/^wss?:\/\//i.test(url)) {
      console.error("Endereço WebSocket inválido.");
      return false;
    }

    try {
      this.socket = new WebSocket(url);

      this.socket.addEventListener("open", () => {
        this.connected = true;

        console.log("Conexão estabelecida.");

        this.onConnect?.();
      });

      this.socket.addEventListener("message", event => {
        let data = event.data;

        try {
          data = JSON.parse(event.data);
        } catch {
          // Mantém o conteúdo original se não for JSON
        }

        this.onMessage?.(data);
      });

      this.socket.addEventListener("close", () => {
        this.connected = false;

        console.log("Conexão encerrada.");

        this.onDisconnect?.();
      });

      this.socket.addEventListener("error", error => {
        console.error("Erro na conexão:", error);

        this.onError?.(error);
      });

      return true;
    } catch (error) {
      console.error("Não foi possível iniciar a conexão:", error);

      this.connected = false;

      return false;
    }
  }

  // Envia dados para o servidor
  send(data) {
    if (
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      console.warn("Não existe conexão ativa.");
      return false;
    }

    try {
      const message =
        typeof data === "string"
          ? data
          : JSON.stringify(data);

      this.socket.send(message);

      return true;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      return false;
    }
  }

  // Registra uma função para receber mensagens
  setOnMessage(callback) {
    this.onMessage = callback;
  }

  // Registra uma função para quando conectar
  setOnConnect(callback) {
    this.onConnect = callback;
  }

  // Registra uma função para quando desconectar
  setOnDisconnect(callback) {
    this.onDisconnect = callback;
  }

  // Registra uma função para erros
  setOnError(callback) {
    this.onError = callback;
  }

  // Verifica conexão
  isConnected() {
    return (
      this.connected &&
      this.socket?.readyState === WebSocket.OPEN
    );
  }

  // Encerra a conexão
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connected = false;
  }
}
