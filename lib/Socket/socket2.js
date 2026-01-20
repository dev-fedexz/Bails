"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const boom_1 = require("@hapi/boom")
const util_1 = require("util")
const WAProto_1 = require("../../WAProto")
const Defaults_1 = require("../Defaults")
const Types_1 = require("../Types")
const Utils_1 = require("../Utils")
const WABinary_1 = require("../WABinary")
const Client_1 = require("./Client")
const WAUSync_1 = require("../WAUSync")
const { extendSocketFunctions } = require("./socket2")

const makeSocket = (config) => {
    const {
        waWebSocketUrl,
        connectTimeoutMs,
        logger,
        keepAliveIntervalMs,
        browser,
        auth: authState,
        printQRInTerminal,
        defaultQueryTimeoutMs,
        transactionOpts,
        makeSignalRepository
    } = config

    let epoch = 1
    const uqTagId = Utils_1.generateMdTagPrefix()
    const generateMessageTag = () => `${uqTagId}${epoch++}`

    const url = typeof waWebSocketUrl === 'string' ? new url_1.URL(waWebSocketUrl) : waWebSocketUrl

    if (config.mobile || url.protocol === 'tcp:') {
        throw new boom_1.Boom('Mobile API is not supported anymore', { statusCode: Types_1.DisconnectReason.loggedOut })
    }

    const ws = new Client_1.WebSocketClient(url, config)
    ws.connect()
    
    const ev = Utils_1.makeEventBuffer(logger)
    const ephemeralKeyPair = Utils_1.Curve.generateKeyPair()
    const noise = Utils_1.makeNoiseHandler({
        keyPair: ephemeralKeyPair,
        NOISE_HEADER: Defaults_1.NOISE_WA_HEADER,
        logger,
        routingInfo: authState?.creds?.routingInfo
    })

    const { creds } = authState
    const keys = Utils_1.addTransactionCapability(authState.keys, logger, transactionOpts)
    
    let lastDateRecv
    let qrTimer
    let closed = false

    const sock = {
        ws, ev, authState, logger, config, 
        generateMessageTag, noise, ephemeralKeyPair, creds, keys,
        closed, qrTimer, lastDateRecv
    }

    const extendedMethods = extendSocketFunctions(sock, { 
        generateMessageTag, 
        connectTimeoutMs, 
        defaultQueryTimeoutMs,
        makeSignalRepository 
    })

    ws.on('error', (err) => extendedMethods.end(new boom_1.Boom(`WS Error: ${err.message}`)))
    ws.on('close', () => extendedMethods.end(new boom_1.Boom('Conn Terminated', { statusCode: Types_1.DisconnectReason.connectionClosed })))

    return {
        ...extendedMethods,
        type: 'meta',
        ws,
        ev,
        logger
    }
}

module.exports = { makeSocket }
