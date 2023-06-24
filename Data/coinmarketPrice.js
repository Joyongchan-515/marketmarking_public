const axios = require('axios');
const { URLSearchParams } = require("url");
const { getPriceData } = require('./priceData.js');

const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const parameters = {
  start: 1,
  limit: 5000,
  convert: "USDT",
};
const headers = {
  Accepts: "application/json",
  "X-CMC_PRO_API_KEY": "" 
};

async function coinmarketcap(symbol, quantity) {
  try {
    const priceObj = getPriceData().find(data => data.TokenSymbol === symbol)
    let price;
    
    if (priceObj) {
      price = Number(priceObj.price);
    } else {
      const response = await axios.get(url + "?" + new URLSearchParams(parameters), { headers });
      if (!response || !Array.isArray(response.data.data)) {
        throw new Error(`Invalid JSON response from ${url}`);
      }
      const ticker = response.data.data.find(coin => coin.symbol === symbol);
      if (!ticker) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }
      price = Number(ticker.quote.USDT.price);
    }
    
    let value = Number(price * quantity);
    return [price, value];

  } catch (error) {
    console.error(error);
  }
};



module.exports = { coinmarketcap };