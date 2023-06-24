const axios = require('axios');
const schedule = require('node-schedule');

const apiKey = "";
const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=500&convert=USD`;

const Rankings = [];
const tokenAddressLists = [];

const coinRanking = schedule.scheduleJob('0 0 0 * * *', async function() {
    Rankings.length = 0;
    try {
        const response = await axios.get(url, {
            headers: {
                "X-CMC_PRO_API_KEY": apiKey
            }
        });
        const data = response.data;
        const tokens = data.data; 
        const platform = tokens.map(token => token.platform);
        const symbols = tokens.map(token => token.symbol);
        // for(let tokenList of tokens){
        //     if(tokenList.symbol == 'MATIC'){
        //         console.log(tokenList);
        //     }
        // };

        const tokenAddresses = platform
        .filter(item => item !== null && item.name === 'Ethereum')
        .map(item => item.token_address);    

        tokenAddressLists.push(...tokenAddresses);
        Rankings.push(...symbols);

    } catch (error) {
        console.error("Error:", error);
    }
});

coinRanking.invoke();

module.exports = {Rankings, tokenAddressLists};
