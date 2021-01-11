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

let select = document.querySelector("select");
let rates;
let converterContainer = document.querySelector(".converterContainer");
let loader = document.querySelector(".loader");

async function getData() {
  loader.classList.add("visible");

  const response = await fetch(
    "https://cors-anywhere.herokuapp.com/" +
      "http://www.cbr.ru/scripts/XML_daily.asp"
  );
  const result = await response.text();
  const XmlNode = new DOMParser().parseFromString(result, "text/xml");
  rates = xmlToJson(XmlNode).ValCurs.Valute;
  console.log(rates);

  rates &&
    rates.forEach((rate) => {
      let option = document.createElement("option");
      select.appendChild(option);
      option.setAttribute("value", rate.CharCode);
      option.innerText = rate.CharCode;
    });

  rates && loader.classList.remove("visible");
  rates && converterContainer.classList.add("visible");
}
getData();

let currentCharCode;
select.addEventListener("change", (e) => {
  currentCharCode = e.target.value;
  console.log(currentCharCode);
});

let amountInput = document.querySelector(".amount");
let amount;
amountInput.addEventListener("change", (e) => {
  amount = e.target.value;
  console.log(amount);
});

let button = document.querySelector("button");
button.addEventListener("click", () => {
  console.log(rates, amount, currentCharCode);
  let historyDiv = document.querySelector(".historyDiv");
  historyDiv.classList.add("visible");
  let rateToConvert = rates.find((rate) => {
    if (rate.CharCode === currentCharCode) {
      return rate;
    }
  });
  console.log(rateToConvert.Value);
  let valueToConvert = rateToConvert.Value.split(",").join(".");
  let result =
    Math.round((Number(amount) / Number(valueToConvert)) * 100) / 100;
  console.log(Number(amount) / Number(valueToConvert));
  let resultDiv = document.createElement("div");
  converterContainer.appendChild(resultDiv);
  let resultAmount = document.createElement("p");
  resultDiv.appendChild(resultAmount);
  resultAmount.innerText =
    amount + " RUB " + "=" + " ~ " + result + " " + rateToConvert.CharCode;
});
