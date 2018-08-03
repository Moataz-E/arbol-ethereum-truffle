let Arbolcoin = artifacts.require("Arbolcoin")
let EternalDonut = artifacts.require("EternalDonut");
let expect = require('expect');
var utils = require('./utils.js'); 
let BigNumber = require('bignumber.js');
let BN = require('bn.js');
var crypto = require("crypto");
var Web3 = require('web3')
var web3 = new Web3()

// some bytes32 representations of random strings to be used as keys 
sun = "0xc20c4ba1c3774a81c0925248b9e93272243aa1d115da5941e411c6906b028df4"
moon = "0x6bd5921979df8775e28d201d8f84d011f187d53c9ef8172ca1c37c59d422bff2"
stars = "0x0412a55b0902187ddf9d9fc364419518c3021b77c7d80fdaf38e86d665992bc4"
sky = "0xf5d9fefe885be11b6a81fe460839b72a9ebc77efe3d85b9898b57bfd842944d8"
tree = "0xb2510336c6497719adadc7ade198c988520f3349445f074dc729df0f3c2b12ad"
town = "0xe40a47948fcb30b4978646ca22093b3c66a8848f34d56268d937c3938869035b"
ocean = "0x8dcb6d91fe847b2d6548eb9f41819940cfc3174030b7b617099045aa726f1bf8"
valley = "0x19496484cd6b53d0703af9298b44678aaea23439021622f86e41450ba0bf8126"
field = "0xa38ffea215aa9fcfa927ed706f7b49357ed82a340c8e8e5a4235798d14f3e829"
mountain = "0x9fd5c4a34499d9da4dcc90693f79f3c651d2cbdf8171efa8f2922be762f86922"

keys = [sun, moon, stars, sky, tree, town, ocean, valley, field, mountain]


async function testSetAddress(DONUT, account, key, value) {
    await DONUT.setAddressValue(key, value, {from: account})
    retrievedValue = await DONUT.getAddressValue(key, {from: account})
    assert.equal(retrievedValue, value, "Failed to set a address value!")
    console.log("Account ", account, " set ", key, " to address ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set address!")
}

async function testSetUnauthAddress(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")
    try {
        await DONUT.setAddressValue(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a address")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully a address!")
        console.log("Account ", account, " was stopped from setting ", key, " to address ", value)
    }
}

async function testSetInt(DONUT, account, key, value) {
    await DONUT.setIntValue(key, value, {from: account})
    retrievedValue = await DONUT.getIntValue(key, {from: account})
    assert.equal(retrievedValue, value, "Failed to set a Int value!")
    console.log("Account ", account, " set ", key, " to int ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set int!")
}

async function testSetUnauthInt(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")
    try {
        await DONUT.setIntValue(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a int")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully an int!")
        console.log("Account ", account, " was stopped from setting ", key, " to int ", value)
    }
}




async function testSetBoolean (DONUT, account, key, value) {
    await DONUT.setBooleanValue(key, value, {from: account})
    retrievedValue = await DONUT.getBooleanValue(key, {from: account})
    assert.equal(retrievedValue, value, "Failed to set a boolean value!")
    console.log("Account ", account, " set ", key, " to boolean ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set boolean!")
}

async function testSetUnauthBoolean(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")
    try {
        await DONUT.setBooleanValue(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a boolean")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully a boolean!")
        console.log("Account ", account, " was stopped from setting ", key, " to boolean ", value)
    }
}


async function testSetUInt(DONUT, account, key, value) {
    await DONUT.setUIntValue(key, value, {from: account})
    retrievedValue = await DONUT.getUIntValue(key, {from: account})
    assert.equal(retrievedValue.toNumber(), value, "Failed to set a uint value!")
    console.log("Account ", account, " set ", key, " to UInt ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set uint!")
}

async function testSetUnauthUInt(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")
    try {
        await DONUT.setUIntValue(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a uint")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully a uint!")
        console.log("Account ", account, " was stopped from setting ", key, " to UInt ", value)
    }
}

