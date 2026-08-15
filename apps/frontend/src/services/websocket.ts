type WebSocketMessage = {
  type: 'join' | 'leave' | 'initial_state';
  userId?: number;
  users?: number[];
  boardId?: string;
};

type WebSocketCallback = (message: WebSocketMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: Set<WebSocketCallback> = new Set();
  private currentBoardId: string | null = null;

  connect(boardId: string) {
    if (this.ws && this.currentBoardId === boardId) {
      return; // Already connected to this board
    }

    this.disconnect();

    this.currentBoardId = boardId;
    this.ws = new WebSocket('ws://localhost:3002');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.send({ type: 'join', boardId });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.callbacks.forEach((callback) => callback(message));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.ws = null;
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentBoardId = null;
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(callback: WebSocketCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  isConnected() {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
