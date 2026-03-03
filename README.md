# Parcello

<div align="center">
  <img src="public/favicon.svg" alt="Parcello Logo" width="120" height="120">
  <p><em>Self-hostable package tracking web app</em></p>

![Build Status](https://github.com/YOUR_USERNAME/parcello/workflows/Deploy%20to%20Cloudflare%20Pages/badge.svg)

</div>

---

## 📦 About

Parcello is a self-hostable package tracking application that lets you monitor all your shipments in one place. No login required — just bring your own tracking API key.

**Features:**

- 📍 Track packages from multiple carriers
- 🗺️ Interactive maps showing shipment locations
- 🌓 Beautiful dark/light mode with warm, earthy design
- 🔐 Client-side encryption for API keys
- 🚀 Deploy to Cloudflare Pages or self-host
- 📱 Fully responsive mobile-first design

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or higher
- [pnpm](https://pnpm.io/) package manager

### Local Development

1. **Clone the repository**

    ```bash
    git clone https://github.com/YOUR_USERNAME/parcello.git
    cd parcello
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

3. **Set up environment variables**

    ```bash
    cp .dev.vars.example .dev.vars
    ```

    Edit `.dev.vars` and add your encryption salt:

    ```bash
    # Generate a salt
    openssl rand -hex 32
    ```

4. **Run the development server**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:4321](http://localhost:4321) in your browser.

5. **Run tests** (optional)
    ```bash
    pnpm test
    ```

---

## 🏗️ Build for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

---

## 📄 License

MIT

---

<div align="center">
  Made with ❤️ and 📦
</div>
