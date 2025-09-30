import React, { useState, useEffect } from 'react';

const CompactClock = ({ className = '', style = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getVietnameseDayOfWeek = (date) => {
      // Tên hàm giữ nguyên, nhưng nội dung mảng là tiếng Anh
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
  };

  return (
    <div 
      className={`d-flex align-items-center ${className}`}
      style={{ fontSize: '0.875rem', ...style }}
    >
      <i className="ni ni-time-alarm mr-2" style={{ fontSize: '14px',  }}></i>
      <div className="d-flex flex-column">
        <div style={{ fontSize: '0.75rem', lineHeight: '1' }}>
          {getVietnameseDayOfWeek(currentTime)}
        </div>
        <div style={{ fontSize: '0.875rem', lineHeight: '1.2', fontWeight: '600' }}>
          {formatDateTime(currentTime)}
        </div>
      </div>
    </div>
  );
};

export default CompactClock;
