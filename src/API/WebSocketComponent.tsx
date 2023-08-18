import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuthHeader } from 'react-auth-kit';

// const BASE_URL = 'wss://euler-i733tg4iuq-uc.a.run.app/api/v1';
const BASE_URL = 'wss://localhost:4000/api/v1'

const WebSocketComponent = ({ url, onMessage, onOpen, onClose, onError, reconnectInterval }) => {
  const [shouldRetry, setShouldRetry] = useState(false);
  const [manualClose, setManualClose] = useState(true);
  const ws = useRef(null);
  const authHeader = useAuthHeader();

  const connect = () => {
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      console.log("WebSocket already connected")
      return;
    }
    
    ws.current = new WebSocket(BASE_URL + url + "?token=" + authHeader());
    console.log('WebSocket created', ws.current.readyState);
    console.log(BASE_URL + url + "?token=" + authHeader());


    ws.current.onopen = event => {
      console.log('WebSocket opened', ws.current.readyState);
      if (onOpen) {
        onOpen(event);
      }
    };

    ws.current.onmessage = event => {
      if (onMessage) {
        onMessage(event.data);
      }
    };

    ws.current.onerror = event => {
      console.error('WebSocket error:', event);

      if (onError) {
        onError(event);
      }
    };

    ws.current.onclose = event => {
      console.log('WebSocket closed with code:', event.code, 'and reason:', event.reason);
      if (onClose) {
        onClose(event);
      }

      if (reconnectInterval && !manualClose) {
        setTimeout(() => {
          console.log('Reconnecting WebSocket ...');
          connect();
        }, reconnectInterval);
      }
    };
  }

  useEffect(() => {
    if (shouldRetry && !manualClose) {
      connect();
      setShouldRetry(false);
    }

    // Cleanup WebSocket when component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, shouldRetry, manualClose]);

  const startSocket = () => {
    setManualClose(false);
    setShouldRetry(true);
  };

  const stopSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
    setManualClose(true);
    setShouldRetry(false);
  };

  return { startSocket, stopSocket }; // Expose the startSocket and stopSocket functions
};

WebSocketComponent.propTypes = {
  url: PropTypes.string.isRequired,
  onMessage: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onError: PropTypes.func,
  reconnectInterval: PropTypes.number
};

export default WebSocketComponent;
