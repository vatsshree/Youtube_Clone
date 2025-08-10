const API_KEY = 'AIzaSyDSQcrsnGbvwUNqxWsYYpd7Sz53f3x-27U';
const cardContainer = document.querySelector('.card');

// Fetch channel icon
async function fetchChannelIcon(channelId) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`);
    const data = await response.json();
    return data.items?.[0]?.snippet?.thumbnails?.default?.url || '';
  } catch (e) {
    console.error('Channel icon error:', e);
    return '';
  }
}

// Format view count
function formatViewCount(viewCount) {
  const count = parseInt(viewCount);
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
  return count.toString();
}

// Format published time
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'week', secs: 604800 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ];
  for (const i of intervals) {
    const val = Math.floor(seconds / i.secs);
    if (val >= 1) return `${val} ${i.label}${val > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

// Load trending videos
async function loadVideos() {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=16&key=${API_KEY}`);
    const data = await res.json();

    cardContainer.innerHTML = '';

    for (const video of data.items) {
      const { title, thumbnails, channelTitle, publishedAt, channelId } = video.snippet;
      const videoId = video.id;
      const viewCount = video.statistics?.viewCount || 0;
      const channelIcon = await fetchChannelIcon(channelId);

      const videoEl = document.createElement('div');
      videoEl.style.width = '450px';
      videoEl.style.margin = '10px';
      videoEl.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="text-decoration: none; color: inherit;">
          <img src="${thumbnails.high?.url || thumbnails.medium?.url}" alt="${title}" style="width: 100%; border-radius: 10px;" />
          <div style="display: flex; margin-top: 10px;">
            <img src="${channelIcon}" alt="${channelTitle}" style="width: 36px; height: 36px; border-radius: 50%; margin-right: 10px;" />
            <div>
              <h3 style="font-size: 16px; margin: 0 0 5px 0; line-height: 1.2;">${title}</h3>
              <p style="margin: 0; font-size: 14px; color: gray;">${channelTitle}</p>
              <p style="margin: 0; font-size: 13px; color: gray;">${formatViewCount(viewCount)} views • ${formatTimeAgo(publishedAt)}</p>
            </div>
          </div>
        </a>
      `;

      cardContainer.appendChild(videoEl);
    }
  } catch (error) {
    console.error('Failed to load videos:', error);
    cardContainer.innerHTML = '<p>Unable to load videos.</p>';
  }
}

