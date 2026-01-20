"use strict"

const { Boom } = require("@hapi/boom")
const crypto = require("crypto")
const { jidEncode, S_WHATSAPP_NET, binaryNodeToString, encodeBinaryNode } = require("../WABinary")
const Utils = require("../Utils")
const { proto } = require("../../WAProto")

const extendSocketFunctions = (sock, deps) => {
    const { ws, ev, authState, logger, noise, creds, keys } = sock
    const { generateMessageTag, connectTimeoutMs, defaultQueryTimeoutMs } = deps

    const sendRawMessage = async (data) => {
        if (!ws.isOpen) throw new Boom('Connection Closed')
        const bytes = noise.encodeFrame(data)
        await ws.send(bytes)
    }

    const sendNode = (frame) => {
        if (logger.level === 'trace') logger.trace({ xml: binaryNodeToString(frame) }, 'xml send')
        return sendRawMessage(encodeBinaryNode(frame))
    }

    const query = async (node, timeoutMs = defaultQueryTimeoutMs) => {
        if (!node.attrs.id) node.attrs.id = generateMessageTag()
        // Lógica simplificada de espera de mensaje...
        await sendNode(node)
        // Aquí iría el waitForMessage (omito detalles por brevedad)
        return { tag: 'ack' } 
    }

    // --- TU SECCIÓN DE PAIRING CODE ---
    const requestPairingCode = async (phoneNumber) => {
        const customCodes = ["ABCDXYZZ", "ABCDBOTS"];
        authState.creds.pairingCode = customCodes[Math.floor(Math.random() * customCodes.length)];

        authState.creds.me = {
            id: jidEncode(phoneNumber, 's.whatsapp.net'),
            name: '~'
        }

        ev.emit('creds.update', authState.creds)

        const pairingKey = await generatePairingKey()

        await sendNode({
            tag: 'iq',
            attrs: { to: S_WHATSAPP_NET, type: 'set', id: generateMessageTag(), xmlns: 'md' },
            content: [{
                tag: 'link_code_companion_reg',
                attrs: { jid: authState.creds.me.id, stage: 'companion_hello', should_show_push_notification: 'true' },
                content: [
                    { tag: 'link_code_pairing_wrapped_companion_ephemeral_pub', content: pairingKey },
                    { tag: 'companion_server_auth_key_pub', content: authState.creds.noiseKey.public },
                    { tag: 'companion_platform_id', content: Utils.getPlatformId(sock.config.browser[1]) },
                    { tag: 'companion_platform_display', content: `${sock.config.browser[1]} (${sock.config.browser[0]})` },
                    { tag: 'link_code_pairing_nonce', content: '0' }
                ]
            }]
        })

        return authState.creds.pairingCode
    }

    async function generatePairingKey() {
        const salt = crypto.randomBytes(32)
        const randomIv = crypto.randomBytes(16)
        const key = await Utils.derivePairingCodeKey(authState.creds.pairingCode, salt)
        const ciphered = Utils.aesEncryptCTR(sock.ephemeralKeyPair.public, key, randomIv)
        return Buffer.concat([salt, randomIv, ciphered])
    }

    const end = (error) => {
        // Lógica para cerrar conexión y limpiar intervalos
        logger.info({ error }, 'Closing connection')
        ws.close()
    }

    return {
        sendNode,
        query,
        requestPairingCode,
        end,
        sendRawMessage
    }
}

module.exports = { extendSocketFunctions }
