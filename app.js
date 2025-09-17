// ========== Supabase Setup ==========
const { createClient } = supabase;

// ⚠️ Replace with your own values from Supabase → Project Settings → API
const SUPABASE_URL = "https://YOUR-PROJECT-URL.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== Authentication ==========
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    alert("Signup error: " + error.message);
  } else {
    alert("Signup successful! Please check your email to confirm.");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Login error: " + error.message);
  } else {
    alert("Login successful!");
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  alert("You are logged out!");
}

// ========== Progress Handling ==========
async function saveProgress(storyId, lastPosition) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) return;

  const { data, error } = await supabaseClient
    .from("user_progress")
    .upsert({
      user_id: user.id,
      story_id: storyId,
      last_position: lastPosition,
      updated_at: new Date(),
    })
    .select();

  if (error) {
    console.error("Error saving progress:", error);
  } else {
    console.log("Progress saved:", data);
  }
}

async function loadProgress(storyId) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabaseClient
    .from("user_progress")
    .select("last_position")
    .eq("user_id", user.id)
    .eq("story_id", storyId)
    .single();

  if (error) {
    console.log("No saved progress found.");
    return null;
  }

  return data.last_position;
}

// ========== Load Stories ==========
async function loadStories() {
  let { data: stories, error } = await supabaseClient
    .from("stories")
    .select("*");

  if (error) {
    console.error("Error fetching stories:", error);
    return;
  }

  const storyList = document.getElementById("story-list");
  storyList.innerHTML = "<h2>Stories</h2>";

  stories.forEach((story) => {
    const div = document.createElement("div");
    div.classList.add("story-card");
    div.innerHTML = `
      <h3>${story.title}</h3>
      <p>${story.description}</p>
      <button onclick="loadStory('${story.json_url}', '${story.id}')">Read</button>
    `;
    storyList.appendChild(div);
  });
}

async function loadStory(jsonUrl, storyId) {
  try {
    const response = await fetch(jsonUrl);
    const storyData = await response.json();

    // Load saved progress
    const savedPosition = await loadProgress(storyId);
    let contentToShow = storyData.content;

    if (savedPosition) {
      contentToShow =
        "⏪ Resuming from: " +
        savedPosition +
        "<br><br>" +
        storyData.content;
    }

    const storyContent = document.getElementById("story-content");
    storyContent.innerHTML = `
      <h2>${storyData.title}</h2>
      <p>${contentToShow}</p>
      <button onclick="saveProgress('${storyId}', 'chapter1')">Save Progress</button>
    `;
  } catch (err) {
    console.error("Error loading story:", err);
  }
}

// ========== Auth State ==========
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    // User is logged in
    document.getElementById("auth-section").style.display = "none";
    loadStories();
  } else {
    // User is logged out
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("story-list").innerHTML =
      "<h2>Stories</h2><p>Please log in to see stories.</p>";
    document.getElementById("story-content").innerHTML =
      "<h2>Story Content</h2>";
  }
});

// Load stories if already logged in
window.onload = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    document.getElementById("auth-section").style.display = "none";
    loadStories();
  }
};
