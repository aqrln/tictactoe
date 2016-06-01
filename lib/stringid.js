const allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

module.exports = () => {
  var timestamp = +new Date(),
      chunkSize = allowedChars.length,
      result = '';

  while (timestamp > 0) {
    var codepoint = timestamp % chunkSize;
    timestamp = Math.floor(timestamp / chunkSize);

    result += allowedChars[codepoint];
  }

  return result;
};
