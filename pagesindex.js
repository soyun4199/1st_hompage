// /pages/index.js

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// --- 1. 핵심 로직: useRewardSystem 훅 ---
// 경험치(XP)와 레벨 시스템을 관리하는 커스텀 훅
function useRewardSystem() {
  const [xp, setXp] = useState(0); 
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0); // 연속 성공일 (스트릭)

  useEffect(() => {
    // 100 XP당 1 레벨 상승
    const newLevel = Math.floor(xp / 100) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      console.log(`축하합니다! 레벨 ${newLevel}로 상승했습니다!`);
    }
  }, [xp, level]);

  const addXp = (amount) => {
    setXp(prev => prev + amount);
  };
  
  const incrementStreak = () => {
      setStreak(prev => prev + 1);
  };

  return { xp, level, streak, addXp, incrementStreak };
}

// --- 2. 오늘의 작은 목표 (1번 기능) 컴포넌트 ---
const DAILY_GOALS = [
  { id: 1, title: "물 한 컵 마시기", xp: 10 },
  { id: 2, title: "오늘 20분 공부하기", xp: 30 },
  { id: 3, title: "할 일 3가지 정리하기", xp: 20 },
];

function MicroGoalSection({ addXp, incrementStreak }) {
  const [goals, setGoals] = useState(DAILY_GOALS.map(g => ({ ...g, isDone: false })));

  const handleGoalCompletion = (goalId) => {
    let completedAll = true; 
    
    setGoals(prevGoals => prevGoals.map(goal => {
      if (goal.id === goalId && !goal.isDone) {
        addXp(goal.xp); 
        return { ...goal, isDone: true };
      }
      if (goal.id !== goalId && !goal.isDone) {
          completedAll = false;
      }
      return goal;
    }));
    
    if (completedAll) {
        incrementStreak();
    }
  };

  return (
    <section style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
      <h3>1. 오늘의 작은 목표</h3>
      <p style={{ fontSize: '0.9em', color: '#666' }}>작은 성공 경험을 통해 동기 부여를 시작해 보세요.</p>
      <div className="goal-list">
        {goals.map(goal => (
          <div key={goal.id} style={{ padding: '5px 0' }}>
            <input
              type="checkbox"
              checked={goal.isDone}
              onChange={() => handleGoalCompletion(goal.id)}
              disabled={goal.isDone}
            />
            <span style={{ textDecoration: goal.isDone ? 'line-through' : 'none' }}>{goal.title}</span>
            {goal.isDone && <span style={{ marginLeft: '10px', color: 'green', fontSize: '0.8em' }}>완료</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

// --- 3. 뽀모도로 챌린지 (2번 기능) 컴포넌트 ---
const STUDY_TIME = 25 * 60; 
const REST_TIME = 5 * 60;  

function PomodoroChallenge({ addXp }) {
  const [time, setTime] = useState(STUDY_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [rivals, setRivals] = useState(2); 

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) {
      if (isStudyMode) {
        addXp(50); // 뽀모도로 성공 보상
        alert("25분 공부 성공! XP 50 획득! 5분 휴식 시작");
        setTime(REST_TIME);
        setIsStudyMode(false);
      } else {
        alert("5분 휴식 끝! 다시 시작하거나 종료하세요.");
        setTime(STUDY_TIME);
        setIsStudyMode(true);
        setIsActive(false);
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time, isStudyMode, addXp]);

  const toggleTimer = () => setIsActive(!isActive);
  const joinRivalRoom = () => {
    alert("대결 방에 참가했습니다! (실제로는 실시간 DB 연결 필요)");
    setRivals(r => r + 1); 
  };
  
  const displayTime = `${Math.floor(time / 60)}:${('0' + (time % 60)).slice(-2)}`;

  return (
    <section style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
      <h3>2. 의지 상승 챌린지 (뽀모도로 & 대결)</h3>
      <p style={{ fontSize: '0.9em', color: '#666' }}>자신에게 맞는 난이도의 목표와 경쟁 요소를 제공합니다.</p>

      <div style={{ margin: '10px 0', textAlign: 'center' }}>
        <h4>{isStudyMode ? '공부 시간' : '휴식 시간'}</h4>
        <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{displayTime}</div>
        <button onClick={toggleTimer} style={{ padding: '8px 15px', margin: '5px' }}>
          {isActive ? '일시정지' : (isStudyMode ? '공부 시작' : '휴식 시작')}
        </button>
      </div>

      <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
        <p>현재 대결 방 참여 인원: {rivals}명</p>
        <button onClick={joinRivalRoom}>참여하기 (게임처럼 보상 지급)</button>
      </div>
    </section>
  );
}

// --- 4. 활동 히스토리 (4번 기능) 컴포넌트 ---
function ActivityTracker() {
  // 실제 DB에서 불러올 활동 데이터
  const activities = [
    { name: '공부', logs: [10, 20, 15, 30, 0, 0, 10] },
    { name: '산책', logs: [5, 0, 10, 5, 5, 0, 0] },
  ];

  const calculateAverage = (logs) => {
      const currentWeekTotal = logs.reduce((sum, val) => sum + val, 0);
      return Math.round(currentWeekTotal / logs.length);
  };
  
  const logActivity = (activityName) => {
    alert(`${activityName} 활동을 기록했습니다! (공백기 스트레스 감소)`);
  };

  return (
    <section style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
      <h3>4. 활동 히스토리 자동 기록</h3>
      <p style={{ fontSize: '0.9em', color: '#666' }}>활동 비교가 아닌 개인의 변화만 시각화합니다.</p>
      
      <div style={{ margin: '10px 0' }}>
          {['공부', '산책', '외출', '스트레칭'].map(name => (
              <button key={name} onClick={() => logActivity(name)} style={{ margin: '3px' }}>{name} 기록</button>
          ))}
      </div>

      <h4>활동 변화 요약 (지난 7일 평균)</h4>
      {activities.map(act => (
          <p key={act.name} style={{ margin: '5px 0' }}>
              **{act.name}:** 일일 평균 {calculateAverage(act.logs)}분 활동
          </p>
      ))}
    </section>
  );
}

// --- 5. 익명 사회 연결 공간 (3번 기능) 컴포넌트 ---
function AnonymousChat() {
  const [chatType, setChatType] = useState('oneLine');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    { user: '익명 사용자', text: '오늘 목표를 드디어 완료했어요!', type: 'line' },
    { user: '봇', text: '오늘의 질문: 오늘 나에게 가장 고마운 일은 무엇인가요?', type: 'q' }
  ]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    const newUser = chatType === 'chatbot' ? '나' : '익명 사용자';
    
    setHistory(prev => [...prev, { user: newUser, text: message, type: chatType }]);
    setMessage('');
    
    if (chatType === 'chatbot') {
        setTimeout(() => {
            setHistory(prev => [...prev, { user: '봇', text: '멋진 생각이네요! 다음 목표도 응원할게요.', type: 'bot' }]);
        }, 500);
    }
  };
  
  const handleCall = (type) => {
      alert(`${type === 'video' ? '스티커 영상 통화' : '익명 음성 통화'} 기능을 시작합니다. (WebRTC 기술 필요)`);
  };

  return (
    <section style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
      <h3>3. 익명 사회 연결 공간</h3>
      <p style={{ fontSize: '0.9em', color: '#666' }}>단 1문장만으로 타인과 연결되는 최소한의 사회성 회복 도구입니다.</p>
      
      <div style={{ margin: '10px 0' }}>
        <button onClick={() => setChatType('oneLine')} style={{ margin: '3px', fontWeight: chatType === 'oneLine' ? 'bold' : 'normal' }}>한 줄 대화방</button>
        <button onClick={() => setChatType('chatbot')} style={{ margin: '3px', fontWeight: chatType === 'chatbot' ? 'bold' : 'normal' }}>챗봇과 대화</button>
      </div>
      
      <div style={{ height: '150px', overflowY: 'scroll', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        {history.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px', color: msg.user === '봇' ? 'blue' : 'black' }}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder={chatType === 'chatbot' ? '챗봇에게 이야기해 보세요...' : '응원 메시지를 남겨보세요...'}
        style={{ width: 'calc(100% - 70px)', padding: '5px' }}
      />
      <button onClick={handleSend} style={{ width: '60px', padding: '5px' }}>전송</button>
      
      <div style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
          <button onClick={() => handleCall('voice')} style={{ margin: '3px' }}>익명 음성 통화 (단계적)</button>
          <button onClick={() => handleCall('video')} style={{ margin: '3px' }}>스티커 영상 통화 (단계적)</button>
      </div>
    </section>
  );
}

// --- 최종 메인 컴포넌트 ---
export default function HomePage() {
  const { xp, level, streak, addXp, incrementStreak } = useRewardSystem();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>작은 성공 - 동기 부여 앱</title>
      </Head>

      <main>
        
        {/* 동기 부여 시스템: 레벨/XP 표시 */}
        <section style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h1>동기 부여 시스템</h1>
          <p style={{ fontSize: '1.2em' }}>레벨: **{level}** | 연속 성공일 (Streak): **{streak}**일</p>
          <p style={{ fontSize: '1.1em' }}>경험치(XP): **{xp}** / 100</p>
          <div style={{ height: '10px', backgroundColor: '#ddd', borderRadius: '5px', margin: '10px 0' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: 'orange', 
                width: `${(xp % 100)}%`, 
                borderRadius: '5px',
                transition: 'width 0.5s'
              }}
            ></div>
          </div>
        </section>

        <MicroGoalSection addXp={addXp} incrementStreak={incrementStreak} />

        <PomodoroChallenge addXp={addXp} />
        
        <ActivityTracker />

        <AnonymousChat />

      </main>

      <footer style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#888' }}>
        <p>GitHub Code & Vercel Deployment Project</p>
        <p>교수님께 제출할 앱 주소는 Vercel 배포 후 생성됩니다.</p>
      </footer>
    </div>
  );
}