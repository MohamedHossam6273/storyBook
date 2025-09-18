// ========== Supabase Setup ==========
const SUPABASE_URL = "https://achartarfibykqfwcucu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaGFydGFyZmlieWtxZndjdWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjMxNTAsImV4cCI6MjA3MzY5OTE1MH0.IeNHDsbQ0rVoF0CcsTf1PpxUdwe5Y32A3YW7N3z3A6M";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentStory = null;
let currentNode = null;

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
async function saveProgress(storyId, nodeId) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) return;

  const { data, error } = await supabaseClient
    .from("user_progress")
    .upsert({
      user_id: user.email, // use email instead of uuid
      story_id: storyId,
      last_position: nodeId,
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
    .eq("user_id", user.email)
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
    .select("id, title, subtitle");

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
      <p>${story.subtitle || ""}</p>
      <button onclick="playStory(${story.id})">Read</button>
    `;
    storyList.appendChild(div);
  });
}

// ========== Play a Story ==========
async function playStory(storyId) {
  try {
    const { data: story, error } = await supabaseClient
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .single();

    if (error) throw error;

    currentStory = story;
    const storyJson =
      typeof story.content === "string"
        ? JSON.parse(story.content)
        : story.content;

    // load saved node if exists
    const savedNodeId = await loadProgress(storyId);
    const startNodeId = savedNodeId || story.start;

    currentNode = storyJson.nodes.find((n) => n.node_id === startNodeId);
    renderNode(currentNode);
  } catch (err) {
    console.error("Error loading story:", err);
  }
}

// ========== Render Node ==========
function renderNode(node) {
  const container = document.getElementById("story-content");

  let html = `
    <h2>${node.text_en}</h2>
    ${node.image_url ? `<img src="${node.image_url}" width="400"/>` : ""}
  `;

  if (node.choices) {
    html += "<div>";
    node.choices.forEach((choice) => {
      html += `<button onclick="goToNode('${choice.next_node_id}')">${choice.choice_text_en}</button>`;
    });
    html += "</div>";
  } else {
    html += `<p><em>The End</em></p>`;
  }

  container.innerHTML = html;

  // Save progress automatically
  if (currentStory && node.node_id) {
    saveProgress(currentStory.id, node.node_id);
  }
}

// ========== Move to Next Node ==========
function goToNode(nextNodeId) {
  const storyJson =
    typeof currentStory.content === "string"
      ? JSON.parse(currentStory.content)
      : currentStory.content;

  const nextNode = storyJson.nodes.find((n) => n.node_id === nextNodeId);
  if (!nextNode) {
    console.error("Next node not found:", nextNodeId);
    return;
  }
  currentNode = nextNode;
  renderNode(nextNode);
}

// ========== Auth State ==========
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    document.getElementById("auth-section").style.display = "none";
    loadStories();
  } else {
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
