# Complete Domain & SSL Setup Guide for `getgocal.com` (Squarespace + AWS EC2)

This guide provides step-by-step instructions for configuring your domain **`getgocal.com`** purchased from **Squarespace** (integrated with Google Workspace) to point to your **AWS EC2 server (`98.85.34.11`)**, setting up Nginx reverse proxies, generating free Let's Encrypt SSL/TLS certificates, and enforcing HTTPS across all routes.

---

## 🎯 Target Architecture Overview

| Domain / Subdomain | Target Server Port | Purpose | Protocols Supported |
| :--- | :--- | :--- | :--- |
| `getgocal.com` | `http://127.0.0.1:3000` | Landing Page & Web Admin Dashboard | `http://`, `https://` |
| `www.getgocal.com` | `http://127.0.0.1:3000` | Landing Page & Web Admin Dashboard (`www` alias) | `http://`, `https://` |
| `backend.getgocal.com` | `http://127.0.0.1:5000` | Express REST API Backend | `http://`, `https://` |

- **EC2 Elastic Public IP**: `98.85.34.11`
- **Reverse Proxy**: Nginx
- **SSL Authority**: Let's Encrypt (Certbot)
- **Domain Registrar / DNS**: Squarespace (Google Workspace Managed)

---

## 📋 Step 1: Squarespace Panel Configuration

Based on your current Squarespace setup, follow the exact instructions for each section of the Squarespace Domains Panel:

```
Squarespace Domains Menu
 ├── DNS Settings (⚠️ Main Action Area)
 ├── Domain Nameservers (Keep Default)
 ├── Nameserver Registration (Keep Empty)
 └── DNSSEC (Keep Enabled)
```

---

### 1.1 `DNS Settings` Configuration (CRITICAL STEP)

1. Log in to **Squarespace** -> Go to **Domains** -> Select **`getgocal.com`** -> Click **DNS Settings**.
2. Notice the warning banner: *"This domain is managed by Google Workspace"*.

> [!CAUTION]
> **DO NOT DELETE** the `Custom records` (Google DKIM & SPF TXT records) or the `Google records` (Google MX records `smtp.google.com`). Deleting those will break your **Google Workspace email (`support@getgocal.com`)**.

#### A. Remove Squarespace Defaults
- Locate the **Squarespace Defaults** card at the top.
- Click the **Red Trash Icon (🗑️)** in the top-right corner of the *Squarespace Defaults* section to delete the 4 default Squarespace A records (`198.185.159.144`, `198.185.159.145`, etc.), the default `www` CNAME record (`ext-sq.squarespace.com`), and the default `HTTPS` record.

#### B. Add Custom Records for AWS EC2
Scroll down to the **Custom records** section and click the **`ADD RECORD`** button to create the following 3 records:

| Record 1: Root Domain (`getgocal.com`) | Value |
| :--- | :--- |
| **Type** | `A` |
| **Host / Name** | `@` |
| **Data / Points to** | `98.85.34.11` |
| **TTL** | `1 hr` (or `300` seconds / `Default`) |

| Record 2: WWW Subdomain (`www.getgocal.com`) | Value |
| :--- | :--- |
| **Type** | `CNAME` (or `A`) |
| **Host / Name** | `www` |
| **Data / Points to** | `getgocal.com` (or `98.85.34.11` if using `A`) |
| **TTL** | `1 hr` (or `300` seconds / `Default`) |

| Record 3: Backend API Subdomain (`backend.getgocal.com`) | Value |
| :--- | :--- |
| **Type** | `A` |
| **Host / Name** | `backend` |
| **Data / Points to** | `98.85.34.11` |
| **TTL** | `1 hr` (or `300` seconds / `Default`) |

#### C. Summary of Final Records in `DNS Settings`
After editing, your **DNS Settings** page should contain:
- [x] **Custom records (A)**: `@` -> `98.85.34.11`
- [x] **Custom records (CNAME)**: `www` -> `getgocal.com`
- [x] **Custom records (A)**: `backend` -> `98.85.34.11`
- [x] **Custom records (TXT)**: `google_domainkey` (Kept for Google Workspace)
- [x] **Custom records (TXT)**: `@` `v=spf1 include:_spf.google.com ~all` (Kept for Google Workspace)
- [x] **Google records (MX)**: `smtp.google.com` (Kept for Google Workspace email)

---

### 1.2 `Domain Nameservers` (Keep Default)
- Ensure the default Squarespace nameservers are active:
  - `nse1.squarespacedns.com`
  - `nse2.squarespacedns.com`
  - `nse3.squarespacedns.com`
  - `nse4.squarespacedns.com`
- **Do NOT click** *"USE CUSTOM NAMESERVERS"*.

---