async function testSetString(DONUT, account, key, value) {
    await DONUT.setStringValue(key, value, {from:account})
    retrievedValue = await DONUT.getStringValue(key, {from:account})
    assert.equal(retrievedValue, value, "Failed to set a string value!")
    console.log("Account ", account, " set ", key, " to string ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set string!")    
}

async function testSetUnauthString(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")    
    try {
        await DONUT.setStringValue(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a string")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully a string!")
        console.log("Account ", account, " was stopped from setting ", key, " to string ", value)
    }
}

async function testSetBytes32(DONUT, account, key, value) {
    await DONUT.setBytes32Value(key, value, {from: account})
    retrievedValue = await DONUT.getBytes32Value(key, {from: account})
    assert.equal(retrievedValue, value, "Failed to set a bytes32 value!")
    console.log("Account ", account, " set ", key, " to bytes32 ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set bytes32!")
}

async function testSetUnauthBytes32(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")
    try {
        await DONUT.setBytes32Value(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a bytes32")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully a bytes32!")
        console.log("Account ", account, " was stopped from setting ", key, " to bytes32 ", value)
    }
}


async function testSetBytes(DONUT, account, key, value) {
    await DONUT.setBytesValue(key, web3.fromAscii(value), {from: account})
    retrievedValue = await DONUT.getBytesValue(key, {from: account})
    assert.equal(web3.toAscii(retrievedValue), value, "Failed to set a bytes value!")
    console.log("Account ", account, " set ", key, " to bytes ", value)
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, true, "Unauthorized account was able to set bytes!")
}

async function testSetUnauthBytes(DONUT, account, key, value) {
    authStatus = await DONUT.isAuthorized(account)
    assert.equal(authStatus, false, "Unauthorized account shows as authorized!")
    try {
        await DONUT.setBytesValue(key, value, {from: account})
        assert.equal(true, false, "Unauthorized account successfully set a bytes")
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Unauthorized account successfully a bytes!")
        console.log("Account ", account, " was stopped from setting ", key, " to bytes ", value)
    }
}

async function bangOnDonutBytes(authorizedAccount, banger2, banger3, admin, DONUT) {
    for (var key = 0; key < keys.length; key++) {
        await testSetBytes(DONUT, authorizedAccount, keys[key], crypto.randomBytes(60).toString('hex'))
    } 
    // try to set String values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthBytes(DONUT, banger2, keys[key], crypto.randomBytes(60).toString('hex'))
        await testSetUnauthBytes(DONUT, banger3, keys[key], crypto.randomBytes(70).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(1000).toString('hex'))

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthBytes(DONUT, banger2, keys[key], crypto.randomBytes(32).toString('hex'))
        await testSetUnauthBytes(DONUT, banger3, keys[key], crypto.randomBytes(322).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(352).toString('hex'))

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetBytes(DONUT, authorizedAccount, sun, crypto.randomBytes(312).toString('hex'))
        await testSetUnauthBytes(DONUT, banger2, keys[key], crypto.randomBytes(132).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, sun, crypto.randomBytes(352).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(326).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, stars, crypto.randomBytes(312).toString('hex'))
        await testSetUnauthBytes(DONUT, banger3, keys[key], crypto.randomBytes(322).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, stars, crypto.randomBytes(732).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(3442).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, sun, crypto.randomBytes(2).toString('hex'))
        await testSetUnauthBytes(DONUT, banger2, keys[key], crypto.randomBytes(32343).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, stars, crypto.randomBytes(362).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(3232).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, sun, crypto.randomBytes(362).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(326).toString('hex'))
        await testSetBytes(DONUT, authorizedAccount, stars, crypto.randomBytes(3222).toString('hex'))
        await testSetUnauthBytes(DONUT, admin, keys[key], crypto.randomBytes(2).toString('hex'))
    }

}

async function bangOnDonutInt(authorizedAccount, banger2, banger3, admin, DONUT) {
    for (var key = 0; key < keys.length; key++) {
        await testSetInt(DONUT, authorizedAccount, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
    } 
    // try to set String values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthInt(DONUT, banger2, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, banger3, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetInt(DONUT, authorizedAccount, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, banger3, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, banger2, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, banger3, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, banger2, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
        await testSetUnauthInt(DONUT, admin, keys[key], Math.floor(Math.random() * 100000000000000000000000000000000) - 50000000000000000000000000000000)
    }

}

