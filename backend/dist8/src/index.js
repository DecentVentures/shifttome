"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./application");
exports.ShifttomeApplication = application_1.ShifttomeApplication;
async function main(options) {
    const app = new application_1.ShifttomeApplication(options);
    await app.boot();
    await app.start();
    return app;
}
exports.main = main;
//# sourceMappingURL=index.js.map