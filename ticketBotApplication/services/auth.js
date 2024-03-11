const basicAuth = require("express-basic-auth");
const users = { "teznix": "1234" };

const authMiddleware = basicAuth({
    users,
    challenge: true, // Send authentication challenge if credentials are missing
    unauthorizedResponse: "Unauthorized",
});

module.exports = authMiddleware;