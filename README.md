<p align="center">
  <img src="public/icons/logo-github.svg" width="120" alt="PaperKnife Logo">
</p>

# PaperKnife (Upgraded Version)

**A simple, honest PDF utility that respects your privacy.**

[![License](https://img.shields.io/badge/license-AGPL--3.0-rose.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Sonu-debug-ui/PaperKnife-Upgraded?style=flat&color=rose)](https://github.com/Sonu-debug-ui/PaperKnife-Upgraded/stargazers)
[![Web App](https://img.shields.io/badge/web-live-emerald.svg)](https://Sonu-debug-ui.github.io/PaperKnife-Upgraded/)
[![Android App](https://img.shields.io/badge/android-apk-blue.svg)](https://github.com/Sonu-debug-ui/PaperKnife-Upgraded/releases/latest)

---

## Preview

<p align="center">
  <img src="assets/preview/screenshot1.jpg" width="45%" alt="Web View">
  <img src="assets/preview/screenshot2.jpg" width="45%" alt="Android View">
</p>

---

## Upgraded Fork Enhancements 🚀

This is an upgraded, fully maintained fork of PaperKnife which resolves compilation issues, updates Android build parameters, and fixes deployment pipelines for a flawless experience:

### 📱 Android Platform & SDK Upgrades
- **Android 36 Target**: Upgraded `compileSdkVersion` and `targetSdkVersion` to **36** to ensure complete compatibility with Google Play Store modern requirements.
- **Kotlin Type Safety Fixes**: Patched Kotlin compilation type safety issues (null-safety string mismatches) in `@capacitor/filesystem` plugin dependency.
- **Asset & Splash Screen Fixes**: Adjusted `.gitignore` patterns and missing splash assets to allow successful compilation out-of-the-box.

### 🌐 Web & CI/CD Pipelines
- **Subpath Landing Fix**: Solved the blank homepage issue caused by asset subpath routing mismatch on GitHub Pages.
- **Automated GitHub Release Pipeline**: Added a secure GitHub Actions workflow that:
  - Compiles both **Full (OCR)** and **Lite** APK variants.
  - Automatically signs both APK files using secure repository secrets.
  - Publishes a structured GitHub Release complete with automated version comparison tables and privacy disclaimers.

---

### Why I built this

Most PDF websites ask you to upload your sensitive documents—bank statements, IDs, contracts—to their servers. Even if they promise to delete them, your data still leaves your device and travels across the internet.

I built **PaperKnife** to solve this. It's a collection of tools that run entirely in your browser or on your phone. Your files never leave your memory, they aren't stored in any database, and no server ever sees them. It works 100% offline.

### What it can do

*   **Modify:** Merge multiple files, split pages, rotate, and rearrange.
*   **Optimize:** Reduce file size with different quality presets.
*   **Secure:** Encrypt files with passwords or remove them locally.
*   **Convert:** Convert between PDF and images (JPG/PNG) or plain text.
*   **Sign:** Add an electronic signature to your documents safely.
*   **Sanitize:** Deep clean metadata (like Author or Producer) to keep your files anonymous.

### How to use it

*   **On Android:** Download the [latest APK](https://github.com/Sonu-debug-ui/PaperKnife-Upgraded/releases/latest) or get it from:

[<img src="https://gitlab.com/IzzyOnDroid/repo/-/raw/master/assets/IzzyOnDroidButtonGreyBorder_nofont.png" height="80" alt="Get it at IzzyOnDroid">](https://apt.izzysoft.de/packages/com.paperknife.app)

*   **On the Web:** Visit the [live site](https://Sonu-debug-ui.github.io/PaperKnife-Upgraded/). You can use it like any other website, or "install" it as a PWA for offline access.

---

### Support the project

PaperKnife is a solo project. It's open-source, ad-free, and tracker-free because I believe privacy is a right, not a luxury.

If this tool has saved you time or kept your data safe, please consider:
*   **Sponsoring:** Support development via [GitHub Sponsors](https://github.com/sponsors/potatameister).
*   **Giving a Star:** It helps other people find the project.
*   **Spreading the word:** Share it with anyone who handles sensitive documents.

---

### Under the hood

PaperKnife is built with **React** and **TypeScript**. The core processing is handled by **pdf-lib** and **pdfjs-dist**, which run in a sandboxed environment using WebAssembly. The Android version is powered by **Capacitor**.

This project is licensed under the **GNU AGPL v3** to ensure it remains open and transparent forever.

---
*Made with care by [potatameister](https://github.com/potatameister) (Fork Upgrades maintained by [Sonu-debug-ui](https://github.com/Sonu-debug-ui))*
