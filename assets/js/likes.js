// assets/js/likes.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, update, increment } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgGLO59I3GxWxhvavAKTY1vk5kLWsSH-k",
  authDomain: "orochi-shrine-likes.firebaseapp.com",
  databaseURL: "https://orochi-shrine-likes-default-rtdb.asia-southeast1.firebasedatabase.app",        // asia-southeast1 を含むURL
  projectId: "orochi-shrine-likes",
  appId: "1:459406898781:web:714a214abc0782a577ffb4"
};

const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth(app);
const safe = (k) => k.replace(/[.#$/\[\]]/g, "_");

async function start() {
  await signInAnonymously(auth); // 見た目のログインなし
  const btns = [...document.querySelectorAll(".like-btn")];
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    btns.forEach((btn) => wire(btn, uid));
  });
}

function wire(btn, uid) {
  const key = safe(btn.dataset.likeKey || "page");
  const countEl = btn.querySelector(".like-count");
  let liked = false;

  onValue(ref(db, `likes/${key}/count`), (s) => {
    const v = s.val();
    countEl.textContent = typeof v === "number" ? v : 0;
  });

  onValue(ref(db, `likes/${key}/users/${uid}`), (s) => {
    liked = !!s.val();
    btn.classList.toggle("liked", liked);
    btn.title = liked ? "取り消す（もう一度クリック）" : "いいねする";
  });

  btn.addEventListener("click", async () => {
    const updates = {};
    updates[`likes/${key}/count`] = increment(liked ? -1 : 1);
    updates[`likes/${key}/users/${uid}`] = liked ? null : true;
    await update(ref(db), updates);
  });
}

start();
