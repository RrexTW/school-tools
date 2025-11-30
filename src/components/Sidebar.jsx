import React, { useState } from 'react'
import { Home, Armchair, PanelLeftClose, PanelLeft } from 'lucide-react'

const Sidebar = ({ currentPage, onPageChange }) => {
  const menuItems = [
    // { name: 'home', label: '首頁', icon: <Home size={24} /> },
    { name: 'seat', label: '隨機排座位', icon: <Armchair size={24} /> },
  ];
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle = {
    height: '100vh',
    color: '#fff',
    transition: 'width 300ms',
    boxSizing: 'border-box',
    width: isHovered ? 192 : 64, // w-48 / w-16
    background: '#111827', // gray-900
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  // 新增：固定 icon 容器，避免收合時縮放
  const iconWrapperStyle = {
    width: 24,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 24px',
  }

  const listStyle = { marginTop: 16, padding: 0, listStyle: 'none' };
  const toggleItemStyle = { display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' };
  const menuItemBase = { display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', boxSizing: 'border-box' };
  const labelStyle = (open) => ({
    marginLeft: 12,
    transition: 'opacity 300ms, width 300ms',
    opacity: open ? 1 : 0,
    width: open ? 'auto' : 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={containerStyle} aria-label="側邊選單">
      <ul style={listStyle}>
        <li
          style={toggleItemStyle}
          onClick={() => setIsHovered(!isHovered)}
          aria-pressed={isHovered}
          title={isHovered ? '收合側邊欄' : '展開側邊欄'}
        >
          <span style={iconWrapperStyle}>
            {isHovered ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </span>
          <span style={labelStyle(isHovered)}>{isHovered ? '常用小工具' : ''}</span>
        </li>

        {menuItems.map((item) => {
          const active = currentPage === item.name;
          return (
            <li
              key={item.name}
              onClick={() => onPageChange && onPageChange(item.name)}
              role="button"
              aria-current={active ? 'page' : undefined}
              style={{
                ...menuItemBase,
                background: active ? '#374151' : 'transparent', // active bg / hover omitted (no Tailwind)
              }}
            >
              <span style={iconWrapperStyle}>{item.icon}</span>
              <span style={labelStyle(isHovered)}>{item.label}</span>
            </li>
          )
        })}
      </ul>
      {/* 底部預留區塊（可以放 theme 切換或其他按鈕） */}
      <div style={{ padding: 12 }} />
    </div>
  );
};

export default Sidebar;