async function bangOnDonutBoolean(authorizedAccount, banger2, banger3, admin, DONUT) {
    for (var key = 0; key < keys.length; key++) {
        await testSetBoolean(DONUT, authorizedAccount, keys[key], Math.random >= 0.5)
    } 
    // try to set String values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthBoolean(DONUT, banger2, keys[key], Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, banger3, keys[key], Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetString(DONUT, authorizedAccount, keys[key], Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, banger3, keys[key], Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetBoolean(DONUT, authorizedAccount, sun, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, banger2, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, sun, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, stars, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, banger3, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, stars, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, sun, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, banger2, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, stars, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, sun, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)
        await testSetBoolean(DONUT, authorizedAccount, stars, Math.random >= 0.5)
        await testSetUnauthBoolean(DONUT, admin, keys[key], Math.random >= 0.5)
    }
}

async function bangOnDonutBytes32(authorizedAccount, banger2, banger3, admin, DONUT) {
    for (var key = 0; key < keys.length; key++) {
        await testSetBytes32(DONUT, authorizedAccount, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
    } 
    // try to set String values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthBytes32(DONUT, banger2, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, banger3, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetBytes32(DONUT, authorizedAccount, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, banger3, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetBytes32(DONUT, authorizedAccount, sun, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, banger2, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, sun, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, stars, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, banger3, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, stars, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, sun, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, banger2, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, stars, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, sun, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetBytes32(DONUT, authorizedAccount, stars, utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
        await testSetUnauthBytes32(DONUT, admin, keys[key], utils.numStringToBytes32(crypto.randomBytes(32).toString('hex')))
    }

}

async function bangOnDonutAddress(authorizedAccount, banger2, banger3, admin, DONUT) {
    for (var key = 0; key < keys.length; key++) {
        await testSetAddress(DONUT, authorizedAccount, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))

    }

    // try to set String values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthAddress(DONUT, banger2, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, banger3, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetString(DONUT, authorizedAccount, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, banger3, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetAddress(DONUT, authorizedAccount, sun, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, banger2, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, sun, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, stars, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, banger3, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, stars, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, sun, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, banger2, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, stars, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, sun, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetAddress(DONUT, authorizedAccount, stars, "0x" + crypto.randomBytes(20).toString('hex'))
        await testSetUnauthAddress(DONUT, admin, keys[key], "0x" + crypto.randomBytes(20).toString('hex'))
    }
}

async function bangOnDonutString(authorizedAccount, banger2, banger3, admin, DONUT) {
    for (var key = 0; key < keys.length; key++) {
        await testSetString(DONUT, authorizedAccount, keys[key], crypto.randomBytes(100).toString('hex'))

    }

    // try to set String values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthString(DONUT, banger2, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, banger3, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetString(DONUT, authorizedAccount, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, banger3, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetString(DONUT, authorizedAccount, sun, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, banger2, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, sun, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, stars, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, banger3, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, stars, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, sun, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, banger2, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, stars, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, sun, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))
        await testSetString(DONUT, authorizedAccount, stars, crypto.randomBytes(100).toString('hex'))
        await testSetUnauthString(DONUT, admin, keys[key], crypto.randomBytes(100).toString('hex'))
    }
}

//Test function calls related to UInt
async function bangOnDonutUInt(authorizedAccount, banger2, banger3, admin, DONUT) {

    // set uint values from an authorized account

    for (var key = 0; key < keys.length; key++) {
        await testSetUInt(DONUT, authorizedAccount, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )

    }

    // try to set uint values from an unauthorized account
    for (var key = 0; key < keys.length; key++) {
        await testSetUnauthUInt(DONUT, banger2, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, banger3, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )

    }

    // do a mix of authorized and unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetUInt(DONUT, authorizedAccount, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, banger3, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )

    }

    // spam one key with authorized while doing other unauthorized
    for (var key = 0; key < keys.length; key++) {
        await testSetUInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, banger2, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, banger3, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, banger2, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, sun, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUInt(DONUT, authorizedAccount, stars, Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
        await testSetUnauthUInt(DONUT, admin, keys[key], Math.floor(Math.random() * 999999999999999999999999999999999) + 1 )
    }          
}

