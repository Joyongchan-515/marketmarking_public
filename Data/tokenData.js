const axios = require('axios');
const {Rankings, tokenAddressLists} = require('./coinRanking.js');
const {BinanceAllSymbols} = require('./BinanceList.js');
const { getPriceData, setPriceData } = require('./priceData.js');
const { binance } = require('./binancePrice.js');
const { coinmarketcap } = require('./coinmarketPrice.js');
const schedule = require('node-schedule');


const apiKey = '';


async function fetchAllBalances(walletAddresses) {
  const allBalances = [];
  let count = 0;

  for (const address of walletAddresses) {
    const url = `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=${address}&page=1&offset=1000&apikey=${apiKey}`;

    try {
      if (count !== 0 && count % 2 === 0) {
        // wait for 1 second after every 2 requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await axios.get(url);
      const balances = response.data.result;

      if (!Array.isArray(balances)) {
        console.error(`Error: Expected balances to be an array but received ${typeof balances}`);
        continue;
      }

      allBalances.push(...balances);
      count++;
    } catch (error) {
      console.error(`Error fetching token balances for address ${address}:`, error);
    }
  }

  return allBalances;
};


async function fetchTokenBalances(whaleName, walletAddresses) {
  const tokenBalances = [];
  const tokenMap = new Map();

  const allBalances = await fetchAllBalances(walletAddresses);

  const balancesWithUnit = allBalances.map(balance => {
    const tokenUnit = Math.pow(10, parseInt(balance.TokenDivisor));
    const tokenQuantity = parseInt(balance.TokenQuantity) / tokenUnit;
    return {
      ...balance,
      TokenQuantity: tokenQuantity
    };
  }).filter(balance => balance !== undefined);

  for (const balance of balancesWithUnit) {
    const { TokenSymbol, TokenQuantity, TokenAddress } = balance;
    const tokenKey = `${TokenSymbol}-${TokenAddress}`;

    if (Rankings.includes(TokenSymbol)) {
      if (tokenMap.has(tokenKey)) {
        const existingValue = tokenMap.get(tokenKey);
        existingValue.TokenQuantity += TokenQuantity;
        tokenMap.set(tokenKey, existingValue);
      } else {
        tokenMap.set(tokenKey, { TokenQuantity });
      }
    }
  }

  for (let [tokenKey, value] of tokenMap) {
    const [TokenSymbol, TokenAddress] = tokenKey.split('-');
    tokenBalances.push({ TokenSymbol, TokenAddress, ...value });
  }

  return tokenBalances;
};


async function DataProcessing(tokenBalances) {
  let resultDict = [];

  for (let tokenInfo of tokenBalances) {
    if(tokenAddressLists.some(address => address.toLowerCase() === tokenInfo['TokenAddress'].toLowerCase())){
      if (!Object.keys(resultDict).includes(tokenInfo['TokenSymbol'])) {
        resultDict[tokenInfo['TokenSymbol']] = [tokenInfo];
      } else {
        resultDict.push(tokenInfo)
      }
    }
  }
  resultDict = Object.values(resultDict).flat();
  return resultDict;
}


// Refactor the price fetching into a function
async function fetchPriceAndValue(TokenSymbol, TokenQuantity) {
  let price, value;

  if (BinanceAllSymbols.includes(`${TokenSymbol}USDT`)) {
    [price, value] = await binance(`${TokenSymbol}USDT`, TokenQuantity);
  } else {
    [price, value] = await coinmarketcap(TokenSymbol, TokenQuantity);
  }

  let priceObj = getPriceData().find(data => data.TokenSymbol === TokenSymbol);
  if (!priceObj) {
    setPriceData([...getPriceData(), { TokenSymbol, price }]);
  }

  return [price, value];
}


async function handleTokenBalances(whaleName, resultDict, time) {
  const batchSize = 30;
  const allResults = [];
  let coinmarketcapCount = 0; // coinmarketcap 함수 호출 횟수를 카운트하는 변수 추가

  for (let i = 0; i < resultDict.length; i += batchSize) {
    const batch = resultDict.slice(i, i + batchSize);

    const promises = batch.map(async (tokenBalance) => {
      const { TokenSymbol, TokenQuantity, TokenAddress } = tokenBalance;
      const [price, value] = await fetchPriceAndValue(TokenSymbol, TokenQuantity);
      coinmarketcapCount++; // coinmarketcap 함수가 호출될 때마다 카운트 증가

      if (coinmarketcapCount >= 30) { // 만약 coinmarketcapCount가 30이상이면 60초 대기
        await new Promise(resolve => setTimeout(resolve, 60000));
        coinmarketcapCount = 0; // 대기 후 카운트를 다시 0으로 초기화
      }
      return { whaleName, TokenSymbol, TokenAddress, TokenQuantity, price, value, time };
    });

    const results = await Promise.all(promises);
    allResults.push(...results);
  }
  return allResults;
};



// 가격 데이터 리셋, Coinmarketcap API 호출량을 줄이기 위해 시간 조절.
const priceDataReset = schedule.scheduleJob('0 0 */4 * * *', async function() {
    setPriceData([]);
});


module.exports = {
  fetchTokenBalances: fetchTokenBalances,
  DataProcessing: DataProcessing,
  handleTokenBalances: handleTokenBalances
};
