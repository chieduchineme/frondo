// Import core React functionality and useState hook
import React, { useState } from 'react';

// Import application sections/components
import ProductSection from './components/ProductSection';
import OrderSection from './components/OrderSection';
import ChatbotSection from './components/ChatbotSection';

// Import styling
import './App.css';

/**
 * App Component
 * Serves as the root of the E-Commerce application.
 * Allows switching between Product, Order, and Chatbot sections via a navbar.
 */
const App: React.FC = () => {
  // Local state to track which section is currently active
  const [section, setSection] = useState<'product' | 'order' | 'chatbot'>('product');

  return (
    <div className="app">
      {/* Top navbar displaying app title */}
      <div className="navbar">🛒 E-Commerce App</div>

      {/* Navigation buttons to toggle sections */}
      <div className="nav-buttons">
        <button onClick={() => setSection('product')}>Product</button>
        <button onClick={() => setSection('order')}>Order</button>
        <button onClick={() => setSection('chatbot')}>Chatbot</button>
      </div>

      {/* Conditional rendering of sections based on selected tab */}
      {section === 'product' && <ProductSection />}
      {section === 'order' && <OrderSection />}
      {section === 'chatbot' && <ChatbotSection />}
    </div>
  );
};

export default App;
