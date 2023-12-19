const controller = {};

// success true/false
controller.returnDat = function (error, code, message, data) {
  const res = {
    error: error,
    code: code,
    message: message,
    data: data
  };
  return res;
};

module.exports = controller;
