# 🎬 YouTube Clone  

A fully functional **YouTube Clone** built using **HTML, CSS, JavaScript**, and **Firebase**, designed to mimic core YouTube features.  
This project dynamically fetches videos from the **YouTube Data API v3**, supports playlists, allows users to search videos, and maintains a watch history for logged-in users.  
It also features Firebase Authentication for secure user login and signup, along with Firestore for real-time database management.  

---

## 🚀 Features  
- 🎥 **Dynamic Video Fetching** – Trending videos & playlists via YouTube Data API  
- 🔍 **Search Functionality** – Search and display results instantly  
- 📜 **Watch History** – Saves watched videos for logged-in users using Firebase Firestore  
- 🔑 **Authentication** – User login & signup using Firebase Authentication  
- 📱 **Responsive Design** – Works seamlessly on desktop and mobile  
- 📂 **Playlist Support** – Embedded playlist display with easy navigation  

---

## 🛠️ Tech Stack  
| Technology      | Purpose |
|-----------------|---------|
| **HTML5**       | Page structure |
| **CSS3**        | Styling & responsiveness |
| **JavaScript (ES6)** | Dynamic content, API calls |
| **YouTube Data API v3** | Fetching videos & playlists |
| **Firebase Authentication** | User login & signup |
| **Firebase Firestore** | Watch history storage |

---

## 📷 Screenshots  
### Homepage  
![Homepage Screenshot]<img width="1919" height="932" alt="home_page" src="https://github.com/user-attachments/assets/de60d178-6794-47b6-8991-f4a7a4f06f81" />
  



## ⚙️ Installation  

### 1️⃣ Clone Repository  
```bash
git clone https://github.com/vatsshree/Youtube_Clone/tree/main
cd youtube-clone
```

### 2️⃣ Open in Browser  
Just open `index.html` in your browser, or use **Live Server** in VS Code.  

---

## 🔑 Firebase Setup  
1. Create a new project in **[Firebase Console](https://console.firebase.google.com/)**  
2. Enable **Authentication** (Email/Password)  
3. Enable **Cloud Firestore**  
4. Copy Firebase config and paste into `script.js`  
5. Make sure Firestore rules allow read/write for authenticated users  

---

## 📜 License  
This project is open-source under the **MIT License**.  
