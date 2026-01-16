// ====== DOM ======
const pokemonIdEl = document.getElementById("pokemonId");
const currentTimeEl = document.getElementById("currentTime");

const pokemonNumEl = document.getElementById("pokemonNum");
const pokemonNameEl = document.getElementById("pokemonName");
const pokemonSpeciesEl = document.getElementById("pokemonSpecies");

const heightEl = document.getElementById("height");
const weightEl = document.getElementById("weight");
const spriteEl = document.getElementById("pokemonSprite");

const typesWrap = document.getElementById("typesWrap");
const formsText = document.getElementById("formsText");

const abilitiesWrap = document.getElementById("abilitiesWrap");
const abilityText = document.getElementById("abilityText");

const pokemonListEl = document.getElementById("pokemonList");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Optional ability nav (minimal: we’ll just show first ability text)
const abilityPrev = document.getElementById("abilityPrev");
const abilityNext = document.getElementById("abilityNext");

// ====== STATE ======
let allPokemon = [];       // array of pokemon detail objects
let currentIndex = 0;      // 0..150
let currentAbilityIndex = 0;

// ====== HELPERS ======
function pad3(n) {
  return String(n).padStart(3, "0");
}

function formatHeightDmToFtIn(dm) {
  // PokéAPI height = decimeters
  const inches = dm * 3.937007874;
  const ft = Math.floor(inches / 12);
  const inch = Math.round(inches % 12);
  return `${ft}'${inch}"`;
}

function formatWeightHgToLbs(hg) {
  // PokéAPI weight = hectograms
  const lbs = hg * 0.220462262;
  return `${lbs.toFixed(1)} lbs`;
}

function setTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  currentTimeEl.textContent = `${hh}:${mm}`;
}

// ====== RENDER ======
function renderPokemon(pokemon) {
  // Heading
  pokemonNumEl.textContent = `No. ${pad3(pokemon.id)}`;
  pokemonNameEl.textContent = pokemon.name;

  // species / "type line" (minimal: show first type like "Fire Pokémon")
  const firstType = pokemon.types?.[0]?.type?.name || "unknown";
  pokemonSpeciesEl.textContent = `${firstType} Pokémon`;

  // Stats
  heightEl.textContent = formatHeightDmToFtIn(pokemon.height);
  weightEl.textContent = formatWeightHgToLbs(pokemon.weight);

  // Sprite
  const animated =
  pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
    ?.front_default;
  spriteEl.src = animated || pokemon.sprites.front_default || "";
  spriteEl.alt = pokemon.name;

  // Types
  typesWrap.innerHTML = "";
  for (const t of pokemon.types) {
    const chip = document.createElement("div");
    chip.classList.add("type");

    // Possible spot for <img> later
    // On my to-do list: add type icons
    const img = document.createElement("img");
    img.alt = t.type.name;
    //img.src = ""; // optional: if you later add icons per type
    img.style.display = "none"; // hide for now

    const p = document.createElement("p");
    p.textContent = t.type.name.toUpperCase();

    chip.append(img, p);
    typesWrap.appendChild(chip);
  }

  // Forms text (minimal placeholder)
  formsText.textContent = "";

  // Abilities (minimal)
  currentAbilityIndex = 0;
  abilitiesWrap.innerHTML = "";
  abilityText.textContent = "";

  // Build ability icons
  for (let i = 0; i < pokemon.abilities.length; i++) {
    const a = pokemon.abilities[i];

    const icon = document.createElement("div");
    icon.style.border = "2px solid #333";
    icon.style.borderRadius = "8px";
    icon.style.padding = "8px";
    icon.style.cursor = "pointer";
    icon.textContent = a.ability.name;

    icon.addEventListener("click", () => {
      currentAbilityIndex = i;
      loadAbilityText(pokemon.abilities[currentAbilityIndex].ability.url);
    });

    abilitiesWrap.appendChild(icon);
  }

  // Load first ability text
  if (pokemon.abilities[0]) {
    loadAbilityText(pokemon.abilities[0].ability.url);
  }
}

function renderList(allDetails) {
  pokemonListEl.innerHTML = "";

  for (let i = 0; i < allDetails.length; i++) {
    const pokemon = allDetails[i];
    const animated =
        pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
            ?.front_default;



    const item = document.createElement("div");
    item.classList.add("pokemonItem");

    const img = document.createElement("img");
    img.classList.add("listImg");
    img.src = animated || pokemon.sprites.front_default || "./media/pokeball.svg";
    img.alt = pokemon.name;

    const details = document.createElement("div");
    details.classList.add("details");

    const num = document.createElement("p");
    num.classList.add("listNumber");
    num.textContent = `No. ${pad3(pokemon.id)}`;

    const name = document.createElement("p");
    name.classList.add("listName");
    name.textContent = pokemon.name;

    details.append(num, name);
    item.append(img, details);
    pokemonListEl.appendChild(item);

    item.addEventListener("click", () => {
        document.querySelectorAll(".pokemonItem").forEach((el) => el.classList.remove("isSelected"));
        item.classList.add("isSelected");
      currentIndex = i;
      renderPokemon(allPokemon[currentIndex]);
    });
  }
}

// ====== DATA LOADERS ======
function getAllGen1Pokemon() {
  pokemonListEl.innerHTML = "";

  fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    .then((res) => res.json())
    .then((data) => {
      const promises = [];
      for (const pokemon of data.results) {
        promises.push(fetch(pokemon.url).then((res) => res.json()));
      }
      return Promise.all(promises);
    })
    .then((arrDetails) => {
      // Sort by id just in case
      arrDetails.sort((a, b) => a.id - b.id);

      allPokemon = arrDetails;
      pokemonIdEl.textContent = allPokemon.length; // "Number Registered"

      renderList(allPokemon);

      // Start on a random Pokémon
      currentIndex = Math.floor(Math.random() * allPokemon.length);
      renderPokemon(allPokemon[currentIndex]);
    })
    .catch((err) => {
      console.log(err);
    });
}

function loadAbilityText(abilityUrl) {
  abilityText.textContent = "Loading...";

  fetch(abilityUrl)
    .then((res) => res.json())
    .then((data) => {
      const entry = data.effect_entries.find((e) => e.language.name === "en");
      abilityText.textContent = entry ? entry.effect : "No description found.";
    })
    .catch((err) => {
      console.log(err);
      abilityText.textContent = "Could not load ability.";
    });
}

// ====== EVENTS ======
prevBtn.addEventListener("click", () => {
  if (!allPokemon.length) return;
  currentIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
  renderPokemon(allPokemon[currentIndex]);
});

nextBtn.addEventListener("click", () => {
  if (!allPokemon.length) return;
  currentIndex = (currentIndex + 1) % allPokemon.length;
  renderPokemon(allPokemon[currentIndex]);
});

// Optional: ability cycle buttons (minimal)
abilityPrev.addEventListener("click", () => {
  const p = allPokemon[currentIndex];
  if (!p || !p.abilities.length) return;

  currentAbilityIndex =
    (currentAbilityIndex - 1 + p.abilities.length) % p.abilities.length;

  loadAbilityText(p.abilities[currentAbilityIndex].ability.url);
});

abilityNext.addEventListener("click", () => {
  const p = allPokemon[currentIndex];
  if (!p || !p.abilities.length) return;

  currentAbilityIndex = (currentAbilityIndex + 1) % p.abilities.length;
  loadAbilityText(p.abilities[currentAbilityIndex].ability.url);
});

// ====== INIT ======
setTime();
setInterval(setTime, 1000 * 15);
getAllGen1Pokemon();
