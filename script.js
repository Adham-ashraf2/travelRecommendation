const resultsEl = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let data = null;

// 1) Fetch JSON once when page loads
async function loadData() {
  try {
    const res = await fetch("travel_recommendation_api.json");
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    data = await res.json();

    // ✅ Confirm you can access it
    console.log("✅ Loaded JSON:", data);
  } catch (err) {
    console.error("❌ Failed to load JSON:", err);
    resultsEl.innerHTML = `<p style="color:red;">Could not load JSON. Use Live Server in VS Code.</p>`;
  }
}
loadData();

// 2) Only search when user clicks Search
searchBtn.addEventListener("click", () => {
  if (!data) {
    resultsEl.innerHTML = `<p style="color:red;">Data not loaded yet. Check console.</p>`;
    return;
  }

  const query = searchInput.value.toLowerCase().trim();

  const category = detectCategory(query);
  if (!category) {
    resultsEl.innerHTML = `<p>No results found. Try: beach, temple, country</p>`;
    return;
  }

  // 3) Get items based on category
  let items = [];
  if (category === "beaches") {
    items = data.beaches || [];
    renderCards(items, "Beach");
  } else if (category === "temples") {
    items = data.temples || [];
    renderCards(items, "Temple");
  } else if (category === "countries") {
    // flatten all cities from all countries
    const cities = (data.countries || []).flatMap(country =>
      (country.cities || []).map(city => ({
        name: city.name,
        imageUrl: city.imageUrl,
        description: city.description,
        countryName: country.name
      }))
    );
    renderCountryCards(cities);
  }
});

// Accept variations: beach/beaches, temple/temples, country/countries (any case)
function detectCategory(q) {
  if (q.includes("beach")) return "beaches";
  if (q.includes("temple")) return "temples";
  if (q.includes("country")) return "countries";
  return null;
}

// Render beaches/temples
function renderCards(items, tagLabel) {
  if (!items.length) {
    resultsEl.innerHTML = `<p>No items found.</p>`;
    return;
  }

  resultsEl.innerHTML = items.map(item => `
    <div class="card">
      <img src="${item.imageUrl}" alt="${escapeHtml(item.name)}">
      <div class="content">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="tag">${tagLabel}</div>
      </div>
    </div>
  `).join("");
}

// Render countries (cities)
function renderCountryCards(cities) {
  if (!cities.length) {
    resultsEl.innerHTML = `<p>No cities found.</p>`;
    return;
  }

  resultsEl.innerHTML = cities.map(city => `
    <div class="card">
      <img src="${city.imageUrl}" alt="${escapeHtml(city.name)}">
      <div class="content">
        <h3>${escapeHtml(city.name)}</h3>
        <p>${escapeHtml(city.description)}</p>
        <div class="tag">Country: ${escapeHtml(city.countryName)}</div>
      </div>
    </div>
  `).join("");
}

// Prevent weird characters from breaking HTML
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}