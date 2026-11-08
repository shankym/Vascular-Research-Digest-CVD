import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  nextRunTime: string;
  lastRunTime: string;
  isProcessing?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  nextRunTime,
  lastRunTime,
  isProcessing
}) => {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    function calculate() {
      const target = new Date(nextRunTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [nextRunTime]);

  const formattedLastRun = lastRunTime
    ? new Date(lastRunTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Pending';

  return (
    <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-stone-600 dark:text-stone-400">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
        <span>Next Cycle in:</span>
        {isProcessing ? (
          <span className="font-medium text-stone-900 dark:text-stone-100">
            Processing...
          </span>
        ) : (
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        )}
      </div>
      <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">·</span>
      <div>
        <span className="text-stone-400 dark:text-stone-500">Last sync: </span>
        <span className="font-normal text-stone-700 dark:text-stone-300">{formattedLastRun}</span>
      </div>
    </div>
  );
};
