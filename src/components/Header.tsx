'use client';

import { useState } from 'react';

interface HeaderProps {
  alertCount?: number;
}

export default function Header({ alertCount = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--card-bg)] border-b border-[var(--card-border)] safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--secondary-dark)] transition-colors"
          aria-label="菜单"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* App title */}
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Alex糖约
        </h1>

        {/* Notification badge */}
        <button
          className="relative p-2 -mr-2 rounded-lg hover:bg-[var(--secondary-dark)] transition-colors"
          aria-label="通知"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[var(--danger)] rounded-full">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
      </div>

      {/* Side menu overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-[var(--card-bg)] z-50 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Alex糖约</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--secondary-dark)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              <p className="mb-4">国际糖价实时追踪应用</p>
              <p>版本 1.0.0</p>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
