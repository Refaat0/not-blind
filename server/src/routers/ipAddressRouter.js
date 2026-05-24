// Author: Refaat
import ipAddressQuerySchematic from "../schematics/ipAddressQuerySchematic.js";
import lowerHexBlob16Schematic from "../schematics/lowerHexBlob16Schematic.js";
import newIpAddressSchematic from "../schematics/newIpAddressSchematic.js";
import IpAddressController from "../controllers/IpAddressController/_.js";
import validateSchematic from "../middleware/validateSchematic.js";
import express from "express";

const router = express.Router();

router.get("/api/ip",     validateSchematic(ipAddressQuerySchematic, "query"),  IpAddressController.getIpAddresses);
router.get("/api/ip/:id", validateSchematic(lowerHexBlob16Schematic, "params"), IpAddressController.getIpAddressById);
router.post("/api/ip",    validateSchematic(newIpAddressSchematic, "body"),     IpAddressController.persistIpAddress);

export default router;
