import React from 'react';

const BubbleBackground = () => {
  const bubbles = Array.from({ length: 20 });

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {bubbles.map((_, index) => (
        <span
          key={index}
          className="bubble"
          style={{
            '--size': `${Math.random() * 4 + 2}rem`,
            '--left': `${Math.random() * 100}%`,
            '--animation-duration': `${Math.random() * 15 + 10}s`,
            '--animation-delay': `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

export default BubbleBackground; 