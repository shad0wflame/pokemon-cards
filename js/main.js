const POKEAPI_URL = "https://pokeapi.co/api/v2";

const typesIconColor = new Map([
    ["normal", {icon: "img/normal.svg", color: "#A8A77A"}],
    ["fire", {icon: "img/fire.svg", color: "#EE8130"}],
    ["water", {icon: "img/water.svg", color: "#6390F0"}],
    ["electric", {icon: "img/electric.svg", color: "#F7D02C"}],
    ["grass", {icon: "img/grass.svg", color: "#7AC74C"}],
    ["ice", {icon: "img/ice.svg", color: "#96D9D6"}],
    ["fighting", {icon: "img/fighting.svg", color: "#C22E28"}],
    ["poison", {icon: "img/poison.svg", color: "#A33EA1"}],
    ["ground", {icon: "img/ground.svg", color: "#E2BF65"}],
    ["flying", {icon: "img/flying.svg", color: "#A98FF3"}],
    ["psychic", {icon: "img/psychic.svg", color: "#F95587"}],
    ["bug", {icon: "img/bug.svg", color: "#A6B91A"}],
    ["rock", {icon: "img/rock.svg", color: "#B6A136"}],
    ["ghost", {icon: "img/ghost.svg", color: "#735797"}],
    ["dragon", {icon: "img/dragon.svg", color: "#6F35FC"}],
    ["dark", {icon: "img/dark.svg", color: "#705746"}],
    ["steel", {icon: "img/steel.svg", color: "#B7B7CE"}],
    ["fairy", {icon: "img/fairy.svg", color: "#D685AD"}],
])

const getRandomInt = (min = 0, max = 1) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const extractEndpoint = (url) => url.replace(`${POKEAPI_URL}/`, "");

const parseNames = (name) => name.replace('-', " ");

const fetchPokemonAPI = async (endpoint) => {
    try {
        const response = await fetch(`${POKEAPI_URL}/${endpoint}`);

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.json();

    } catch (e) {
        throw new Error(e);
    }
}

const parsePokemon = async ({ id, name, stats, sprites, moves, types }) => {
    const moveIndex = getRandomInt(0, moves.length - 1);
    const {move: {url: moveURL}} = moves[moveIndex];
    const {
        name: moveName,
        type: {name: moveType},
        power,
        flavor_text_entries
    } = await fetchPokemonAPI(extractEndpoint(moveURL));
    const {base_stat: hpStat} = stats.find(({stat:{name}}) => name === "hp");

    const {flavor_text} = flavor_text_entries.find(({language:{name}}) => name === "en");

    return {
        id,
        name,
        hp: hpStat,
        sprite: sprites["other"]["official-artwork"]["front_default"],
        move: { name: parseNames(moveName), type: typesIconColor.get(moveType), power: power || 0, text: flavor_text },
        types: types.map(({type:{name}}) => typesIconColor.get(name))
    };
}

const cardFactory = async (model) => {
    const {id, name, hp, sprite, move, types} = await parsePokemon(model);
    console.log(id, name, hp, sprite, move, types);

    let backgroundStyle;
    if (types.length > 1) {
        const colors = types.map(({color}) => (color));
        backgroundStyle = `linear-gradient(to right, ${colors.toString()})`;
    } else {
        backgroundStyle = types[0].color;
    }

    const card = document.createElement("div");
    card.id = "card";
    card.style.background = backgroundStyle;

    const content = document.createElement("div");
    content.id = "card-content";

    const headerRow = document.createElement("div");
    headerRow.className = "c-flex c-row";

    const numericElement = document.createElement("span");
    numericElement.id = "card-header-numeric";
    numericElement.textContent = `#${id}`;

    const nameElement = document.createElement("span");
    nameElement.textContent = `${name}`;

    const nameElementContainer = document.createElement("div");
    nameElementContainer.className = "c-flex c-align-center c-f-50 c-text-capitalize";
    nameElementContainer.style.fontSize = "16px";
    nameElementContainer.style.fontWeight = "600";

    nameElementContainer.append(numericElement, nameElement);

    const hpElement = document.createElement("div");
    hpElement.className = "c-flex c-align-center c-justify-end c-f-25";
    hpElement.style.fontSize = "12px";

    const hpText = document.createElement("span");
    hpText.style.background = "#d3d3d3";
    hpText.style.color = "#666";
    hpText.style.padding = "5px";
    hpText.textContent = `HP ${hp}`;

    hpElement.appendChild(hpText);

    const typesElement = document.createElement("div");
    typesElement.className = "c-flex c-align-center c-justify-end c-f-25";

    typesElement.append(...types.map((type, index) => {
        const svg = document.createElement("img");
        svg.id = `type-${index}`;
        svg.src = type.icon;
        svg.style.background = type.color;

        return svg;
    }));

    headerRow.append(nameElementContainer, hpElement, typesElement);

    const portraitRow = document.createElement("div");
    portraitRow.className = "c-flex c-row";
    portraitRow.style.padding = "10px 0";

    const portraitContainer = document.createElement("div");
    portraitContainer.className = "c-flex c-justify-center c-w-100";
    portraitContainer.style.height = "185px";
    portraitContainer.style.background = `linear-gradient(to bottom, transparent 0%, white 100%), ${backgroundStyle}`;

    const portrait = document.createElement("img");
    portrait.src = sprite;
    portrait.style.width = "auto";

    portraitContainer.appendChild(portrait);

    portraitRow.append(portraitContainer);

    const movementRow = document.createElement("div");
    movementRow.className = "c-flex c-row";

    const movementType = document.createElement("div");
    movementType.className = "c-flex c-align-center c-justify-end c-f-10";

    const svg = document.createElement("img");
    svg.src = move.type.icon;
    svg.style.background = move.type.color;

    movementType.appendChild(svg);

    const movementNameContainer = document.createElement("div");
    movementNameContainer.className = "c-flex c-col c-f-75";
    movementNameContainer.style.paddingLeft = "10px";

    const movementName = document.createElement("div");
    movementName.className = "c-text-capitalize";
    movementName.style.fontSize = "16px";
    movementName.style.fontWeight = "600";
    movementName.textContent = move.name;

    const movementText = document.createElement("div");
    movementText.style.paddingTop = "5px";
    movementText.style.fontSize = "12px";
    movementText.style.color = "#686868";
    movementText.textContent = move.text;

    movementNameContainer.append(movementName, movementText);

    const movementPower = document.createElement("div");
    movementPower.className = "c-flex c-align-center c-justify-end c-f-10";
    movementPower.style.fontWeight = "600";
    movementPower.textContent = `${move.power}`;

    movementRow.append(movementType, movementNameContainer, movementPower);

    const creditsRow = document.createElement("div");
    creditsRow.id = "card-credits";

    const date = new Date();
    const credits = document.createElement("div");
    credits.style.fontSize = "8px";
    credits.style.color = "#686868";
    credits.textContent = `Nintendo Creatures, GAMEFREAK - ${date.getFullYear()}`;

    creditsRow.appendChild(credits);

    content.append(headerRow, portraitRow, movementRow, creditsRow);

    card.appendChild(content);

    return card;
}

(async () => {
    const container = document.getElementById("card-container");

    const randomId = getRandomInt(1, 151);
    const model = await fetchPokemonAPI(`pokemon/${randomId}`);

    const card = await cardFactory(model);

    container.appendChild(card);
})();


