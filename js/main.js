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
    const [{move: {url: moveURL}}] = moves;
    const {name: moveName, type: {name: moveType}, power} = await fetchPokemonAPI(extractEndpoint(moveURL));
    const {base_stat: hpStat} = stats.find(({stat:{name}}) => name === "hp");

    return {
        id,
        name,
        hp: hpStat,
        sprite: sprites["other"]["official-artwork"]["front_default"],
        move: { name: parseNames(moveName), type: typesIconColor.get(moveType), power },
        types: types.map(({type:{name}}) => typesIconColor.get(name))
    };
}

const cardFactory = async (model) => {
    const {id, name, hp, sprite, move, types} = await parsePokemon(model);
    console.log(id, name, hp, sprite, move, types);

    const card = document.createElement("div");
    card.id = "card";

    if (types.length > 1) {
        const colors = types.map(({color}) => (color));
        card.style.background = `linear-gradient(to right, ${colors.toString()})`
    } else {
        card.style.background = types[0].color;
    }

    const content = document.createElement("div");
    content.id = "card-content";

    const header = document.createElement("div");
    header.className = "c-flex c-row";

    const nameElement = document.createElement("div");
    nameElement.className = "c-flex c-align-center c-f-50 c-text-capitalize";
    nameElement.style.fontSize = "18px";
    nameElement.style.fontWeight = "600";
    nameElement.textContent = `#${id} ${name}`;

    const hpElement = document.createElement("div");
    hpElement.className = "c-flex c-align-center c-justify-end c-f-25";
    hpElement.style.fontSize = "12px";
    hpElement.textContent = `HP ${hp}`;

    const typesElement = document.createElement("div");
    typesElement.className = "c-flex c-align-center c-justify-end c-f-25";

    typesElement.append(...types.map((type, index) => {
        const svg = document.createElement("img");
        svg.id = `type-${index}`;
        svg.src = type.icon;
        svg.style.background = type.color;

        return svg;
    }));

    header.append(nameElement, hpElement, typesElement);

    content.appendChild(header);
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