// Search functionality
async function searchVideos(query) {
  try {
    cardContainer.innerHTML = '';

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    if (!videoIds) return;

    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
    const videoDetailsRes = await fetch(videoDetailsUrl);
    const videoData = await videoDetailsRes.json();

    for (const video of videoData.items) {
      const { title, thumbnails, channelTitle, publishedAt, channelId } = video.snippet;
      const videoId = video.id;
      const viewCount = video.statistics?.viewCount || 0;
      const channelIcon = await fetchChannelIcon(channelId);

      const videoEl = document.createElement('div');
      videoEl.style.width = '450px';
      videoEl.style.margin = '10px';
      videoEl.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="text-decoration: none; color: inherit;">
          <img src="${thumbnails.high?.url || thumbnails.medium?.url}" alt="${title}" style="width: 100%; border-radius: 10px;" />
          <div style="display: flex; margin-top: 10px;">
            <img src="${channelIcon}" alt="${channelTitle}" style="width: 36px; height: 36px; border-radius: 50%; margin-right: 10px;" />
            <div>
              <h3 style="font-size: 16px; margin: 0 0 5px 0; line-height: 1.2;">${title}</h3>
              <p style="margin: 0; font-size: 14px; color: gray;">${channelTitle}</p>
              <p style="margin: 0; font-size: 13px; color: gray;">${formatViewCount(viewCount)} views • ${formatTimeAgo(publishedAt)}</p>
            </div>
          </div>
        </a>
      `;
      cardContainer.appendChild(videoEl);
    }
  } catch (err) {
    console.error('Search failed:', err);
    cardContainer.innerHTML = '<p>Search failed. Try again.</p>';
  }
}
// Infinite scroll logic
let nextPageToken = null;
let isLoading = false;

// Modified loadVideos to support pagination
async function loadVideos(isNextPage = false) {
  if (isLoading) return;
  isLoading = true;

  try {
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=16&key=${API_KEY}`;
    if (isNextPage && nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || null;

    if (!isNextPage) cardContainer.innerHTML = '';

    for (const video of data.items) {
      const { title, thumbnails, channelTitle, publishedAt, channelId } = video.snippet;
      const videoId = video.id;
      const viewCount = video.statistics?.viewCount || 0;
      const channelIcon = await fetchChannelIcon(channelId);

      const videoEl = document.createElement('div');
      videoEl.style.width = '450px';
      videoEl.style.margin = '10px';
      videoEl.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="text-decoration: none; color: inherit;">
          <img src="${thumbnails.high?.url || thumbnails.medium?.url}" alt="${title}" style="width: 100%; border-radius: 10px;" />
          <div style="display: flex; margin-top: 10px;">
            <img src="${channelIcon}" alt="${channelTitle}" style="width: 36px; height: 36px; border-radius: 50%; margin-right: 10px;" />
            <div>
              <h3 style="font-size: 16px; margin: 0 0 5px 0; line-height: 1.2;">${title}</h3>
              <p style="margin: 0; font-size: 14px; color: gray;">${channelTitle}</p>
              <p style="margin: 0; font-size: 13px; color: gray;">${formatViewCount(viewCount)} views • ${formatTimeAgo(publishedAt)}</p>
            </div>
          </div>
        </a>
      `;

      cardContainer.appendChild(videoEl);
    }
  } catch (error) {
    console.error('Failed to load videos:', error);
    if (!isNextPage) cardContainer.innerHTML = '<p>Unable to load videos.</p>';
  } finally {
    isLoading = false;
  }
}

// Infinite scroll event
window.addEventListener('scroll', () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
    nextPageToken &&
    !isLoading
  ) {
    loadVideos(true);
  }
});

// Run trending on load
window.onload = () => {
  nextPageToken = null;
  loadVideos();
};

// Search bar event listeners
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

if (searchInput && searchButton) {
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) searchVideos(query);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) searchVideos(query);
    }
  });
}

// Mic search functionality (non-intrusive)
const micBtn = document.getElementById('mic-btn');
if (micBtn && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  micBtn.addEventListener('click', () => {
    recognition.start();
  });

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = transcript;
      // Trigger search if searchVideos is defined
      if (typeof searchVideos === 'function') {
        searchVideos(transcript);
      }
    }
  };

  recognition.onerror = function(event) {
    alert('Mic error: ' + event.error);
  };
}

// Tag click event for filtering videos
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', function() {
    const query = this.getAttribute('data-query');
    if (query && typeof searchVideos === 'function') {
      searchVideos(query);
    }
  });
});

// 🌙 Theme Toggle Logic
const toggleBtn = document.getElementById("theme-toggle");
const icon = document.getElementById("theme-icon");
const body = document.body;

const moonIcon = `<path d="M21 12.79A9 9 0 0111.21 3c-.13 0-.26.01-.39.02a.75.75 0 00-.2 1.45A7.5 7.5 0 0012 21a7.48 7.48 0 007.53-6.39.75.75 0 00.47-.82z"/>`;

const sunIcon = `<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8zm10.48 0l1.8-1.79 1.41 1.41-1.79 1.8zM12 4V1h-1v3zm0 19v-3h-1v3zm8.66-11h3v-1h-3zm-19 0H0v1h3zM6.76 19.16l-1.8 1.79 1.41 1.41 1.8-1.79zm10.48 0l1.8 1.79 1.41-1.41-1.79-1.8zM12 6a6 6 0 100 12 6 6 0 000-12z"/>`;

function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark-theme");
    body.classList.remove("light-theme");
    icon.innerHTML = sunIcon;
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.add("light-theme");
    body.classList.remove("dark-theme");
    icon.innerHTML = moonIcon;
    localStorage.setItem("theme", "light");
  }
}

// Set initial theme based on localStorage
const savedTheme = localStorage.getItem("theme");
setTheme(savedTheme === "dark");

// Toggle on click
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const isDark = body.classList.contains("dark-theme");
    setTheme(!isDark);
  });
}

