const dockerJS = require('mydockerjs').docker;
const async = require('async');
const appUtils = require('../util/AppUtils');
const log = appUtils.getLogger();
const fs = require('fs');
const path = require('path');
const recursive  = require('recursive-readdir');

const vpnImage = "dockersecplayground/vpn:latest";
const dspHostname = "localhost";

function createVolume(name, cb) {
  log.info("[DOCKER VPN] Create Volume");
  dockerJS.createVolume(name, cb);
}
function ovpnGenConfig(name, cb, notifyCallback) {
  log.info("[DOCKER VPN] Generate Configuration ");
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: name, containerPath: "/etc/openvpn"}
    ],
    cmd: `ovpn_genconfig -u udp://${dspHostname}`
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}
function ovpnInitPki(name, cb, notifyCallback) {
  log.info("[DOCKER VPN] Init Pki");
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: name, containerPath: "/etc/openvpn"}
    ],
    cmd: "ovpn_initpki"
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}
function ovpnGenClient(name, cb, notifyCallback) {
  log.info("[DOCKER VPN] Generate Client");
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: name, containerPath: "/etc/openvpn"}
    ],
    cmd: `easyrsa build-client-full ${name}  nopass`
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}

function ovpnGetClient(name, cb, notifyCallback) {
  var options = {
    logDriver: "none",
    rm: true,
    volumes: [
      {hostPath: name, containerPath: "/etc/openvpn"}
    ],
    cmd: `ovpn_getclient ${name}`
  }
  dockerJS.run(vpnImage, cb, options, notifyCallback);
}

function createVPN(name, outputPath, callback, notifyCallback) {
  // Create volume
  async.waterfall([
    (cb) => removeVPN(name, cb),
    (cb) => createVolume(name, cb),
    (data, cb) => ovpnGenConfig(name, cb, notifyCallback),
    (data, cb) => ovpnInitPki(name, cb, notifyCallback),
    (data, cb) => ovpnGenClient(name, cb, notifyCallback),
    (data, cb) => ovpnGetClient(name, cb, notifyCallback),
    (data, cb) =>  fs.writeFile(path.join(outputPath, `${name}.ovpn`), data, cb)
  ], (err, data) => {
    callback(err, data)});
}

function getCertificateVPN(name, certificatesPath, callback) {
  fs.readFile(path.join(certificatesPath, `${name}.ovpn`), callback);
}

// TBD Remove certificate
function removeVPN(name, cb) {
  log.info("[DOCKER VPN] Remove previous volume");
  dockerJS.removeVolume(name, (err) => {
    // Skip if volume already does not exists
    if(err && err.message.includes("No such volume")) {
      cb(null);
    } else {
      cb(err);
    }
  });
}

function getNames(testDir, cb) {
}
exports.createVPN = createVPN;
exports.getCertificateVPN = getCertificateVPN;
exports.getNames = getNames;
exports.removeVPN = removeVPN;
