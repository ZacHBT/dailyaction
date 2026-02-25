import React, { useState, useEffect } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = ({ isWorkTime, isOpen, onClose, activeTask, onComplete }) => {
    const WORK_TIME = 25 * 60;
    const BREAK_TIME = 5 * 60;

    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    // Auto-start when a task is selected and modal opens
    useEffect(() => {
        if (isOpen && activeTask) {
            setIsActive(true);
            setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME); // 根據當前模式重置時間
        } else if (!isOpen) {
            setIsActive(false);
        }
    }, [isOpen, activeTask?.id]); // 監聽任務 ID 變動

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (!isBreak && onComplete) {
                onComplete();
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, isBreak, onComplete]);

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
        <div className={`pomodoro-modal-overlay ${isOpen ? 'open' : 'closed'}`}>
            <div className={`pomodoro-container ${isWorkTime ? 'day-theme' : 'night-theme'}`}>
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="active-task-name">
                    {activeTask ? `🎯 ${activeTask.name}` : '未指定任務'}
                </div>
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
                    {isBreak ? '休息' : '專注中'}
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;
