const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Advertisement App",
    description: "A site where ads are posted and looked at ",
  },
  host: "https://advertisementapp.onrender.com",
  schemes: ["https"],
};
const outputFile = "./swagger-output.json";
const routes = ["./server.js"];

swaggerAutogen(outputFile, routes, doc);