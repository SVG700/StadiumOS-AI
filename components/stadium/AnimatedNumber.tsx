'use client';

import React, { useEffect, useState, useRef } from 'react';

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
  const startValRef = useRef(value);
  const endVal = value;

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = startValRef.current;

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
        startValRef.current = endVal;
      }
    };

    animFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animFrameId);
    };
  }, [endVal, duration]);

  // Keep track of the current value on render so that when it changes next time, we animate from the current displayed value
  useEffect(() => {
    startValRef.current = displayValue;
  }, [displayValue]);

  return <span>{formatter(displayValue)}</span>;
};