### 1.3 `Nameserver Registration` (Keep Empty)
- No action needed. It should display *"No host records"* (default state).

---

### 1.4 `DNSSEC` (Keep Enabled)
- `DNS Security Extensions (DNSSEC)` should remain **Enabled (ON green toggle)** as shown in your current panel.

---

### 🔍 Verification of DNS Propagation
DNS changes may take anywhere from 2 minutes up to a few hours to propagate globally. You can verify DNS resolution using `nslookup` in your command line:

```bash
nslookup getgocal.com
nslookup www.getgocal.com
nslookup backend.getgocal.com
```

All three domains should resolve to `98.85.34.11`.

---

## 🛡️ Step 2: AWS EC2 Security Group Configuration

Ensure that Port `80` (HTTP) and Port `443` (HTTPS) are open in your AWS EC2 Security Group.

1. Log in to the **AWS Management Console**.
2. Navigate to **EC2** -> **Instances** -> Select your instance (`98.85.34.11`).
3. Click the **Security** tab -> Click on the attached **Security Group**.
4. Click **Edit Inbound Rules** and add the following rules if missing:

| Type | Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Allow web traffic for SSL validation |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | Allow encrypted HTTPS web traffic |
| **SSH** | TCP | `22` | `My IP` or `0.0.0.0/0` | Admin SSH Access |

5. Click **Save Rules**.

---

## ⚙️ Step 3: Nginx & Certbot Configuration on AWS EC2

Connect to your EC2 instance via SSH:

```bash
ssh -i /path/to/your-key.pem ubuntu@98.85.34.11
```

### 3.1 Install Nginx & Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

### 3.2 Create Nginx Virtual Host Configuration

Create a new Nginx configuration file for `getgocal`:

```bash
sudo nano /etc/nginx/sites-available/getgocal
```

Paste the following configuration:

```nginx
# 1. Main Website & Admin Dashboard (getgocal.com & www.getgocal.com)
server {
    listen 80;
    server_name getgocal.com www.getgocal.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 2. REST API Backend (backend.getgocal.com)
server {
    listen 80;
    server_name backend.getgocal.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

### 3.3 Enable Configuration & Test Nginx

```bash
# Link to sites-enabled
sudo ln -sf /etc/nginx/sites-available/getgocal /etc/nginx/sites-enabled/

# Remove default nginx site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 4: Issue Free SSL Certificates via Certbot

Run Certbot to generate Let's Encrypt SSL certificates for all 3 domain names. Certbot will automatically configure HTTPS listeners and HTTP-to-HTTPS redirects in your Nginx config.

```bash
sudo certbot --nginx -d getgocal.com -d www.getgocal.com -d backend.getgocal.com
```

### Certbot Prompts:
1. **Email Address**: Enter your administrative email (e.g. `support@getgocal.com`).
2. **Terms of Service**: Type `Y` and press `Enter`.
3. **Share Email**: Type `N` or `Y`.
4. **Redirect HTTP to HTTPS**: Choose **Option 2** (Redirect all traffic to HTTPS).

---

### 🔄 Test Automatic Certificate Renewal
Let's Encrypt certificates are valid for 90 days. Certbot installs a systemd timer for automatic renewal. Test renewal with:

```bash
sudo certbot renew --dry-run
```

---

## 🌐 Step 5: Post-Domain Setup Environment Updates

Once the domain and SSL certificates are active, update the API endpoints in your project configurations:

### 1. Web Admin Dashboard & Landing Page (`ramsai_web/.env`)
```env
VITE_API_URL=https://backend.getgocal.com/api
```

### 2. Backend Express App (`ramsai_backend/.env`)
```env
ALLOWED_ORIGINS=https://getgocal.com,https://www.getgocal.com,http://localhost:3000
```

### 3. Flutter Mobile App (`ramsai/lib/core/constants/api_constants.dart` or `api_service.dart`)
```dart
static const String baseUrl = 'https://backend.getgocal.com/api';
```

---

## ✅ Step 6: Verification Matrix

After completing the steps above, test all required URLs in your browser:

| URL | Expected Behavior |
| :--- | :--- |
| `http://getgocal.com` | Redirects (`301`) to `https://getgocal.com` |
| `http://www.getgocal.com` | Redirects (`301`) to `https://www.getgocal.com` |
| `http://backend.getgocal.com` | Redirects (`301`) to `https://backend.getgocal.com` |
| `https://getgocal.com` | Displays Web Admin Dashboard & Landing Page (Port 3000) with SSL Lock 🔒 |
| `https://www.getgocal.com` | Displays Web Admin Dashboard & Landing Page (Port 3000) with SSL Lock 🔒 |
| `https://backend.getgocal.com/health` | Returns `{"status":"UP"}` JSON response (Port 5000) with SSL Lock 🔒 |
