---
sidebar_position: 4
---

# Manage Website to track

To start tracking your website's analytics using StatStream, follow these steps to register your website through the `add-sites` Discord channel and integrate the tracking script into your website.

---

## Step 1: Register Your Website in the Discord Channel

### Prerequisites

Ensure that:

- Your **StatStream Discord Bot** is up and running.
- You have configured the bot with your **Discord Server ID**.
- The bot has permissions to create and manage buttons and forms in the `add-sites` channel.

### Using the `add-sites` Channel

1. Navigate to the `#add-sites` channel in your Discord server.

2. You will see three buttons presented by the StatStream bot:

   - **Add New Site**
   - **Edit Existing Site**
   - **Delete Site**

Like this example

![three buttons presented by the StatStream bot](https://github.com/user-attachments/assets/44fc05d7-eae5-4c5f-b5bf-7fe157b440c0)

#### Adding a New Site

1. Click the **Add New Site** button.  
   The bot will display a form in the channel with the following fields:

   - **Site Name**: Enter the name of your website (e.g., "MyCoolWebsite").
   - **Site URL**: Provide the full URL of your website (e.g., `https://mycoolwebsite.com`).
   - **Description**: Optionally, add a brief description of your site.

![bot will display a form in the channel](https://github.com/user-attachments/assets/79c8a6e3-63f7-4842-a321-2570a1dbeb79)

2. Fill out the form and submit it.  
   The bot will confirm the registration with a message like:

![bot will confirm the registration with a message image](https://github.com/user-attachments/assets/61961832-ce81-4196-ad9d-4eb653ba24ed)

#### Editing an Existing Site

1. Click the **Edit Existing Site** button.
2. A dropdown will appear with a list of previously registered websites. Select the site you want to edit.
3. Update the **Site Name**, **Site URL**, or **Description** in the form displayed by the bot.
4. Submit the form. The bot will confirm with:

   ```
   Website 'MyCoolWebsite' updated successfully!
   ```

#### Deleting a Site

1. Click the **Delete Site** button.
2. A dropdown will appear with a list of registered websites. Select the site you want to delete.
3. Confirm the deletion. The bot will respond with:

   ```
   Website 'MyCoolWebsite' has been removed.
   ```

---

## Step 2: Add the Tracker Script to Your Website

### Why Add a Tracker Script?

The tracker script collects website analytics data (e.g., page views, user sessions) and sends it to your StatStream backend, which then reports it to your Discord channel.

---

### Option 1: Add Script from Hosted URL

StatStream provides a hosted version of the tracker script for easy integration. You can add it to your website using the `<script>` tag.

1. Add the following line to the `<head>` or `<body>` section of your website's HTML file:

   ```html
   <script src="https://your-statstream-url.com/scripts/tracker"></script>
   ```

2. Replace `https://your-statstream-url.com/scripts/tracker` with the actual URL where the tracker script is hosted on your StatStream server.

3. The hosted script will automatically handle events like page views, session tracking, and device information.

---

### Option 2: Add Manual Script with POST Request

For greater customization or if you prefer to embed the script directly, you can use the following tracker script that sends data using the specified schema.

#### Tracker Script

1. Copy and paste the following script into your website:

   ```html
   <script>
     (function () {
       const generateSessionId = () =>
         "_" + Math.random().toString(36).substr(2, 9);

       const statStream = {
         sessionId:
           localStorage.getItem("statStreamSessionId") || generateSessionId(),

         sendEvent: function (eventType, additionalData) {
           const deviceInfo = {
             language: navigator.language,
             platform: navigator.platform,
             userAgent: navigator.userAgent,
           };

           const payload = {
             eventType,
             page: document.title,
             referrer: document.referrer,
             sessionId: this.sessionId,
             timestamp: new Date().toISOString(),
             url: window.location.href,
             deviceInfo,
             additionalData,
           };

           fetch("https://your-statstream-url.com/api/track", {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
             },
             body: JSON.stringify(payload),
           }).catch((err) => console.error("Failed to send event", err));
         },
       };

       // Store session ID locally
       localStorage.setItem("statStreamSessionId", statStream.sessionId);

       // Example: Track page views
       statStream.sendEvent("page_view");
     })();
   </script>
   ```

2. Replace `https://your-statstream-url.com/api/track` with your **StatStream server's URL**.

3. Customize the script to send additional data by modifying the `additionalData` parameter.

---

### Schema for POST Request Payload

The tracker script uses the following schema for the data sent to the server:

```javascript
export const TrackedDataSchema = z.object({
  eventType: z.string(), // Type of the event (e.g., 'page_view', 'click')
  page: z.string(), // Title of the current page
  referrer: z.string(), // Referring URL, if any
  sessionId: z.string(), // Unique session ID
  timestamp: z.string(), // Timestamp of the event
  url: z.string(), // Current page URL
  deviceInfo: z.object({
    // Information about the user's device
    language: z.string(), // Browser language
    platform: z.string(), // OS platform
    userAgent: z.string(), // Browser user agent
  }),
  additionalData: z.any().optional(), // Optional: Additional data for custom events
});
```

---

### Testing the Script

1. Open your website in a browser.
2. Perform actions like navigating to pages or interacting with elements.
3. Check the Discord channel for analytics updates sent by StatStream.

---

## Notes on Security

- Use HTTPS for your API endpoint to protect transmitted data.
- Restrict access to your API endpoint using server-side validation or API keys.
- Regularly monitor the usage of your tracker to ensure it works as intended.

---

With these two options, you can easily integrate StatStream's tracking capabilities into your website, depending on your technical requirements and preferences.
