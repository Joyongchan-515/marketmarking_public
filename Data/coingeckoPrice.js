const axios = require('axios');

async function getCoinId(coinName) {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
    const coin = response.data.find(c => c.symbol.toLowerCase() === coinName.toLowerCase());
    return coin ? coin.id : null;
  } catch (error) {
    console.error(error);
  }
}
// let coinId = '0xfd4f241851be224e52ffc6947f0ee02579875049';

async function getCoinPrice(coinId) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    return response.data.market_data.current_price.usd;  // USD 가격 반환
  } catch (error) {
    console.error(error);
  }
}

async function getCoinInfo(coinName) {
  const coinId = await getCoinId(coinName);
  if (coinId === null) {
    console.log(`No token found with name ${coinName}`);
    return;
  }
  const price = await getCoinPrice(coinId);
  console.log(`The current price of ${coinName} is ${price}`);
}

getCoinInfo('WBTC');  // 'bitcoin'을 원하는 토큰의 이름으로 변경하세요
