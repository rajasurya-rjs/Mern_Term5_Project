/**
 * Keep-Alive Service
 * Prevents Render free tier from spinning down due to inactivity
 * by sending periodic self-pings to the /ping endpoint
 */

/**
 * Starts the keep-alive ping mechanism
 * @param {string} serverUrl - The URL of your deployed server (e.g., https://your-app.onrender.com)
 */
export const startKeepAlive = (serverUrl) => {
  // Only run keep-alive in production (when deployed on Render)
  if (process.env.NODE_ENV !== "production") {
    console.log("Keep-alive service disabled in development mode");
    return;
  }

  // Validate server URL
  if (!serverUrl) {
    console.warn("Keep-alive service: No server URL provided");
    return;
  }

  console.log(`Keep-alive service initialized for: ${serverUrl}`);

  // Ping interval: 5 minutes (300,000 milliseconds)
  // Render free tier spins down after 15 minutes of inactivity
  const PING_INTERVAL = 5 * 60 * 1000;

  /**
   * Sends a lightweight HTTP request to the /ping endpoint
   * Uses native fetch (available in Node.js 18+)
   */
  const sendPing = async () => {
    try {
      const response = await fetch(`${serverUrl}/ping`, {
        method: "GET",
        // Timeout after 10 seconds to prevent hanging
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        // Silent success - no console spam in production logs
        // Uncomment the line below if you want to see ping confirmations
        // console.log(`[Keep-Alive] Ping successful at ${new Date().toISOString()}`);
      } else {
        console.warn(`[Keep-Alive] Ping failed with status: ${response.status}`);
      }
    } catch (error) {
      // Log errors but don't crash the server
      // This could happen during deployments or restarts
      console.error(`[Keep-Alive] Ping error: ${error.message}`);
    }
  };

  // Send initial ping after 1 minute (give server time to fully start)
  setTimeout(() => {
    sendPing();
  }, 60000);

  // Set up recurring ping every 5 minutes
  // setInterval is non-blocking and won't interfere with other operations
  const pingInterval = setInterval(sendPing, PING_INTERVAL);

  // Store interval reference for potential cleanup
  // (though in practice, this runs for the server's lifetime)
  return pingInterval;
};