async function testGrantAuth(DONUT, client, admin) {
    try {
        await DONUT.revokeAuthorization(client, {from: admin})
        assert.equal(true, false, "Revocation of already unauthorized client failed to throw!") //just use true == false to cause a fail...
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Revocation of already unauthorized client failed to throw!")
    }

    await DONUT.grantAuthorization(client, {from: admin})
    clientStatus = await DONUT.isAuthorized(client, {from: admin})
    assert.equal(clientStatus, true, "Failed to authorize a client!")
    console.log("Granted Authorization to account ", client)
}

async function testRevokeAuth(DONUT, client, admin) {
    try {
        await DONUT.grantAuthorization(client, {from: admin})
        assert.equal(true, false, "Granting of already authorized client failed to throw!") //just use true == false to cause a fail...
    }
    catch (err) {
        assert.equal(err.message, "VM Exception while processing transaction: revert", "Granting of already authorized client failed to throw!")
    }

    await DONUT.revokeAuthorization(client, {from: admin})
    clientStatus = await DONUT.isAuthorized(client, {from: admin})
    assert.equal(clientStatus, false, "Failed to revoke a client!")
    //TODO get AuthorizationRevoked event and assert its existence.
    console.log("Revoked authorization to account ", client)
}

//Test function calls related to Auth.
async function bangOnDonutAuth(banger1, banger2, banger3, admin, DONUT) {

    //make sure to that bangers 1 2 and 3 are in the revoked state.

    banger1AuthStatus = await DONUT.isAuthorized(banger1, {from: admin});
    if (banger1AuthStatus) {
        await testRevokeAuth(DONUT, banger1, admin)
    }

    banger2AuthStatus = await DONUT.isAuthorized(banger2, {from: admin});
    if (banger2AuthStatus) {
        await testRevokeAuth(DONUT, banger2, admin)
    }

    banger3AuthStatus = await DONUT.isAuthorized(banger3, {from: admin});
    if (banger3AuthStatus) {
        await testRevokeAuth(DONUT, banger3, admin)
    }


    await testGrantAuth(DONUT, banger1, admin)
    await testGrantAuth(DONUT, banger2, admin)
    await testGrantAuth(DONUT, banger3, admin)

    await testRevokeAuth(DONUT, banger1, admin)
    await testRevokeAuth(DONUT, banger2, admin)
    await testRevokeAuth(DONUT, banger3, admin)

    await testGrantAuth(DONUT, banger3, admin)
    await testGrantAuth(DONUT, banger2, admin)    
    await testRevokeAuth(DONUT, banger2, admin)

    await testGrantAuth(DONUT, banger1, admin)
    await testRevokeAuth(DONUT, banger1, admin)
    await testRevokeAuth(DONUT, banger3, admin)
    
    authAccounts = [
        // have unauthorized clients try to revoke admin
        {"sender": banger3, "client": admin, "action": "revoke"},
        {"sender": banger2, "client": admin, "action": "revoke"},
        {"sender": banger1, "client": admin, "action": "revoke"},
        //have unauthorized clients try to give access to themselves        
        {"sender": banger1, "client": banger1, "action": "grant"},
        {"sender": banger2, "client": banger2, "action": "grant"},
        {"sender": banger3, "client": banger3, "action": "grant"},
        {"sender": banger1, "client": banger2, "action": "grant"},
        {"sender": banger1, "client": banger3, "action": "grant"},
        {"sender": banger3, "client": banger1, "action": "grant"},
        {"sender": banger1, "client": banger1, "action": "revoke"},
        {"sender": banger2, "client": banger2, "action": "revoke"},
        {"sender": banger3, "client": banger3, "action": "revoke"},
        //have unauthorized clients try to grant admin...just for the heck of it
        {"sender": banger1, "client": admin, "action": "grant"},
        {"sender": banger2, "client": admin, "action": "grant"},
        {"sender": banger3, "client": admin, "action": "grant"},
    ]

    for (var pair = 0; pair < authAccounts.length; pair++) {
        action = authAccounts[pair]["action"]

        if (action == "revoke") {
            try {
                await testRevokeAuth(DONUT, authAccounts[pair]["client"], authAccounts[pair]["sender"])
                assert.equal(true, false, "Unauthorized client took control of contract!")
            }
            catch(err) {
                assert.equal(err.message, "VM Exception while processing transaction: revert", "Something weird happened.")
                console.log("Blocked revocation of account ", authAccounts[pair]["client"], " from account  ", authAccounts[pair]["sender"])
            }
        }

        if (action == "grant") {
            try {
                await testGrantAuth(DONUT, authAccounts[pair]["client"], authAccounts[pair]["sender"])
                assert.equal(true, false, "Unauthorized client took control of contract!")
            }
            catch(err) {
                assert.equal(err.message, "VM Exception while processing transaction: revert", "Something weird happened.")
                console.log("Blocked revocation of account ", authAccounts[pair]["client"], " from account  ", authAccounts[pair]["sender"])
            }
        }
    }

    // test admin access to itself.
    await testGrantAuth(DONUT, admin, admin) 
    await testRevokeAuth(DONUT, admin, admin)  

}

