---
sidebar_position: 1
---

# Accessing the Tracked Data

StatStream provides an API to access your website's analytics data in a structured JSON format. While a full-featured UI dashboard is under development, you can use the existing API to monitor your tracked data.

---

## Access the Analytics API

The analytics data for your tracked websites can be accessed using the following API route:

### Endpoint

```plaintext
GET /api/analytics
```

### Example Response

Here’s an example of the JSON response from the API:

```json
{
  "site_name": {
    "totalEvents": 50,
    "uniqueSessions": 1,
    "pageViews": {
      "/blogs": 16,
      "/": 34
    },
    "referrers": {
      "https://google.com/": 34
    },
    "locations": {
      "Delhi, India": 50
    }
  }
}
```

### Explanation of the Data

- **totalEvents**: Total number of events tracked for the website.
- **uniqueSessions**: The number of unique user sessions.
- **pageViews**: A breakdown of views for each page on your website.
- **referrers**: A list of referring URLs and their corresponding event counts.
- **locations**: Geographical data about users, where available. (`Delhi, India` indicates location data.)

---

## Viewing Data Locally

### Steps to Test the API

1. Ensure your StatStream server is running.
2. Use a tool like `curl`, Postman, or your browser to access the endpoint.

   Example with `curl`:

   ```bash
   curl http://your-statstream-url.com/api/analytics
   ```

3. The JSON response will display the tracked analytics data.

---

## What’s Next?

🚨 **Exciting News!**

We are actively working on:

- **Enhanced APIs**: With better data aggregation and more detailed insights.
- **UI Dashboard**: A visually intuitive dashboard for monitoring your analytics.

These features will be available soon, making it easier than ever to track and analyze your website's data.

Stay tuned for updates! 🚀

---

## Feedback and Suggestions

We value your input! If you have feature requests or suggestions for improving StatStream, please let us know in the [GitHub Repository](https://github.com/KeptCodes/StatStream).
