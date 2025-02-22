import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

console.log('Configuring Amplify with:', awsconfig);
Amplify.configure(awsconfig);

console.log('Rendering App component');
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
