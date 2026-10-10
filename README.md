[README (1).md](https://github.com/user-attachments/files/33280985/README.1.md)
# ContextShield AI — Your AI Privacy Firewall

<p align="center">
  <img src="public/ContextShield AI.jpg" alt="ContextShield AI logo" width="720" />
</p>

<p align="center"><strong>Know what you're revealing before AI sees it.</strong></p>

<p align="center">
  <a href="https://contextshield-ai-73aj.bolt.host/">Live Demo</a> ·
  <a href="https://github.com/s333s/ContextShield-AI">Source Code</a>
</p>

## What is ContextShield AI?

ContextShield AI is a privacy firewall for AI prompts. It helps people notice when a prompt includes more personal information than the task requires—before sharing it with an AI chatbot.

Scan a prompt, review its estimated privacy exposure, understand the categories of information detected, and prepare a safer version.

## Features

- **Prompt scanning** for potentially sensitive information
- **Privacy categories** such as direct identifiers, location, personal context, and sensitive context
- **Privacy Exposure Score** to make possible exposure easier to understand
- **Safer prompt workflow** to help reduce unnecessary personal details
- **Dashboard** with anonymized local statistics
- **Local-first analysis** using browser-side patterns and heuristic rules in demo mode
- **User controls** to manage scanning and clear locally stored statistics
- **Privacy transparency** that explains when an optional external AI provider is used

## How it works

```text
Write or paste a prompt
        ↓
Scan in the browser
        ↓
Detect possible sensitive details
        ↓
Review categories and exposure score
        ↓
Create a safer version
        ↓
Review and send it yourself
```

## Privacy approach

In demo/local mode, prompts are analyzed in the browser using regular expressions and heuristic rules. The app's stated design stores anonymized counts and averages locally rather than raw prompt text.

If external AI analysis is enabled in a deployment, prompt content may be sent to the configured provider for contextual analysis. Review the in-app privacy policy and settings before enabling external processing. The exposure score is an estimate, not a guarantee of privacy or a legal assessment.

## Try the demo

**Live application:** https://contextshield-ai-73aj.bolt.host/

Suggested test cases include student requests, job applications, medical appointment emails, financial assistance requests, and travel planning prompts. Use fictional details rather than your real sensitive information when testing.

## Run locally

### Requirements

- Node.js
- npm

### Setup

```bash
git clone https://github.com/s333s/ContextShield-AI.git
cd ContextShield-AI
npm install
npm run dev
```

Use the local URL printed by Vite in the terminal to open the app.

To create a production build:

```bash
npm run build
npm run preview
```

## Browser extension

The repository also contains an `extension/` directory. Check its own package scripts and setup notes before loading or building the extension; the web app's commands above run the Vite website.

## Built with

React · TypeScript · Vite · Tailwind CSS · Lucide React · Browser APIs · LocalStorage · Regular Expressions · Heuristic Detection

## Project links

- **Live demo:** https://contextshield-ai-73aj.bolt.host/
- **GitHub:** https://github.com/s333s/ContextShield-AI
- **Youtube vedio:** [YouTube Vedio](https://youtu.be/e7kOp-VXkc8?si=Xa-Ru3RaXCl9U45W)
---

<p align="center"><strong>Give AI exactly what it needs — and nothing more.</strong></p>
