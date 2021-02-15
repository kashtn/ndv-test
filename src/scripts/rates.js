function xmlToJson(xml) {
  let obj = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue;
  }
  let textNodes = [].slice.call(xml.childNodes).filter(function (node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
      return text + node.nodeValue;
    }, "");
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i);
      let nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == "undefined") {
          let old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}
async function getData() {
  let loader = document.querySelector(".loader");
  let ratesContainer = document.querySelector(".rates-container");
  let favoritesRatesContainer = document.querySelector(
    ".favorites-rates-container"
  );
  ratesContainer.classList.add("hidden");
  favoritesRatesContainer.classList.add("hidden");
  loader.classList.add("visible");

  const response = await fetch(
    "https://cors-anywhere.herokuapp.com/" +
      "http://www.cbr.ru/scripts/XML_daily.asp"
  );
  const result = await response.text();
  const XmlNode = new DOMParser().parseFromString(result, "text/xml");
  rates = xmlToJson(XmlNode).ValCurs.Valute;
  localStorage.setItem("rates", JSON.stringify(rates));

  let list = document.createElement("ul");
  ratesContainer.appendChild(list);

  loader.classList.remove("visible");
  favoritesRatesContainer.classList.remove("hidden");
  ratesContainer.classList.remove("hidden");

  rates.length > 0 &&
    rates.forEach((rate) => {
      let button = document.createElement("button");
      let li = document.createElement("li");
      list.appendChild(li);
      button.setAttribute("name", rate.CharCode);
      li.innerText = rate.CharCode + " - " + rate.Value + " rub";
      li.innerHTML = `<p>${rate.CharCode}  -  ${rate.Value} rub</p>
      <button value=${rate.CharCode} class='favoriteButton'>Add to favorites</button>`;
    });
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  let favoriteList = document.createElement("ul");
  favoritesRatesContainer.appendChild(favoriteList);

  let favoriteButton = document.querySelectorAll(".favoriteButton");

  favoriteButton.forEach((button) => {
    button.addEventListener("click", (e) => {
      let charCodeToFind = e.target.getAttribute("value");
      let favRate = rates.find((rate) => rate.CharCode === charCodeToFind);
      favorites.push(favRate);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      let favoritelLi = document.createElement("li");
      favoriteList.appendChild(favoritelLi);
      favoritelLi.innerHTML = `<p><b>${favRate.CharCode}  -  ${favRate.Value} rub</b></p>`;
    });
  });

  favorites.length > 0 &&
    favorites.forEach((rate) => {
      let favoritelLi = document.createElement("li");
      favoriteList.appendChild(favoritelLi);
      favoritelLi.innerHTML = `<p><b>${rate.CharCode}  -  ${rate.Value} rub</b></p>`;
    });
}
getData();
