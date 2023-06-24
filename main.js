const { fetchTokenBalances, DataProcessing, handleTokenBalances } = require('./Data/tokenData.js');
const { fetchRepeatTransaction, fetchDayTransaction, fetchHistoryTransaction} = require('./transaction.js');
const { DBConnector } = require("./DB CONNECT/DBConnector.js");
const { whaleList } = require('./whaleData.js');
const { getCurrentTime } = require('./time.js');
const schedule = require('node-schedule');

const api = new DBConnector();

async function whaleData() {
    try {
        let whaleNameList = await api.getWhaleList();
        let AddressList = await api.getWalletList();
        
        // 고래 리스트 업데이트
        for (let key of Object.keys(whaleList)) {
            if(!whaleNameList.includes(key)){
                await api.addWhaleList(`${key}`);
            };

            // 고래 지갑 주소 업데이트
            const walletAddresses = whaleList[key];
            for (const address of walletAddresses) {
                if(!AddressList.includes(address)){
                    await api.addWalletList(`${key}`, `${address}`);
                };
            };
        };
        await new Promise(resolve => setTimeout(resolve, 60000));

        // // 트랜잭션 전체 기록 업데이트
        // let hashList = await api.getTransactions();

        // const chunkSize = 250;
        // for (let key of Object.keys(whaleList)) {
        //     const whaleName = key;
        //     const walletAddresses = whaleList[key];
        //     const transferArray = await fetchHistoryTransaction(whaleName, walletAddresses);
        //     const fliterTransferArray = transferArray.filter(transaction => !hashList.includes(transaction.hash));

        //     for (let i = 0; i < fliterTransferArray.length; i += chunkSize) {
        //         const chunk = fliterTransferArray.slice(i, i + chunkSize);
        //         for (const transaction of chunk){
        //             await api.addTransaction(`${transaction.name}`, `${transaction.address}`, `${transaction.tokenSymbol}`, `${transaction.from}`, `${transaction.to}`, `${transaction.hash}`, `${transaction.value}`, `${transaction.flow}`, `${transaction.timeStamp}`); 
        //         };
        //         await new Promise(resolve => setTimeout(resolve, 60000));    
        //     }
        // };
        console.log("데이터 업데이트가 완료되었습니다!")
    } catch(error){
        console.log(error);
        throw error;
    };
};

whaleData()
    .then(async() => {
        let hashList = await api.getTransactions();

        const chunkSize = 250;
        for (let key of Object.keys(whaleList)) {
            const whaleName = key;
            const walletAddresses = whaleList[key];
            const transferArray = await fetchDayTransaction(whaleName, walletAddresses);
            const fliterTransferArray = transferArray.filter(transaction => !hashList.includes(transaction.hash));

            for (let i = 0; i < fliterTransferArray.length; i += chunkSize) {
                const chunk = fliterTransferArray.slice(i, i + chunkSize);
                for (const transaction of chunk){
                    await api.addTransaction(`${transaction.name}`, `${transaction.address}`, `${transaction.tokenSymbol}`, `${transaction.from}`, `${transaction.to}`, `${transaction.hash}`, `${transaction.value}`, `${transaction.flow}`, `${transaction.timeStamp}`); 
                };
                await new Promise(resolve => setTimeout(resolve, 60000));    
            }
        };
    })
    .then(async() => {
        let hashList = await api.getTransactions();

        const repeatTokenData = schedule.scheduleJob('0 */20 * * * *', async function() {

            for (const key of Object.keys(whaleList)) {
                const time = getCurrentTime();
                const whaleName = key;
                const walletAddresses = whaleList[key];
                
                const tokenBalances = await fetchTokenBalances(whaleName, walletAddresses);
                const resultDict = await DataProcessing(tokenBalances);
                const tokenData = await handleTokenBalances(whaleName, resultDict, time);

                // totalData 업데이트
                for (const tokenDataList of tokenData) {
                    await api.addTotalData(`${tokenDataList.whaleName}`, `${tokenDataList.TokenSymbol}`, `${tokenDataList.TokenAddress}`, `${tokenDataList.price}`, `${tokenDataList.TokenQuantity}`, `${tokenDataList.value}`, `${tokenDataList.time}`);
                };
                
                // totalValue 업데이트
                let totalValue = 0;
                let symbolCount = tokenData.length;
                
                for (let i = 0; i < tokenData.length; i++) {
                    totalValue += tokenData[i].value;
                };
            
                await api.addTotalValue(`${tokenData[0]['whaleName']}`, `${totalValue}`, `${symbolCount}`, `${tokenData[0]['time']}`);   
                await new Promise(resolve => setTimeout(resolve, 1000));  

                // Transaction 데이터 업데이트  
                const transferArray = await fetchRepeatTransaction(whaleName, walletAddresses);
                const fliterTransferArray = transferArray.filter(transaction => !hashList.includes(transaction.hash));

                for (const transaction of fliterTransferArray){
                    await api.addTransaction(`${transaction.name}`, `${transaction.address}`, `${transaction.tokenSymbol}`, `${transaction.from}`, `${transaction.to}`, `${transaction.hash}`, `${transaction.value}`, `${transaction.flow}`, `${transaction.timeStamp}`); 
                };  
                await new Promise(resolve => setTimeout(resolve, 1000));  
            }   
        });
    })
    .catch((error) => {
        console.log('Error during execution:', error);
    });
