---
sidebar_position: 1
---

# Analytics Studio Setup

StatStream's **Analytics Studio** is a powerful tool that helps you manage and monitor your website's analytics data. It provides an intuitive interface for viewing your tracked data and configuring settings to tailor the analytics to your needs. Follow these steps to set up **Analytics Studio** and get started.

---

## Getting Started with Analytics Studio

### Step 1: Accessing the Studio

1. **Vist Studio Website (beta)**:
   - Go to the StatStream Studio web portal [Here](https://statstream.pages.dev)

## Step 2: Getting Your Studio Key and Server URL

To access the Analytics Studio and integrate it with your website’s data, you need to get the **Studio Key** and **Server URL**. Here's how:

### Get the Studio Key

1. **Log in to the Dashboard where you self hosted Statstream Tracking App**.
2. In the enviromnet variables, add Studio Key **`STUDIO_API_KEY`** with your secret key you can generate that from [Random Keygen](https://randomkeygen.com/).
3. **Copy the Studio Key and Save Env variables** redeploy your site.
4. Default **STUDIO_API_KEY** is `studio-api-key`

### Get the Server URL

The **Server URL** is the endpoint where your website's data is sent. Here's how to find it:

1. Copy the **Server URL** of the deployed Statstream Tracking App.

This URL will be used to send and receive data from StatStream’s API, allowing Analytics Studio to retrieve the tracked data from your website.

---

## Step 3: Configuring Analytics Studio

Once you have your Studio Key and Server URL, follow these steps to set up your Analytics Studio:

1. **Enter the Studio Key**:

   - In the Analytics Studio interface, locate the field for the **Studio Key**.
   - Paste the copied Studio Key here.

2. **Enter the Server URL**:

   - In the corresponding field for **Server URL**, paste the URL you copied in Step 2.

3. **Test the Connection**:

   - Once both the Studio Key and Server URL are entered, click the "Save" button to ensure that Analytics Studio can connect to your server.

## Step 4: Visualizing Your Data

With the Analytics Studio set up, you can now access and visualize your website's analytics:

- **Monitor Traffic**: View total page views, unique sessions, and more.
- **Top Pages**: Track the most visited pages on your site.
- **Referrers**: See where your visitors are coming from (e.g., search engines, social media).
- **Geolocation**: Get insights into the geographical distribution of your visitors.

---

If you encounter any issues during setup, here are some common solutions:

- **Invalid Studio Key or Server URL**: Double-check that both the Studio Key and Server URL are entered correctly. Ensure there are no extra spaces or typos.
- **Connection Issues**: If you are unable to connect, verify that your internet connection is stable and that StatStream’s servers are up and running. You can check the StatStream status page for any ongoing issues.
- **Data Not Showing**: Ensure that your website is properly sending data to the StatStream server. Check your integration settings on the website to confirm that tracking is enabled.
- **Raise Issue**: You can raise issue on GitHub [StatStream](https://github.com/KeptCodes/StatStream)

## Conclusion

Now that you've set up Analytics Studio, you're ready to start tracking and visualizing your website's analytics data. The Analytics Studio offers powerful tools for understanding your visitors' behavior and making data-driven decisions for your website.

Stay tuned for updates as we continue to enhance Analytics Studio with more features and insights! 🚀

---
