const axios = require("axios");
const { doWhilst } = require("async");

// bubble forum에서 가져온 코드
(async () => {
    const pageCount = 100;
  
    let allRecords = [],
    noOfPages = 0,
    cursor = 0;
    
    await doWhilst(
      async () => {
          try {
              const { data } = await axios.get(
              `BUBBLE_DATA_API_URL?cursor=${cursor}`
              );
              const { remaining, results } = data.response;
              if (allRecords.length) {
                  noOfPages -= 1;
              } else {
                  noOfPages = Math.ceil(remaining / pageCount);
              }
              cursor += results.length;
  
              allRecords = [...allRecords, ...results];
  
              return Boolean(noOfPages);
          } catch (err) {
              console.log("error: ", err);
          }
      },
      (hasMorePages, cb2) => {
          cb2(null, hasMorePages);
      }
    );
  
    return allRecords;
  })()
  
  // 작동되는 코드 (전체 데이터 가져오는 코드)
  getTransactions = (async () => {
    const pageCount = 100;
  
    let allRecords = [],
    noOfPages = 0,
    cursor = 0;
    
    await doWhilst(
      async () => {
          try {
              const { data } = await get(
              `${Transaction}?cursor=${cursor}`
              );
              const { remaining, results } = data.response;
              if (allRecords.length) {
                  noOfPages -= 1;
              } else {
                  noOfPages = Math.ceil(remaining / pageCount);
              }
              cursor += results.length;
  
              allRecords = [...allRecords, ...results];
              console.log(allRecords);
              console.log(noOfPages);
  
              return Boolean(noOfPages);
          } catch (err) {
              console.log("error: ", err);
          }
      },
      (hasMorePages, cb2) => {
          cb2(null, hasMorePages);
      }
    );
  
    return allRecords;
  })

  async function fetchTokenBalances(whaleName, walletAddresses) {
    const tokenBalances = [];
    const tokenMap = new Map();
  
    for (const address of walletAddresses) {
      const url = `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=${address}&page=1&offset=1000&apikey=${apiKey}`;
      try {
        const response = await axios.get(url);
        const balances = response.data.result;
        const balancesWithUnit = balances.map(balance => {
          const tokenUnit = Math.pow(10, parseInt(balance.TokenDivisor));
          const tokenQuantity = parseInt(balance.TokenQuantity) / tokenUnit;
          return {
            ...balance,
            TokenQuantity: tokenQuantity
          };
        }).filter(balance => balance !== undefined);
        // console.log(balancesWithUnit);
  
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
      } catch (error) {
        console.error(`Error fetching token balances for address ${address}:`, error);
      }
    }
  
    for (let [tokenKey, value] of tokenMap) {
      const [TokenSymbol, TokenAddress] = tokenKey.split('-');
      tokenBalances.push({ TokenSymbol, TokenAddress, ...value });
    }
    console.log(tokenBalances);
    return tokenBalances;
  };
  