const {get, post, put, patch, destroy} = require("./AxiosCreate");
const { doWhilst } = require("async");
const WhaleList = '/Whale List';
const WalletList = '/Wallet List';
const TotalValue = '/Total Value';
const TotalData = '/TotalData';
const Transaction = '/Transaction';

class DBConnector {
    getWhaleList = async () => {
      try {
          const response = (await get(WhaleList)).data.response;
          const results = response.results;
          let returnArr = [];

          for (const value of results) {
              returnArr.push(value['name']);
          }

          return returnArr;
      } catch (error) {
          console.log(error);
      }
    }

    addWhaleList = async (name) => {
      try {
          const data = (await post(WhaleList, {
              'name': name,
          })).data;

          return data.status === 'success';
      } catch (error) {
          console.log(error);
      }
    };

    getWalletList = async () => {
      try {
          const response = (await get(WalletList)).data.response;
          const results = response.results;
          let returnArr = [];

          for (const value of results) {
              returnArr.push(value['address']);
          }

          return returnArr;
      } catch (error) {
          console.log(error);
      }
    }

    addWalletList = async (name, address) => {
      try {
          const data = (await post(WalletList, {
              'name': name,
              'address': address
          })).data;

          return data.status === 'success';
      } catch (error) {
         console.log(error);
      }
    };

    addTotalValue = async (name, value, symbolCount, time) => {
      try {
          const data = (await post(TotalValue, {
              'name': name,
              'value': value,
              'symbolCount': symbolCount,
              'time': time
          })).data;

          return data.status === 'success';
      } catch (error) {
          console.log(error);
      }
    };

    addTotalData = async (name, symbol, TokenAddress, price, count, value, time) => {
      try {
          const data = (await post(TotalData, {
              'name': name,
              'symbol': symbol,
              'TokenAddress': TokenAddress,
              'price': price,
              'count': count,
              'value': value,
              'time': time
          })).data;

          return data.status === 'success';
      } catch (error) {
        console.log(error);
      }
    };

    getTransactions = (async () => {
      const pageCount = 100;
    
      let allHashes = [],
        noOfPages = 0,
        cursor = 0;
    
      let stopIteration = false; // 새로운 변수 추가
    
      await doWhilst(
        async () => {
          try {
            const { data } = await get(`${Transaction}?cursor=${cursor}`);
            const { remaining, results } = data.response;
            if (allHashes.length) {
              noOfPages -= 1;
            } else {
              noOfPages = Math.ceil(remaining / pageCount);
            }
            cursor += results.length;
    
            const hashes = results.map((result) => result);
            allHashes = [...allHashes, ...hashes];
    
            if (cursor > 50000) {
              stopIteration = true; 
            }
    
            return Boolean(noOfPages) && !stopIteration; 
          } catch (err) {
            console.log("error: ", err);
          }
        },
        (hasMorePages, cb2) => {
          cb2(null, hasMorePages);
        }
      );
    
      return allHashes;
    });
    
    
    

    addTransaction = async (name, address, symbol, sender, receiver, hash, value, flow, time) => {
      try {
          const data = (await post(Transaction, {
              'name': name,
              'address': address,
              'symbol': symbol,
              'sender': sender,
              'receiver': receiver,
              'hash': hash,
              'value': value,
              'flow': flow,
              'time': time
          })).data;

          return data.status === 'success';
      } catch (error) {
        console.log(error);
      }
    };
  };

module.exports = {
  DBConnector
}