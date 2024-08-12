
"use client"

import React from 'react';

export default function PlainBar({ percentage, height }) {
  const barStyles = {
    background: 'linear-gradient(90deg, #19388B 28.62%, #39A1EA 48.99%, #39A1EA 74.64%)',
    borderRadius: '20px',
    height: height || '3.15px',
    width: `${percentage}%`,
  };

  const containerStyles = {
    background: 'gray',
    borderRadius: '20px',
    height: height || '3.15px',
  };

  return (
    <div style={containerStyles} data-testid="plain-bar-container">
      <div style={barStyles} data-testid="plain-bar"></div>
    </div>
  );
}
