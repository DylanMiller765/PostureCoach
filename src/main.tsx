import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// Initialize TensorFlow.js
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';

// Set the backend to webgl
tf.setBackend('webgl').then(() => {
  console.log('TensorFlow.js initialized with WebGL backend');
});

// Wait for TF to be ready before rendering
tf.ready().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})