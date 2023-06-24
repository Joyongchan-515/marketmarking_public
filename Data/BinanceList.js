const axios = require('axios');
const schedule = require('node-schedule');

const BinanceAllSymbols = [];

const getAllSymbols = schedule.scheduleJob('0 0 0 * * *', async function() {
  BinanceAllSymbols.length = 0;
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const symbols = response.data.symbols.map(symbolInfo => symbolInfo.symbol);
    const filteredSymbols = symbols.filter(symbol => symbol.includes('USDT'));
    BinanceAllSymbols.push(...filteredSymbols);

  } catch (error) {
    console.error(`Error fetching symbols: ${error}`);
  }
});

getAllSymbols.invoke();


module.exports = {BinanceAllSymbols};