import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';

function getVisitorId(): string {
  let id = localStorage.getItem('sc_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sc_visitor_id', id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem('sc_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('sc_session_id', id);
  }
  return id;
}

export function usePageView() {
  const { pathname } = useLocation();
  const tracked = useRef<string>('');

  useEffect(() => {
    const key = `${pathname}-${new Date().toDateString()}`;
    if (tracked.current === key) return;
    tracked.current = key;

    api.post('/analytics/track', {
      path: pathname,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
    }).catch(() => {});
  }, [pathname]);
}
