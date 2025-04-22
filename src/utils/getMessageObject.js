const getMessageObject = (sender, msg) => {
  return { sender, msg, createdAt: new Date().getTime };
};

module.exports = {
  getMessageObject
};