// Author: Refaat
// I can't imagine a single path where this function fails...
import getRandomIpAdress from "../utilities/getRandomIpAddress.js";
import assert from "node:assert";

const ip = ["142.166.0.1", "90.0.0.1", "80.128.0.1", "151.0.0.1", "133.0.0.1", "51.0.0.1", "8.8.8.8"];

describe("utilities.getRandomIpAddress.js", () => {

    it("Returns a valid hard-coded ip address from one of seven G7 countries", () => {
        for (let i = 0; i < 10000; i++) {
            const addy = getRandomIpAdress();
            if (!ip.includes(addy)) {
                assert.fail(`Unknown ip address '${addy}' in utilities.getRandomIpAddress()`);
            }
        }
    });
});
