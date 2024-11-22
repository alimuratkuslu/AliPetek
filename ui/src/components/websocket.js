import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    static instance = null;
    client = null;
    subscriptions = new Map();
    connected = false;
    connectPromise = null;
    sessionId = null;
    
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    async connect() {
        if (this.connected && this.client?.connected) {
            return Promise.resolve(this.sessionId);
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    reject(new Error('No authentication token found'));
                    return;
                }

                const socket = new SockJS('http://localhost:8080/ws');
                this.client = Stomp.over(socket);
                
                const connectHeaders = {
                    'Authorization': `Bearer ${token}`
                };

                this.client.connect(
                    connectHeaders,
                    () => {
                        console.log('WebSocket Connected');
                        this.connected = true;
                        if (this.client.ws._transport.url) {
                            this.sessionId = this.client.ws._transport.url.split('/').slice(-2)[0];
                            console.log('WebSocket Session ID:', this.sessionId);
                        }
                        resolve(this.sessionId);
                    },
                    (error) => {
                        console.error('WebSocket connection error:', error);
                        this.connected = false;
                        this.connectPromise = null;
                        this.client = null;
                        reject(error);
                    }
                );
            } catch (error) {
                this.connectPromise = null;
                this.client = null;
                reject(error);
            }
        });

        return this.connectPromise;
    }

    async subscribe(destination, callback) {
        try {
            await this.connect();

            const existingSubscription = this.subscriptions.get(destination);
            if (existingSubscription) {
                console.log('Using existing subscription for:', destination);
                return existingSubscription;
            }

            console.log('Creating new subscription for:', destination);
            const subscription = this.client.subscribe(destination, (message) => {
                try {
                    if (message && message.body) {
                        const data = JSON.parse(message.body);
                        console.log('Received message on', destination, ':', data);
                        callback(data);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });

            this.subscriptions.set(destination, subscription);
            return subscription;

        } catch (error) {
            console.error('Error subscribing to', destination, ':', error);
            throw error;
        }
    }

    async send(destination, message) {
        try {
          if (!this.client.connected) {
            throw new Error('WebSocket is not connected');
          }
          this.client.publish({
            destination: destination,
            body: JSON.stringify(message)
          });
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error;
        }
      }

    unsubscribe(destination) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            console.log('Unsubscribing from:', destination);
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    disconnect() {
        if (this.client && this.connected) {
            this.subscriptions.forEach((subscription, destination) => {
                this.unsubscribe(destination);
            });

            this.client.disconnect(() => {
                console.log('WebSocket Disconnected');
                this.connected = false;
                this.connectPromise = null;
                this.sessionId = null;
                this.client = null;
            });
        }
    }

    getSessionId() {
        return this.sessionId;
    }

    isConnected() {
        return this.connected && this.client?.connected;
    }
}

export const webSocketService = WebSocketService.getInstance();