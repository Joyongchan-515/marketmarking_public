const axios = require('axios');
const { whaleList } = require('./whaleData.js');
const { convertUnixTimestampToDateString } = require('./time.js');
const schedule = require('node-schedule');

// Etherscan API 키
const API_KEY = '';


const repeatDeltaTime = 60 * (20);  // ()안에 몇 분전 데이터를 불러올 지 입력

async function fetchRepeatTransaction(whaleName, walletAddresses) {
  let allRepeatTransfers = [];

  for (const address of walletAddresses) {
    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=17495500&endblock=999999999&sort=asc&apikey=${API_KEY}`;
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const response = await axios.get(url);
      const tokenTransfers = Array.isArray(response.data.result) ? response.data.result.map(tx => {
        const tokenDecimal = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 18;
        const value = tx.value / (10 ** tokenDecimal);
        const timeStamp = convertUnixTimestampToDateString(tx.timeStamp); // tx.timeStamp는 UTC, convertUnixTimestampToDateString를 거치며 KRC 기준으로 출력됨.
        const timestampOneDayAgo = Date.now() - repeatDeltaTime * 1000; // UTC 기준으로 시간 생성
   
        if (tx.timeStamp * 1000 < timestampOneDayAgo) return null;
        return {
          name: whaleName,
          address: address,
          tokenSymbol: tx.tokenSymbol,
          timeStamp: timeStamp,
          from: tx.from,
          to: tx.to,
          hash: tx.hash,
          value: value.toFixed(tokenDecimal),
          flow: tx.from.toLowerCase() == address.toLowerCase() ? 'yes' : 'no',
        };
      }).filter(tx => tx !== null) : [];

      allRepeatTransfers = allRepeatTransfers.concat(tokenTransfers);
    } catch (error) {
      console.error(error);
    }
  }
  return allRepeatTransfers;
};


const dayDeltaTime = 60 * 60 * 24 * 10; 

async function fetchDayTransaction(whaleName, walletAddresses) {
  let allRepeatTransfers = [];

  for (const address of walletAddresses) {
    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${API_KEY}`;
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const response = await axios.get(url);
      const tokenTransfers = Array.isArray(response.data.result) ? response.data.result.map(tx => {
        const tokenDecimal = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 18;
        const value = tx.value / (10 ** tokenDecimal);
        const timeStamp = convertUnixTimestampToDateString(tx.timeStamp); // tx.timeStamp는 UTC, convertUnixTimestampToDateString를 거치며 KRC 기준으로 출력됨.
        const timestampOneDayAgo = Date.now() - dayDeltaTime * 1000; // UTC 기준으로 시간 생성

        if (tx.timeStamp * 1000 < timestampOneDayAgo) return null;
        return {
          name: whaleName,
          address: address,
          tokenSymbol: tx.tokenSymbol,
          timeStamp: timeStamp,
          from: tx.from,
          to: tx.to,
          hash: tx.hash,
          value: value.toFixed(tokenDecimal),
          flow: tx.from.toLowerCase() == address.toLowerCase() ? 'yes' : 'no',
        };
      }).filter(tx => tx !== null) : [];

      allRepeatTransfers = allRepeatTransfers.concat(tokenTransfers);
    } catch (error) {
      console.error(error);
    }
  }
  return allRepeatTransfers;
};


async function fetchHistoryTransaction(whaleName, walletAddresses) {
  let allTransfers = [];

  for (const address of walletAddresses) {
      const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${API_KEY}`;
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
          const response = await axios.get(url);
          const tokenTransfers = Array.isArray(response.data.result) ? response.data.result.map(tx => {
            const tokenDecimal = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 18;
            const value = tx.value / (10 ** tokenDecimal);
            const timeStamp = convertUnixTimestampToDateString(tx.timeStamp);
            return {
                name: whaleName,
                address: address,
                tokenSymbol: tx.tokenSymbol,
                timeStamp: timeStamp,
                from: tx.from,
                to: tx.to,
                hash: tx.hash,
                value: value.toFixed(tokenDecimal),
                flow: tx.from.toLowerCase() == address.toLowerCase() ? 'yes' : 'no',
            };
          }).filter(tx => tx !== null) : [];
          
          allTransfers = allTransfers.concat(tokenTransfers);
      } catch (error) {
          console.error(error);
      }
  }
  return allTransfers;
};


module.exports = {
  fetchRepeatTransaction,
  fetchDayTransaction,
  fetchHistoryTransaction
};