// ✅ Firebase setup & avatar replacement (safe and separate)
(async () => {
  // Load Firebase modules dynamically
  await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
  await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js");

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyAFcpSnCAZdbqXkN3POxT9E1I_Z1bIw4-Q",
    authDomain: "clone-ce4c2.firebaseapp.com",
    projectId: "clone-ce4c2",
    storageBucket: "clone-ce4c2.appspot.com",
    messagingSenderId: "288699982090",
    appId: "1:288699982090:web:75786526263ca0a9805af"
  };

  // Initialize Firebase if not already done
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();

  // Replace avatar if user is logged in
  auth.onAuthStateChanged(user => {
    const avatarImg = document.querySelector("img[alt='avatar']");
    if (user && avatarImg) {
      avatarImg.src = user.photoURL || "https://www.gravatar.com/avatar?d=mp";
      avatarImg.title = user.displayName || user.email;
    }
  });
})();

// Subscriptions Page Logic
const subscriptionsBtn = document.getElementById('subscriptions-btn');

async function loadSubscriptions() {
  cardContainer.innerHTML = '<p>Loading subscriptions...</p>';

  // Check if user is logged in
  if (!firebase.auth().currentUser) {
    cardContainer.innerHTML = '<p>Please sign in to view your subscriptions.</p>';
    return;
  }

  try {
    // Get OAuth token from Firebase user
    const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);

    // Call YouTube API for subscriptions (requires YouTube Data API enabled for your project)
    const subsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=20&key=${API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );
    const subsData = await subsRes.json();

    if (!subsData.items || subsData.items.length === 0) {
      cardContainer.innerHTML = '<p>No subscriptions found.</p>';
      return;
    }

    // Get channel IDs
    const channelIds = subsData.items.map(item => item.snippet.resourceId.channelId);

    // Fetch latest videos from each channel (limited to 1 video per channel for demo)
    cardContainer.innerHTML = '';
    for (const channelId of channelIds) {
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${API_KEY}`
      );
      const videosData = await videosRes.json();
      if (videosData.items && videosData.items.length > 0) {
        const video = videosData.items[0];
        const { title, thumbnails, channelTitle, publishedAt } = video.snippet;
        const videoId = video.id.videoId;
        const channelIcon = await fetchChannelIcon(channelId);

        const videoEl = document.createElement('div');
        videoEl.style.width = '450px';
        videoEl.style.margin = '10px';
        videoEl.innerHTML = `
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="text-decoration: none; color: inherit;">
            <img src="${thumbnails.high?.url || thumbnails.medium?.url}" alt="${title}" style="width: 100%; border-radius: 10px;" />
            <div style="display: flex; margin-top: 10px;">
              <img src="${channelIcon}" alt="${channelTitle}" style="width: 36px; height: 36px; border-radius: 50%; margin-right: 10px;" />
              <div>
                <h3 style="font-size: 16px; margin: 0 0 5px 0; line-height: 1.2;">${title}</h3>
                <p style="margin: 0; font-size: 14px; color: gray;">${channelTitle}</p>
                <p style="margin: 0; font-size: 13px; color: gray;">${formatTimeAgo(publishedAt)}</p>
              </div>
            </div>
          </a>
        `;
        cardContainer.appendChild(videoEl);
      }
    }
  } catch (err) {
    console.error('Failed to load subscriptions:', err);
    cardContainer.innerHTML = '<p>Unable to load subscriptions. Make sure you are signed in and have granted YouTube access.</p>';
  }
}

// Subscriptions button event
if (subscriptionsBtn) {
  subscriptionsBtn.addEventListener('click', loadSubscriptions);
}

