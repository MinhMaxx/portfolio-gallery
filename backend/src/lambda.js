const serverlessHttp = require("serverless-http");

let cachedHandler;

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!cachedHandler) {
    const app = require("./server");
    cachedHandler = serverlessHttp(app);
  }

  return cachedHandler(event, context);
};
