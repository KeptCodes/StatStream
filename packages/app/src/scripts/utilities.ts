export const getSessionId = `
  const getSessionId = () => {
    const sessionKey = "statstream_session";
    let sessionId = localStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = "ss-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(sessionKey, sessionId);
    }
    return sessionId;
  };
`;

export const getDeviceInfo = `
  const getDeviceInfo = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  });
`;