contract('EternalDonut', function(accounts) {
    it("should make sure that authorization and ownership behaves correctly for the storage contract", async function() {

        let DONUT = await EternalDonut.deployed();

        await bangOnDonutAuth(accounts[2], accounts[3], accounts[4], accounts[1], DONUT);
        await DONUT.transferOwnership(accounts[2], {from: accounts[1]})
        await bangOnDonutAuth(accounts[1], accounts[3], accounts[4], accounts[2], DONUT);
        await DONUT.transferOwnership(accounts[3], {from: accounts[2]})
        await bangOnDonutAuth(accounts[2], accounts[1], accounts[4], accounts[3], DONUT);
        await DONUT.transferOwnership(accounts[4], {from: accounts[3]})
        await bangOnDonutAuth(accounts[1], accounts[2], accounts[3], accounts[4], DONUT);
        //TODO check state of 'owner' variable
        await DONUT.transferOwnership(accounts[1], {from: accounts[4]})

        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutUInt(accounts[2], accounts[3], accounts[4], accounts[1], DONUT);
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutUInt(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutUInt(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])

        await bangOnDonutString(accounts[2], accounts[3], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutString(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutString(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])        

        await bangOnDonutAddress(accounts[2], accounts[3], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutAddress(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutAddress(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])   

        await bangOnDonutBytes32(accounts[2], accounts[3], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutBytes32(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutBytes32(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])  

        await bangOnDonutBytes(accounts[2], accounts[3], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutBytes(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutBytes(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])  

        await bangOnDonutBoolean(accounts[2], accounts[3], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutBoolean(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutBoolean(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])

        await bangOnDonutInt(accounts[2], accounts[3], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[3], accounts[1])
        await testRevokeAuth(DONUT, accounts[2], accounts[1])
        await bangOnDonutInt(accounts[3], accounts[2], accounts[4], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[4], accounts[1])
        await testRevokeAuth(DONUT, accounts[3], accounts[1])
        await bangOnDonutInt(accounts[4], accounts[2], accounts[3], accounts[1], DONUT)
        await testGrantAuth(DONUT, accounts[2], accounts[1])
        await testRevokeAuth(DONUT, accounts[4], accounts[1])

        try {
            await DONUT.renounceOwnership({from: accounts[2]})
            assert.equal(true, false, "Something weird happened!")
        }
        catch (err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "Something weird happened.")
            console.log("blocked non owner account from renouncing its ownownership")
        }

        // admin renounces
        await DONUT.renounceOwnership({from: accounts[1]})
        try {
            await DONUT.grantAuthorization(accounts[2], {from: accounts[1]})
            assert.equal(true, false, "admin failed to renounce ownership!")
        }
        catch (err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert", "Something weird happened.")
            console.log("admin successfully renounced ownership.")
        }


    });
});





	
