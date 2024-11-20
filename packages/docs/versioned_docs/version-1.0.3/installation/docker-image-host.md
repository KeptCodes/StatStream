---
sidebar_position: 3
---

# Self-Hosting on the Cloud

StatStream can be self-hosted on your preferred cloud platform using its Docker image. This setup ensures that you have full control over your analytics data while leveraging the power of the cloud. Follow the steps below to deploy StatStream, including a free option using Render.com.

---

## 1. **Pull the Official Docker Image**

The official Docker image for StatStream is available on Docker Hub. Use the following command to pull the latest version:

```bash
docker pull priyanshudev/statstream:latest
```

---

## 2. **Free Hosting Option: Render.com**

Render.com offers a free tier for hosting services. Follow these steps to deploy StatStream:

1. **Sign Up on Render.com**:

   - Go to [Render.com](https://render.com/) and sign up for a free account.
   - Verify your email to activate your account.

2. **Create a New Web Service**:

   - Click **New +** in the Render dashboard and select **Web Service**.
   - Choose **Docker** as the environment type.

3. **Configure the Service**:

   - Set **Name**: e.g., `statstream`.
   - **Region**: Select a region close to your users.
   - **Docker Image**: Enter:
     ```bash
     priyanshudev/statstream:latest
     ```
   - Add environment variables (e.g., `DISCORD_TOKEN`, `DISCORD_GUILD_ID`) in the **Environment Variables** section or upload a `.env` file.

4. **Deploy**:
   - Click **Create Web Service** to start deployment. Once complete, your StatStream app will be live at a public URL (e.g., `https://statstream-online.onrender.com`).

---

## 3. **Hosting on AWS EC2**

### Step 1: Launch an EC2 Instance

- Log in to [AWS Management Console](https://aws.amazon.com/console/).
- Launch a new EC2 instance using an **Ubuntu** AMI.
- Choose `t2.micro` for free-tier hosting or larger instance types for heavy traffic.

### Step 2: Install Docker

- Connect to the instance via SSH and run:
  ```bash
  sudo apt update
  sudo apt install -y docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

### Step 3: Run StatStream

- Pull the Docker image:
  ```bash
  docker pull priyanshudev/statstream:latest
  ```
- Create a `.env` file with your configuration and start the container:
  ```bash
  docker run -d -p 80:3000 --env-file .env priyanshudev/statstream:latest
  ```

---

## 4. **Deploying to Other Cloud Platforms**

### Google Cloud (GCP)

- Create a VM instance using Compute Engine.
- Install Docker and follow the same steps as AWS to run the container.

### Microsoft Azure

- Deploy a Virtual Machine using Azure’s VM service.
- Install Docker and start the StatStream container.

---

## 5. **Scaling with Docker Compose**

For advanced setups, use **Docker Compose** to manage multiple services. Example `docker-compose.yml`:

```yaml
version: "3.8"
services:
  statstream:
    image: priyanshudev/statstream:latest
    ports:
      - "80:3000"
    env_file:
      - .env
    restart: always
```

Start the services with:

```bash
docker-compose up -d
```

---

## 6. **Monitoring and Logging**

- Use **Docker Stats** for resource monitoring:
  ```bash
  docker stats
  ```
- View logs to troubleshoot:
  ```bash
  docker logs -f <container_id>
  ```

---

## Key Benefits of Self-Hosting StatStream

- **Data Ownership**: Your analytics data stays private and under your control.
- **Customizable**: Tailor StatStream’s functionality to your needs.
- **Cost-Effective**: Choose cloud resources to match your budget and usage.
- **Free Hosting**: Deploy on Render.com to get started without any cost.
