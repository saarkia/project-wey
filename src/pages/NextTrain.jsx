import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, RefreshCcw, Train } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatDurationMinutes, formatTimeValue } from '../lib/time';

const SETTINGS_KEY = 'nextTrainSettings';
const DEFAULT_SETTINGS = {
  maxDurationMins: 40,
  timeWindowMins: 120,
  refreshIntervalSec: 20
};

const readStoredSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored);
    return {
      maxDurationMins: Number(parsed.maxDurationMins) || DEFAULT_SETTINGS.maxDurationMins,
      timeWindowMins: Number(parsed.timeWindowMins) || DEFAULT_SETTINGS.timeWindowMins,
      refreshIntervalSec: Number(parsed.refreshIntervalSec) || DEFAULT_SETTINGS.refreshIntervalSec
    };
  } catch (error) {
    console.warn('Unable to read Next Train settings', error);
    return DEFAULT_SETTINGS;
  }
};

const clampNumber = (value, min, max, fallback) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

const NextTrain = () => {
  const [settings, setSettings] = useState(readStoredSettings);
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const fetchNextTrain = useCallback(async () => {
    setErrorMessage(null);
    setStatus((current) => (current === 'idle' && !data ? 'loading' : 'refreshing'));

    const { data: response, error } = await supabase.functions.invoke('next-train', {
      body: {
        origin: 'WYB',
        destination: 'WAT',
        maxDurationMins: settings.maxDurationMins,
        timeWindowMins: settings.timeWindowMins,
        numRows: 9,
        timeOffset: 0
      }
    });

    if (error) {
      console.error('Next train fetch error', error);
      setErrorMessage('We could not load live train data right now. Please try again.');
      setStatus('error');
      return;
    }

    setData(response);
    setStatus('success');
  }, [data, settings.maxDurationMins, settings.timeWindowMins]);

  useEffect(() => {
    fetchNextTrain();

    const intervalMs = settings.refreshIntervalSec * 1000;
    const timer = window.setInterval(fetchNextTrain, intervalMs);

    return () => window.clearInterval(timer);
  }, [fetchNextTrain, settings.refreshIntervalSec]);

  const updateSetting = (key) => (event) => {
    const rawValue = Number(event.target.value);

    setSettings((current) => {
      if (key === 'maxDurationMins') {
        return {
          ...current,
          maxDurationMins: clampNumber(rawValue, 10, 180, DEFAULT_SETTINGS.maxDurationMins)
        };
      }

      if (key === 'timeWindowMins') {
        return {
          ...current,
          timeWindowMins: clampNumber(rawValue, 10, 360, DEFAULT_SETTINGS.timeWindowMins)
        };
      }

      return {
        ...current,
        refreshIntervalSec: clampNumber(rawValue, 10, 120, DEFAULT_SETTINGS.refreshIntervalSec)
      };
    });
  };

  const nextService = data?.next || null;
  const alternatives = data?.alternatives || [];

  const lastUpdated = useMemo(() => {
    if (!data?.generatedAt) return null;
    const date = new Date(data.generatedAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [data?.generatedAt]);

  return (
    <div className="px-4 pb-32 pt-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-text-muted text-xs font-semibold uppercase tracking-wide">
          <Train size={14} />
          Next train
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Weybridge → London Waterloo</h1>
        <p className="text-text-muted text-sm">
          Fast services only, filtered by journey time. Refreshes every {settings.refreshIntervalSec} seconds.
        </p>
      </header>

      <section className="bg-surface-card border border-border-subtle rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">Settings</h2>
          <span className="text-xs text-text-muted">Saved on this device</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Max duration (mins)
            <input
              type="number"
              min={10}
              max={180}
              value={settings.maxDurationMins}
              onChange={updateSetting('maxDurationMins')}
              className="border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary bg-surface-base"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Time window (mins)
            <input
              type="number"
              min={10}
              max={360}
              value={settings.timeWindowMins}
              onChange={updateSetting('timeWindowMins')}
              className="border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary bg-surface-base"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Refresh interval (secs)
            <input
              type="number"
              min={10}
              max={120}
              value={settings.refreshIntervalSec}
              onChange={updateSetting('refreshIntervalSec')}
              className="border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary bg-surface-base"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Next eligible departure</h2>
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock size={12} />
              Updated {lastUpdated}
            </div>
          )}
        </div>

        {status === 'loading' && !data ? (
          <div className="space-y-3">
            <div className="h-28 bg-surface-card border border-border-subtle rounded-2xl animate-pulse" />
            <div className="h-12 bg-surface-card border border-border-subtle rounded-2xl animate-pulse" />
          </div>
        ) : status === 'error' ? (
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 text-center space-y-3">
            <AlertTriangle className="mx-auto text-brand-accent" size={32} />
            <p className="text-text-secondary text-sm">{errorMessage}</p>
            <button
              onClick={fetchNextTrain}
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-full"
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          </div>
        ) : nextService ? (
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase">Scheduled departure</p>
                <p className="text-2xl font-bold text-text-primary">{formatTimeValue(nextService.std)}</p>
                <p className="text-sm text-text-secondary">Expected: {formatTimeValue(nextService.etd)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-text-muted uppercase">Platform</p>
                <p className="text-lg font-bold text-text-primary">{formatTimeValue(nextService.platform)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-surface-muted rounded-xl p-3">
                <p className="text-xs font-semibold text-text-muted uppercase">Arrival (scheduled)</p>
                <p className="font-semibold text-text-primary">{formatTimeValue(nextService.scheduledArrival)}</p>
                <p className="text-xs text-text-secondary">Expected: {formatTimeValue(nextService.expectedArrival)}</p>
              </div>
              <div className="bg-surface-muted rounded-xl p-3">
                <p className="text-xs font-semibold text-text-muted uppercase">Duration</p>
                <p className="font-semibold text-text-primary">{formatDurationMinutes(nextService.scheduledDurationMins)}</p>
                <p className="text-xs text-text-secondary">Max {settings.maxDurationMins} mins</p>
              </div>
              <div className="bg-surface-muted rounded-xl p-3">
                <p className="text-xs font-semibold text-text-muted uppercase">Operator</p>
                <p className="font-semibold text-text-primary">{formatTimeValue(nextService.operator)}</p>
                <p className="text-xs text-text-secondary">{nextService.isCancelled ? 'Cancelled' : 'Running'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 text-center space-y-2">
            <p className="text-text-secondary text-sm">No eligible trains were found in the next {settings.timeWindowMins} minutes.</p>
            {data?.note && <p className="text-xs text-text-muted">{data.note}</p>}
          </div>
        )}

        {alternatives.length > 0 && (
          <details className="bg-surface-card border border-border-subtle rounded-2xl p-4">
            <summary className="cursor-pointer text-sm font-semibold text-text-primary">Other eligible trains</summary>
            <div className="mt-3 space-y-3">
              {alternatives.map((service) => (
                <div key={service.serviceId || `${service.std}-${service.scheduledArrival}`} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-text-primary">{formatTimeValue(service.std)} → {formatTimeValue(service.scheduledArrival)}</p>
                    <p className="text-xs text-text-muted">{formatDurationMinutes(service.scheduledDurationMins)} · {formatTimeValue(service.operator)}</p>
                  </div>
                  <div className="text-right text-xs text-text-muted">
                    Platform {formatTimeValue(service.platform)}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {status === 'refreshing' && (
          <p className="text-xs text-text-muted flex items-center gap-1">
            <RefreshCcw size={12} className="animate-spin" />
            Refreshing…
          </p>
        )}
      </section>
    </div>
  );
};

export default NextTrain;
