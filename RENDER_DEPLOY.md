# Deploying DeceptiTrace to Render

This repository is fully configured for deployment on [Render](https://render.com). You can deploy either using **Render Blueprints (automatic)** or by creating the **Web Service + Static Site manually**.

---

## Method 1: Render Blueprint (Recommended — 1-Click Provisioning)

Render automatically detects the [`render.yaml`](./render.yaml) file at the root of the repository.

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository (`Orcathon`).
4. Render will detect the two services:
   - `deceptitrace-backend` (Python Web Service)
   - `deceptitrace-frontend` (Static Site)
5. Fill in the required environment variables:
   - `ADAPTION_API_KEY`: *(Optional, your Adaption API Key)*
   - `ADAPTION_PROJECT_ID`: *(Optional, your Adaption Project ID)*
   - `VITE_API_BASE_URL`: `https://deceptitrace-backend.onrender.com/api` *(or your actual backend service URL)*
6. Click **Apply**. Render will build and deploy both services automatically!

---

## Method 2: Manual Setup on Render

If you prefer to configure the services manually in the dashboard:

### Step 1: Deploy the Backend (Web Service)

1. Go to **New +** > **Web Service**.
2. Connect your repository.
3. Configure the following settings:
   - **Name**: `deceptitrace-backend`
   - **Root Directory**: `backend`
   - **Language**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `CORS_ORIGINS`: `*` *(or your frontend URL)*
   - `ADAPTION_API_KEY`: *(Optional)*
   - `ADAPTION_PROJECT_ID`: *(Optional)*
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g. `https://deceptitrace-backend.onrender.com`).

---

### Step 2: Deploy the Frontend (Static Site)

1. Go to **New +** > **Static Site**.
2. Connect your repository.
3. Configure the following settings:
   - **Name**: `deceptitrace-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://deceptitrace-backend.onrender.com/api` *(Use the backend URL from Step 1)*
5. Under **Redirects/Rewrites**:
   - Add a rewrite:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(Note: The codebase also includes `frontend/public/_redirects` which handles this automatically).*
6. Click **Create Static Site**.

---

## Compatibility Features Included

- **Dynamic Port Binding**: Backend automatically reads `$PORT` provided by Render.
- **Wildcard Render CORS**: Backend permits `*.onrender.com` origins dynamically via regex, preventing CORS blocks during deployments.
- **URL Normalization**: Frontend automatically appends `/api` and trims trailing slashes if you enter the bare backend domain in `VITE_API_BASE_URL`.
- **SPA Routing**: Single Page Application rewrite rules ensure page refreshes never return 404.
- **Health Check**: Root `/health` path provided for Render zero-downtime health checking.
