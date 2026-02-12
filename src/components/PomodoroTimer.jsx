import React, { useState, useEffect } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = ({ isWorkTime }) => {
    const WORK_TIME = 25 * 60;
    const BREAK_TIME = 5 * 60;

    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play sound here
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    };

    const switchMode = () => {
        setIsActive(false);
        const nextModeIsBreak = !isBreak;
        setIsBreak(nextModeIsBreak);
        setTimeLeft(nextModeIsBreak ? BREAK_TIME : WORK_TIME);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`pomodoro-container ${isWorkTime ? 'day-theme' : 'night-theme'}`}>
            <div className="timer-display">
                {formatTime(timeLeft)}
            </div>
            <div className="timer-controls">
                <button className="rune-button" onClick={toggleTimer}>
                    {isActive ? '⏸' : '▶'}
                </button>
                <button className="rune-button" onClick={resetTimer}>
                    ↺
                </button>
                <button className="rune-button mode-switch" onClick={switchMode}>
                    {isBreak ? '⚒' : '☕'}
                </button>
            </div>
            <div className="timer-label">
                {isBreak ? 'Rest' : 'Focus'}
            </div>
        </div>
    );
};

export default PomodoroTimer;
