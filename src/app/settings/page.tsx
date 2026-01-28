'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Check if app is installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Load saved settings
    const savedInterval = localStorage.getItem('refreshInterval');
    if (savedInterval) {
      setRefreshInterval(savedInterval);
    }
  }, []);

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('您的浏览器不支持通知功能');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    setNotificationsEnabled(permission === 'granted');

    if (permission === 'granted') {
      // Subscribe to push notifications
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        });
      } catch (error) {
        console.error('Error subscribing to push:', error);
      }
    }
  };

  const handleRefreshIntervalChange = (value: string) => {
    setRefreshInterval(value);
    localStorage.setItem('refreshInterval', value);
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      alert('缓存已清除');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="px-4 py-4 space-y-4">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          设置
        </h1>

        {/* Notification Settings */}
        <div className="card p-4">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            通知设置
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">推送通知</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  接收价格提醒通知
                </div>
              </div>
              {notificationPermission === 'granted' ? (
                <span className="px-3 py-1 rounded-full bg-[var(--success)] text-white text-sm">
                  已启用
                </span>
              ) : notificationPermission === 'denied' ? (
                <span className="px-3 py-1 rounded-full bg-[var(--danger)] text-white text-sm">
                  已禁用
                </span>
              ) : (
                <button
                  onClick={handleRequestNotification}
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium"
                >
                  启用
                </button>
              )}
            </div>

            {notificationPermission === 'denied' && (
              <div className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 p-3 rounded-lg">
                通知权限已被禁用。请在浏览器设置中手动启用。
              </div>
            )}
          </div>
        </div>

        {/* Data Settings */}
        <div className="card p-4">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            数据设置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">自动刷新间隔</label>
              <select
                value={refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(e.target.value)}
                className="w-full p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)]"
              >
                <option value="1">1 分钟</option>
                <option value="5">5 分钟</option>
                <option value="10">10 分钟</option>
                <option value="30">30 分钟</option>
                <option value="0">禁用自动刷新</option>
              </select>
            </div>

            <button
              onClick={handleClearCache}
              className="w-full py-3 rounded-lg border border-[var(--card-border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--secondary-dark)] transition-colors"
            >
              清除缓存
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="card p-4">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            关于
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">应用名称</span>
              <span>Alex糖约</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">版本</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">安装状态</span>
              <span>{isInstalled ? '已安装为PWA' : '网页模式'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">数据来源</span>
              <span>Twelve Data</span>
            </div>
          </div>
        </div>

        {/* Install PWA Prompt */}
        {!isInstalled && (
          <div className="card p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
              <div>
                <div className="font-semibold mb-1">安装到主屏幕</div>
                <div className="text-sm opacity-90">
                  将Alex糖约安装到主屏幕，享受更好的使用体验！
                </div>
                <div className="text-xs mt-2 opacity-75">
                  点击浏览器菜单 → "添加到主屏幕"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-[var(--text-secondary)] py-4">
          <p>国际糖价实时追踪应用</p>
          <p className="mt-1">Made with care for Alex</p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
