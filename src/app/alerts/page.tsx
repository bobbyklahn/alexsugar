'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { PriceAlert, AlertType } from '@/types';

const alertTypeLabels: Record<AlertType, string> = {
  above: '价格高于',
  below: '价格低于',
  change_above: '涨幅超过',
  change_below: '跌幅超过',
  ma_cross_above: '价格上穿MA50',
  ma_cross_below: '价格下穿MA50',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlertType, setNewAlertType] = useState<AlertType>('above');
  const [newAlertThreshold, setNewAlertThreshold] = useState('0.15');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    const threshold = parseFloat(newAlertThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      alert('请输入有效的阈值');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newAlertType,
          threshold,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        setNewAlertThreshold('0.15');
        fetchAlerts();
      } else {
        alert(data.error || '创建提醒失败');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAlert = async (alert: PriceAlert) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alert.id,
          isActive: !alert.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    if (!confirm('确定删除此提醒？')) return;

    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const formatThreshold = (type: AlertType, threshold: number) => {
    if (type.includes('change')) {
      return `${threshold}%`;
    }
    if (type.includes('ma_cross')) {
      return '';
    }
    return `$${threshold.toFixed(4)}`;
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="px-4 py-4 space-y-4">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            价格提醒
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary text-sm py-2 px-4"
          >
            + 新建提醒
          </button>
        </div>

        {/* Create Alert Form */}
        {showCreateForm && (
          <div className="card p-4">
            <h3 className="font-semibold mb-4">创建新提醒</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  提醒类型
                </label>
                <select
                  value={newAlertType}
                  onChange={(e) => setNewAlertType(e.target.value as AlertType)}
                  className="w-full p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)]"
                >
                  <option value="above">价格高于指定值</option>
                  <option value="below">价格低于指定值</option>
                  <option value="change_above">日涨幅超过</option>
                  <option value="change_below">日跌幅超过</option>
                  <option value="ma_cross_above">价格上穿MA50</option>
                  <option value="ma_cross_below">价格下穿MA50</option>
                </select>
              </div>

              {!newAlertType.includes('ma_cross') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">
                    {newAlertType.includes('change') ? '百分比 (%)' : '价格阈值 ($/磅)'}
                  </label>
                  <input
                    type="number"
                    step={newAlertType.includes('change') ? '0.1' : '0.0001'}
                    value={newAlertThreshold}
                    onChange={(e) => setNewAlertThreshold(e.target.value)}
                    className="w-full p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)]"
                    placeholder={newAlertType.includes('change') ? '5' : '0.15'}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 rounded-lg border border-[var(--card-border)] font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={creating}
                  className="flex-1 py-3 rounded-lg bg-[var(--primary)] text-white font-medium disabled:opacity-50"
                >
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Alerts */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            活跃提醒
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : alerts.filter(a => a.isActive).length > 0 ? (
            <div className="space-y-3">
              {alerts
                .filter((a) => a.isActive)
                .map((alert) => (
                  <div key={alert.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-[var(--text-primary)]">
                          {alertTypeLabels[alert.alertType]}{' '}
                          {formatThreshold(alert.alertType, alert.threshold)}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          创建于 {new Date(alert.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAlert(alert)}
                          className="p-2 rounded-lg hover:bg-[var(--secondary-dark)]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-[var(--text-secondary)]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-2 rounded-lg hover:bg-[var(--secondary-dark)]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-[var(--danger)]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-[var(--text-secondary)]">
              暂无活跃提醒
            </div>
          )}
        </div>

        {/* Paused Alerts */}
        {alerts.filter((a) => !a.isActive).length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
              已暂停
            </h2>
            <div className="space-y-3">
              {alerts
                .filter((a) => !a.isActive)
                .map((alert) => (
                  <div key={alert.id} className="card p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-[var(--text-primary)]">
                          {alertTypeLabels[alert.alertType]}{' '}
                          {formatThreshold(alert.alertType, alert.threshold)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAlert(alert)}
                          className="p-2 rounded-lg hover:bg-[var(--secondary-dark)]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-[var(--success)]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-2 rounded-lg hover:bg-[var(--secondary-dark)]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-[var(--danger)]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="card p-4 bg-[var(--secondary)]">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 flex-shrink-0 text-[var(--primary)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>提醒会在满足条件时通过推送通知发送到您的设备。</p>
              <p className="mt-1">请确保已启用通知权限。</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
