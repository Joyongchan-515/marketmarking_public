// UTC 시간 기준 반환
function getCurrentTime() {
  let today = new Date();
  let year = today.getUTCFullYear();
  let month = String(today.getUTCMonth() + 1).padStart(2, '0');
  let day = String(today.getUTCDate()).padStart(2, '0');
  let hours = String(today.getUTCHours()).padStart(2, '0');
  let minutes = String(today.getUTCMinutes()).padStart(2, '0');
  let seconds = String(today.getUTCSeconds()).padStart(2, '0');
  let time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return time;
};



// UTC를 KRC로 변환하는 함수
function convertUnixTimestampToDateString(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  let time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return time;
};


module.exports = {
  getCurrentTime,
  convertUnixTimestampToDateString
};