import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import PomodoroTimer from './components/PomodoroTimer';
import './App.css';

const MOCK_DATA = {
  tasks: [
    { id: '1', name: '探索神秘遺跡 (Mock)', category: '工作', completed: false, url: '#' },
    { id: '2', name: '配置龍族魔法防禦 (Mock)', category: '工作', completed: true, url: '#' },
    { id: '3', name: '餵養鳳凰 (Mock)', category: '個人', completed: false, url: '#' },
    { id: '4', name: '在星光下冥想 (Mock)', category: '個人', completed: true, url: '#' },
  ],
  lastUpdated: new Date().toISOString()
};

const App = () => {
  const [now, setNow] = useState(DateTime.now().setZone('Asia/Taipei'));
  const [data, setData] = useState({ tasks: [], lastUpdated: null });
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [pomodoroStats, setPomodoroStats] = useState(() => {
    const saved = localStorage.getItem('pomodoroStats');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('pomodoroStats', JSON.stringify(pomodoroStats));
  }, [pomodoroStats]);

  const handlePomodoroComplete = (taskId) => {
    setPomodoroStats(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || 0) + 1
    }));
  };

  const fetchData = () => {
    setLoading(true);
    fetch('/api/notion')
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(json => {
        if (json.error || !json.tasks) throw new Error('Invalid JSON');
        setData(json);
        setLoading(false);
        setIsMock(false);
      })
      .catch(err => {
        console.warn('Using MOCK_DATA due to fetch failure:', err.message);
        setData(MOCK_DATA);
        setLoading(false);
        setIsMock(true);
      });
  };

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setNow(DateTime.now().setZone('Asia/Taipei'));
    }, 60000);

    // Initial fetch
    fetchData();

    return () => clearInterval(timer);
  }, []);

  const [manualMode, setManualMode] = useState(null); // 'day', 'night', or null (auto)

  const currentHour = now.hour;
  const autoIsWorkTime = currentHour >= 6 && currentHour < 17; // 06:00 - 17:00
  const isWorkTime = manualMode === 'day' ? true : manualMode === 'night' ? false : autoIsWorkTime;

  const toggleMode = () => {
    if (manualMode === 'day') setManualMode('night');
    else if (manualMode === 'night') setManualMode(null);
    else setManualMode('day');
  };

  const workTasks = data.tasks.filter(t => t.category === '工作' || t.category === 'Work');
  const personalTasks = data.tasks.filter(t => t.category === '個人' || t.category === 'Personal');

  const calculateProgress = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const workProgress = calculateProgress(workTasks);
  const personalProgress = calculateProgress(personalTasks);

  const ProgressCircle = ({ percentage, color }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="progress-container">
        <svg width="60" height="60">
          <circle className="progress-bg" cx="30" cy="30" r={radius} />
          <circle
            className="progress-fg"
            cx="30" cy="30" r={radius}
            style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: color }}
          />
        </svg>
        <div className="progress-text">{percentage}%</div>
      </div>
    );
  };

  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isSelectingTask, setIsSelectingTask] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const startPomodoro = (task) => {
    setActiveTask(task);
    setIsSelectingTask(false);
    setIsPomodoroOpen(true);
  };

  const currentModeTasks = isWorkTime ? workTasks : personalTasks;

  const TaskItem = ({ task }) => {
    const tomatoes = pomodoroStats[task.id] || 0;
    return (
      <a href={task.url} target="_blank" rel="noopener noreferrer" className="task-card">
        <div className="task-info">
          {tomatoes > 0 && (
            <span className="tomato-marker" title={`已完成 ${tomatoes} 個番茄`}>
              {'🍅'.repeat(tomatoes)}
            </span>
          )}
          <span className="task-name">{task.name}</span>
        </div>
        {task.completed && <span className="completed-badge">DONE</span>}
      </a>
    );
  };

  const CelestialCycle = ({ isWorkTime, toggleMode }) => (
    <div className="astrolabe-container" onClick={toggleMode} title="Click to toggle Day/Night">
      <div className={`astrolabe-body ${isWorkTime ? 'day-mode' : 'night-mode'}`}>
        {/* Outer Ring - Fixed or slowly rotating */}
        <div className="astrolabe-ring-outer"></div>

        {/* Main Rotating Plate */}
        <div className="astrolabe-plate">
          <div className="astrolabe-orb sun-orb">
            <div className="orb-glow"></div>
            <span className="orb-icon">☀️</span>
          </div>
          <div className="astrolabe-orb moon-orb">
            <div className="orb-glow"></div>
            <span className="orb-icon">🌙</span>
          </div>
          <div className="plate-axis"></div>
        </div>

        {/* Inner Gear / Pivot */}
        <div className="astrolabe-center-gear">
          <div className="pivot-gem"></div>
        </div>
      </div>
    </div>
  );





  return (
    <div className={`app-container ${isWorkTime ? 'mode-day' : 'mode-night'}`}>

      {/* Corner Decorations - Removed */}

      <header className="header">
        <div className="time-display" onClick={toggleMode} style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }} title="Click time to toggle Day/Night/Auto">
          <div className="date-text" style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '5px', opacity: 0.8 }}>
            {now.toFormat('yyyy年MM月dd日')}
          </div>
          <div style={{ lineHeight: 1 }}>
            {now.toFormat('HH:mm')}
            {manualMode && <span style={{ fontSize: '1rem', marginLeft: '10px', verticalAlign: 'middle' }}>({manualMode === 'day' ? 'Day' : 'Night'})</span>}
          </div>
        </div>

        <CelestialCycle isWorkTime={isWorkTime} toggleMode={toggleMode} />

        <button
          className="pomodoro-trigger-btn"
          onClick={() => setIsSelectingTask(!isSelectingTask)}
          title="Choose task for Pomodoro"
        >
          <div className="trigger-icon">⏳</div>
          <div className="trigger-glow"></div>
        </button>

        {isSelectingTask && (
          <div className="task-selector-overlay" onClick={() => setIsSelectingTask(false)}>
            <div className="task-selector-dropdown" onClick={e => e.stopPropagation()}>
              <div className="selector-header">選擇專注目標</div>
              {currentModeTasks.length > 0 ? (
                currentModeTasks.map(task => (
                  <div
                    key={task.id}
                    className="selector-item"
                    onClick={() => startPomodoro(task)}
                  >
                    {task.name}
                  </div>
                ))
              ) : (
                <div className="selector-empty">目前無可選任務</div>
              )}
            </div>
          </div>
        )}

        <PomodoroTimer
          isWorkTime={isWorkTime}
          isOpen={isPomodoroOpen}
          onClose={() => setIsPomodoroOpen(false)}
          activeTask={activeTask}
          onComplete={() => handlePomodoroComplete(activeTask?.id)}
        />
      </header>

      <main>
        {/* 日目標 / 工作 */}
        <section className={`section section-work ${isWorkTime ? 'active' : 'inactive'}`}>
          <div className="section-header">
            <h2 className="section-title">
              <span>🎯</span> 日目標
            </h2>
            <ProgressCircle percentage={workProgress} color="var(--scroll-gold)" />
          </div>
          <div className="task-list">
            {workTasks.length > 0 ? (
              workTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
              <div className="empty-state">今日尚無工作任務</div>
            )}
          </div>
        </section>

        {/* 夜目標 / 個人 */}
        <section className={`section section-personal ${!isWorkTime ? 'active' : 'inactive'}`} style={{ marginTop: '32px' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>✨</span> 夜目標
            </h2>
            <ProgressCircle percentage={personalProgress} color="var(--scroll-purple)" />
          </div>
          <div className="task-list">
            {personalTasks.length > 0 ? (
              personalTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
              <div className="empty-state">今日尚無個人任務</div>
            )}
          </div>
        </section>
      </main>

      <div className="controls-area">
        <button
          className="refresh-btn-footer"
          onClick={fetchData}
          disabled={loading}
          title="Refresh Data"
        >
          <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
          <span className="refresh-text">同步資料</span>
        </button>
      </div>

      {loading && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', opacity: 0.5, fontSize: '12px' }}>
          Loading...
        </div>
      )}
      <footer style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', opacity: 0.6, color: 'var(--ink-color)' }}>
        {isMock && <div className="mock-warning">⚠️ 目前正處於模擬開發模式 (API 連線失敗)</div>}
        Last sync: {data.lastUpdated ? DateTime.fromISO(data.lastUpdated).setZone('Asia/Taipei').toFormat('MM/dd HH:mm') : 'Unknown'}
        <br />
        (Real-time data from Vercel)
      </footer>
    </div>
  );
};

export default App;
