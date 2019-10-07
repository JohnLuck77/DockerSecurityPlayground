const dockerJS = require('mydockerjs').docker;
const async = require('async');
const appUtils = require('../util/AppUtils');
const log = appUtils.getLogger();
const fs = require('fs');
const path = require('path');
const recursive  = require('recursive-readdir');
const checker = require('./AppChecker');
const pathExists = require('path-exists');


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
function runVPN(vpnName, hostPort, cb) {
  log.info(`[DOCKER VPN] Run ${vpnName} VPN towards `);
  var options = {
    name: vpnName,
    detached: true,
    cap_add: "NET_ADMIN",
    ports: { '1194/udp': hostPort},
    volumes: [
      {hostPath: vpnName, containerPath: "/etc/openvpn"}
    ]
  }
    dockerJS.run(vpnImage, cb, options);
}

function createVPN(name, outputPath, callback, notifyCallback) {
  log.info("[DOCKER VPN] Create VPN");
  // Create volume
  async.waterfall([
    (cb) => checker.checkAlphabetic(name, cb),
    (cb) => removeVPN(name, outputPath, cb),
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
  checker.checkAlphabetic(name, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.readFile(path.join(certificatesPath, `${name}.ovpn`), callback);
    }
  });
}

// TBD Remove certificate
function removeVPN(name, vpnDir, callback) {
  log.info("[DOCKER VPN] Remove previous volume");
  async.waterfall([
  (cb) => checker.checkAlphabetic(name,  cb),
  (cb) => {
    pathExists(path.join(vpnDir, `${name}.ovpn`))
    .then((exists) => {
      if (exists) {
        fs.unlink(path.join(vpnDir, `${name}.ovpn`), cb);
      } else {
        cb(null);
      }
    });
  },
  (cb) => dockerJS.removeVolume(name, (cb))
  ], (err) => {
    // Skip if volume already does not exists
    if(err && err.message.includes("No such volume")) {
      callback(null);
    } else {
      callback(err);
    }
  });
}

function getNames(vpnDir, callback) {
  async.waterfall([(cb) => fs.readdir(vpnDir, cb),
    (data, cb) => {
      cb(null, data.filter((d) => {
        return path.extname(d) === ".ovpn";
      }).map((d) => path.parse(d).name));
    }], (err, data) => callback(err, data));
}
exports.createVPN = createVPN;
exports.getCertificateVPN = getCertificateVPN;
exports.getNames = getNames;
exports.removeVPN = removeVPN;
exports.runVPN = runVPN;
