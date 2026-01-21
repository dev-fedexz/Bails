/** * @project Bails - WhatsApp Bot 
* @author the-xyzz * @version 1.0.0 
* Este proyecto utiliza la librería Baileys*/ 

"use strict";

const displayAuth = () => {
    const cyan = "\x1b[36m";
    const blue = "\x1b[34m";
    const bold = "\x1b[1m";
    const reset = "\x1b[0m";
    const bgBlue = "\x1b[44m";
    const gray = "\x1b[90m";

    console.clear();
    console.log(`\n${bgBlue}${bold}  BAILS MULTI-DEVICE  ${reset}`);
    console.log(`${gray}Copyright 2026-2027 Baileys Library Assets${reset}`);
    console.log(`${cyan}© Copyright by the-xyzz${reset}`);
    console.log(`\n${blue}Status: Online and Loading...${reset}\n`);
};

displayAuth();

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));

var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.proto = exports.makeWASocket = void 0;

const WAProto_1 = require("../WAProto");
Object.defineProperty(exports, "proto", { enumerable: true, get: function () { return WAProto_1.proto; } });

const Socket_1 = __importDefault(require("./Socket"));
exports.makeWASocket = Socket_1.default;

__exportStar(require("../WAProto"), exports);
__exportStar(require("./Utils"), exports);
__exportStar(require("./Types"), exports);
__exportStar(require("./Store"), exports);
__exportStar(require("./Defaults"), exports);
__exportStar(require("./WABinary"), exports);
__exportStar(require("./WAM"), exports);
__exportStar(require("./WAUSync"), exports);

exports.default = Socket_1.default;
