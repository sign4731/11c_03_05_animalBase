"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

// The prototype for all animals:
const Animal = {
  star: false,
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  winner: false,
};

const settings = {
  filter: "all",
  sortBy: "name",
};
let filterBy = "all";

function start() {
  console.log("ready");

  // TODO: Add event-listeners to filter and sort buttons

  listenToButtonClicks();
  loadJSON();
}

function listenToButtonClicks() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));

  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  // TODO: This might not be the function we want to call first
  buildList();
  // clickButtons(allAnimals);
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.star = false;
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  console.log(sortBy);
  setSort(sortBy);
}

function setSort(sortBy) {
  settings.sortBy = sortBy;
  buildList();
}
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}
function filterList(filteredList) {
  // let filteredList = allAnimals;
  if (settings.filterBy === "cat") {
    filteredList = allAnimals.filter(isCat);
  } else if (settings.filterBy === "dog") {
    filteredList = allAnimals.filter(isDog);
  }
  return filteredList;
}

function sortList(sortedList) {
  // let sortedList = allAnimals;

  if (settings.sortBy === "name") {
    sortedList = sortedList.sort(compareName);
  } else if (settings.sortBy === "type") {
    sortedList = sortedList.sort(compareType);
  } else if (settings.sortBy === "desc") {
    sortedList = sortedList.sort(compareDesc);
  } else if (settings.sortBy === "age") {
    sortedList = sortedList.sort(compareAge);
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allAnimals); // FUTURE: Filter and sort currentList before displaying
  const sortedCurrentList = sortList(currentList);
  displayList(sortedCurrentList);
}

function compareAge(a, b) {
  if (a.age < b.age) {
    return -1;
  } else {
    return 1;
  }
}
function compareDesc(a, b) {
  if (a.desc < b.desc) {
    return -1;
  } else {
    return 1;
  }
}

function compareType(a, b) {
  if (a.type < b.type) {
    return -1;
  } else {
    return 1;
  }
}

function compareName(a, b) {
  if (a.name < b.name) {
    return -1;
  } else {
    return 1;
  }
}

function isCat(animal) {
  if (animal.type === "cat") {
    return true;
  } else {
    return false;
  }
}

function isDog(animal) {
  if (animal.type === "dog") {
    return true;
  } else {
    return false;
  }
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data

  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  if (animal.star) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  function clickStar() {
    toggleStar(animal);
  }

  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);
  function clickWinner() {
    toggleWinner(animal);
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function toggleWinner(animal) {
  if (animal.winner === true) {
    animal.winner = false;
  } else {
    tryToMakeAWinner(animal);
  }

  buildList();
}

function toggleStar(animal) {
  console.log("Star clicked");
  if (animal.star === true) {
    animal.star = false;
  } else {
    animal.star = true;
  }
  buildList();
}

function tryToMakeAWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner);

  const numberOfWinners = winners.length;
  const other = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  if (other !== undefined) {
    console.log("There can only be one winner of each type!");
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    console.log("There can only be two winners!");
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  function removeOther(other) {
    document.querySelector("#onlyonekind").style.display = "block";
    document.querySelector("#onlyonekind .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#onlyonekind [data-action=remove1]").addEventListener("click", clickRemoveOther);

    function closeDialog() {
      document.querySelector("#onlyonekind").style.display = "none";
      document.querySelector("#onlyonekind .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#onlyonekind [data-action=remove1]").removeEventListener("click", clickRemoveOther);
    }

    function clickRemoveOther() {
      removeWinner(other);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    document.querySelector("#onlytwowinners").style.display = "block";
    document.querySelector("#onlytwowinners .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#onlytwowinners [data-action=remove1]").addEventListener("click", clickRemoveA);
    document.querySelector("#onlytwowinners [data-action=remove2]").addEventListener("click", clickRemoveB);

    function closeDialog() {
      document.querySelector("#onlytwowinners").style.display = "none";
      document.querySelector("#onlytwowinners .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#onlytwowinners [data-action=remove1]").removeEventListener("click", clickRemoveA);
      document.querySelector("#onlytwowinners [data-action=remove2]").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      removeWinner(winnerA);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }

    function clickRemoveB() {
      removeWinner(winnerB);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
