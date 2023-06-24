const axios = require('axios');
const { getPriceData } = require('./priceData.js');

let endpoint = 'https://api.binance.com/api/v3/ticker/price';

async function binance(symbol, quantity) {
  try {
    const priceObj = getPriceData().find(data => data.TokenSymbol === symbol)
    let price;
    
    if (priceObj) {
      price = Number(priceObj.price);
    } else {
      let response = await axios.get(endpoint, { params: { symbol } });
      price = Number(response.data.price);
    }

    let value = Number(price * quantity);

    return [price, value];
    
  } catch(err) {
    console.log(err);
  }
};


module.exports = { binance };