'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  duration = 800, 
  formatter = (val) => Math.round(val).toLocaleString() 
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayValue;
    const endVal = value;

    if (startVal === endVal) return;

    let animFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = startVal + progress * (endVal - startVal);
      setDisplayValue(currentVal);

      if (progress < 1) {
        animFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    animFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animFrameId);
    };
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
};
