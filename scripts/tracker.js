(function () {
  // Create a session ID if one doesn't exist
  const createSession = () => {
    const sessionId = "ss-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("statstream_session", sessionId);
    return sessionId;
  };
  const sessionId =
    localStorage.getItem("statstream_session") || createSession();

  // Get device info
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  };

  // Function to send tracking data
  const sendAnalytics = async (eventType, additionalData = {}) => {
    try {
      await fetch("http://change.url/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          page: window.location.pathname,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          sessionId,
          deviceInfo: getDeviceInfo(),
          url: window.location.origin,
          ...additionalData,
        }),
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  };

  // Track page view
  sendAnalytics("pageview");

  // Optional: Track custom events
  window.trackEvent = (eventName, eventData = {}) => {
    sendAnalytics(eventName, eventData);
  };

  // Track when user leaves the page
  window.addEventListener("beforeunload", () => {
    sendAnalytics("leave");
  });
})();
