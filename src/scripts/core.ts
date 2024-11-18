export const sendAnalyticsFn = (trackingUrl: string) => `
  const sendAnalytics = async (eventType, additionalData = {}) => {
    try {
      const payload = {
        eventType,
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        sessionId,
        deviceInfo: getDeviceInfo(),
        url: window.location.origin,
        additionalData
      };

      await fetch("${trackingUrl}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  };
`;

export const trackUserBehavior = `
  // Ensure sendAnalytics is defined
  if (typeof sendAnalytics !== "function") {
    console.error("sendAnalytics is not defined.");
    return;
  }

  // Track clicks on the page
  document.addEventListener("click", (event) => {
    const target = event.target;
    const clickData = {
      tagName: target.tagName,
      id: target.id || null,
      classes: target.className || null,
      text: target.innerText ? target.innerText.slice(0, 50) : null, // Limit to 50 characters
    };
    sendAnalytics("click", clickData);
  });

  // Track scroll depth (debounced for performance)
  let maxScrollDepth = 0;
  let scrollTimeout;
  const handleScroll = () => {
    const scrollDepth =
      (window.scrollY + window.innerHeight) / document.body.scrollHeight;
    maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);

    // Debounce updates to reduce frequency
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      sendAnalytics("scroll", { maxScrollDepth });
    }, 200);
  };
  window.addEventListener("scroll", handleScroll);

  // Track form submissions
  document.addEventListener("submit", (event) => {
    const form = event.target;
    const formData = {
      action: form.action || null,
      method: form.method || null,
    };
    sendAnalytics("form_submission", formData);
  });

  // Track time spent on the page
  const pageStartTime = Date.now();
  window.addEventListener("beforeunload", () => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    sendAnalytics("time_on_page", { seconds: timeSpent, maxScrollDepth });
  });
`;
