const chai = require('chai');
const fs = require('fs');
const chaiFS = require('chai-fs');
const appRoot = require('app-root-path');
const dockerVPN = require('../../app/util/docker_vpn.js');
const path = require('path');
const rimraf = require('rimraf');
const fsExtra= require('fs-extra');
const helper = require('../helper.js');
const util = require('util');
const execSync = util.promisify(require('child_process').execSync);
const vpnPrefix = "dsp-vpn-";




// const basePath = path.join(appRoot.path, 'test', 'util');
const basePath = "/basePath";
const expect = chai.expect;

const testDir = path.join(appRoot.toString(), "test", "util", "vpnDir");
const testDirTpl = path.join(appRoot.toString(), "test", "util", "vpnDirTpl");



describe('Test docker vpn', () => {
  before((done) => {
    execSync("docker volume create existent");
    done();
  });
  beforeEach((done) => {
    chai.use(chaiFS);
    if (fs.existsSync(testDir)) {
      rimraf.sync(testDir);
    }
    helper.copyDir(testDirTpl, testDir);
    done();
  });
  it.only('Should create vpn', (done) => {
    expect(true).to.be.ok
    dockerVPN.createVPN("main", testDir, (err, data) => {
      expect(err).to.be.null;
      expect(path.join(testDir, vpnPrefix + 'main.ovpn')).to.be.file();
      done();
    }, (n) => {
      console.log("NOTIFY");
      console.log(n);
    });
  }).timeout(60000);

  it('Should get vpn data', (done) => {
    const bExistent = "CmNsaWVudApub2JpbmQKZGV2IHR1bgpyZW1vdGUtY2VydC10bHMgc2VydmVyCgpyZW1vdGUgbG9jYWxob3N0IDExOTQgdWRwCgo8a2V5PgotLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS0KTUlJRXZ3SUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2t3Z2dTbEFnRUFBb0lCQVFEajJMMmpPSll4cElRWApWZ0NpNVdnU2RYeWFPYVdWN1RDZFJISEZPdlM1MEZweGdpVGxsQi83S0VxOTZwQURxUC9VaFc4eGRoazUveHozCk9sNzFRTU9rdk51K3VCODhwN1FHUWFTVkhhVDBqNUNhY09pU3pjdnVtTWk2UUlLQzFIWnFOSVlFcTFGUEdRaUIKZUFoYittcDd1ZXRDOU1qd1pWV0NhcGYwRXVXcDh3eG1kOGptT1FNREZKcTRadGUzUzEvcjNkcS96QkJRTGw0Qgpibko1RkFVSU9wLzlQdnU3WWlBRkl6c2YvVGJiakI4T1pkK0ZTdE0vOU5ET2drYTNiZlZBb0NIcTRndWVrRWoxCk5yYVZTR3owdytnajIvSXNJcVUwZFJYbVNvM3JuenRXS1JBbmU0T2w5amRPQkUxTm1TSjJ0RXBqVVFKeWZRSksKUzhkcFRwRTlBZ01CQUFFQ2dnRUFKb0txd3R5OG5oVmxjaUJLS1Q1SEVkK2p1Tm1IZ0VpL3o4VVN5YmhHUnVYTgpjNlFBb29FZnlxNnJ1MS9iQ1pOVjhsQy9VNGZYaWJMeDdXT0RTMGF3Q3JjVkdTNDdzVi9URUwrbGxzS1U3L1VZCkJ0S1FyTWQxOFpVSFVGdTQ4MjMvdWNHNDZTOGZwaFBnR1NuMWw3NUNvemp3WjdmQ0FzZk41U1lwR3NyYTRKZHYKUFdqM09mWi9XWEZrTm5rcTlLK1hSc3hKRWlWcjNzeWlkUjBrKzluU2RIbjk4azAwWUgvczRHWThzSlo4ZEsyNgo1RDdDOTA0eGtWSElBOVZZZUgvVmFIVkZhd3J6cVY0bWdyYUJERW02TmZFVE55cXFKZFhrdkx1SzFoTHZjZTVUCk1oL3J2UEFrdGdvUTFYT0dkdjU0TmxoNjkyaGxwWXFPTU5BS0pmZzdiUUtCZ1FEKzR4MFN6MlFmOFVtcHMyTUwKUEZWR2JkUXEvMDY1aUw4N1VlOHFIV0NzdHBFbWw3UW4wY1drUHlQWHgraW8vRjJXZXZDY3l0R21zSHorTUFQRgpac3AxUTdOUjBRQ1NidGRnN0pncDF4TC9uQ1NhWHFQcGsrNkRrNVpQMFo4YzRtYytTMVlJcDRSajdvaW91NG1QClBsK3cvNzBmaXEwZmRqUkw2b2R6TkZqMC93S0JnUURrMTJkMExhdnRXdkhrTWpZSU05QXM1WVFFRFBtNHc2MncKM3JMdThTbmZ2Z1RZV2s2UDFhTHNPVXVtOHBpV0JySjczWlUzM1YzL252Ry9sYWhPU2lNd3FocFNPMHBuYUI0Swo3ekpyVG1jeVZCWC9mTzQ3cUg3empjWXJxWWhZM1hPdVhMb1NtS3gxNUoxeUhGUDIxTUZVc2lMNmdDK3BFaVJ2Ck5QdTBJK1VOd3dLQmdRQ0tLUWxsWE0xbEV5RmV2MEg4b1NPSUhaaFlCalBpRmVHeWdlTWw3TzZ1TC9mVjkzMUwKNkVVOWxvd1ROdVZDVkNsV25DVTRtQ2UwTnc1SnFqVWhGMnErellleDNaeDF3MmN6dm90c2dveGx5WGw5dzdjTgpzWVlrQkNnQjlCcFBTZG0weHBsSDc2V3ZsV2kyTFpHTzk3eGU4UURPekJpemFSdEgyMFM0aWJOK2VRS0JnUUNiCnZvbzNSSm9kV1djRmNyTFpWRUliUEQxajhGekl4Y3hoY3I5KzVYMGxQSkxabUdTZGViMS9YZU5DQlJ1YUI0YlQKekZPeENLVGZ3eEl1M0xFR1QyaXh4eU5RMGU5cWZ5N3JMQzQ1WDh2V01lb2l6cWpveTExVGJ5cnZMbHVRZDI4eQp2UU1hZ3ZQazdLbkhMc1pxV0JRWUM0REkwaE1kMHk0ZXpZVjg3VzBIdHdLQmdRQ1VqaytzN0YzYVdURVcxK1hMCkJUOEFiRHltaUI5Q21jbGVzdlVzeEVRUHVFUWF0eDVSK09ZN1pLZHU3QzlBMGZ4M3FXOHRnTXA2Y3ZvMlJ4NHcKTWNldWdkdFdjMTczWEp1RTlabVkwOUhGejVSNVQrK0lkcVpGeFJuRGRqNDBQdkd3eDNSa2tFWmM3ZGtubWpzNwpxeXZMQ3VGZTRDUmxMWk5zSFZsTTZvdGdDQT09Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0KPC9rZXk+CjxjZXJ0PgotLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS0KTUlJRFN6Q0NBak9nQXdJQkFnSVJBSmtad0FpQ2c4cnV2WDNwVE03YXhoUXdEUVlKS29aSWh2Y05BUUVMQlFBdwpFREVPTUF3R0ExVUVBd3dGWkhOd1hHNHdIaGNOTVRrd09UQXhNakV3TnpReldoY05Nakl3T0RFMk1qRXdOelF6CldqQVRNUkV3RHdZRFZRUUREQWhrYzNBdGIzWndiakNDQVNJd0RRWUpLb1pJaHZjTkFRRUJCUUFEZ2dFUEFEQ0MKQVFvQ2dnRUJBT1BZdmFNNGxqR2toQmRXQUtMbGFCSjFmSm81cFpYdE1KMUVjY1U2OUxuUVduR0NKT1dVSC9zbwpTcjNxa0FPby85U0ZiekYyR1RuL0hQYzZYdlZBdzZTODI3NjRIenludEFaQnBKVWRwUFNQa0pwdzZKTE55KzZZCnlMcEFnb0xVZG1vMGhnU3JVVThaQ0lGNENGdjZhbnU1NjBMMHlQQmxWWUpxbC9RUzVhbnpER1ozeU9ZNUF3TVUKbXJobTE3ZExYK3ZkMnIvTUVGQXVYZ0Z1Y25rVUJRZzZuLzArKzd0aUlBVWpPeC85TnR1TUh3NWwzNFZLMHovMAowTTZDUnJkdDlVQ2dJZXJpQzU2UVNQVTJ0cFZJYlBURDZDUGI4aXdpcFRSMUZlWktqZXVmTzFZcEVDZDdnNlgyCk4wNEVUVTJaSW5hMFNtTlJBbko5QWtwTHgybE9rVDBDQXdFQUFhT0JuRENCbVRBSkJnTlZIUk1FQWpBQU1CMEcKQTFVZERnUVdCQlJ2MUo3UzAvQTlNU3JjYWZrcVJmWVBRVE9HTXpCTEJnTlZIU01FUkRCQ2dCVDJuMGVVRjdWawplVktOY0lzVDdxMW8rejlsQ0tFVXBCSXdFREVPTUF3R0ExVUVBd3dGWkhOd1hHNkNGR3UvSFNhd2gvVEttQTVhCjhnVjZsa013UkkyeE1CTUdBMVVkSlFRTU1Bb0dDQ3NHQVFVRkJ3TUNNQXNHQTFVZER3UUVBd0lIZ0RBTkJna3EKaGtpRzl3MEJBUXNGQUFPQ0FRRUFoNnF4cDNtOGg3TklCOFBTb0ZKdUg5citPc3k0cGtvdXM1QmZONzdrZmdVNgpHMHYvWjNmTDdIanBIS1ZFWWdzNEdSQ3p2SG5aNjVnQno3WElOdGkzUy83dkluU0VVSUNSVUNmQnNna29YMDU4CmZKRFlHdG8zdmRiU2pqSUJZVkhBdUtjSW1qQjloZ0FnTGFUZkZrSXFQd2FIZkI0bm9TU080YWgvRXFDalphRFIKR2lGRmp1MEI5MFpOWHhzWldPcjIxL1pnQXBMUm4yREh6ZUEvMTIzQ29wVFM1K09DWHRmTzJCRU5scWg1eDRoaQpvSWhWSUw2UHRyTkowZk11V3p2amZ3NHFmMDlhOFljenprejdxOXFVc3lWVVphZkpnZGlET3F6MzRtam92Wm16ClZnK0FTZ0ZvSUwvNWJjVFJkTDk1cGlsRjlOaTU2Ni9zTkFJZ3B3Y0xLdz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0KPC9jZXJ0Pgo8Y2E+Ci0tLS0tQkVHSU4gQ0VSVElGSUNBVEUtLS0tLQpNSUlET1RDQ0FpR2dBd0lCQWdJVWE3OGRKckNIOU1xWURscnlCWHFXUXpCRWpiRXdEUVlKS29aSWh2Y05BUUVMCkJRQXdFREVPTUF3R0ExVUVBd3dGWkhOd1hHNHdIaGNOTVRrd09UQXhNakV3TnpJeldoY05Namt3T0RJNU1qRXcKTnpJeldqQVFNUTR3REFZRFZRUUREQVZrYzNCY2JqQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQwpBUW9DZ2dFQkFOSWlpZ0RzeFF0UHplMVA2bzdSb0dXZSt6OGRVemttbUpvT0FBdHU0Sm5BaHNLeEpsa3J2ZzAvCkZqWXBCRE5BY3AzenExbEtuWFBoUE5PMmNlRjVRMnppRXFtbDJsUU4wSVJsWEx2ZzdmYStDSDZLQUl2ZENxZHUKNHFiUnFkbTQrVnZQRVZQa0p0c0kzOWlaREVXZkk3eFVUZWs5L1I4ajYyOWtVRnlaYU5ycDFyS1NaQTZYRk9zRAo3aFdPdE8vQjRidWtncFQxSG5DTWFURVBUUzNUSTF1WHdINXlPRE5yUmhjeHNJR1pYK3Y2WE5sUEEzWlZ3T3RmCmFYMExBT1N6dWFlQmhtZ3Exc0JUU29iM0xpdGZKSmpKZHFMLzVaaGpEc3R1V0ZxVWhhUXNGUnVNZitEVHhuK2EKSUh4QXQ2NlBqcmZXZUsra2dTb0xsTWcyKzBaQUxyVUNBd0VBQWFPQmlqQ0JoekFkQmdOVkhRNEVGZ1FVOXA5SApsQmUxWkhsU2pYQ0xFKzZ0YVBzL1pRZ3dTd1lEVlIwakJFUXdRb0FVOXA5SGxCZTFaSGxTalhDTEUrNnRhUHMvClpRaWhGS1FTTUJBeERqQU1CZ05WQkFNTUJXUnpjRnh1Z2hScnZ4MG1zSWYweXBnT1d2SUZlcFpETUVTTnNUQU0KQmdOVkhSTUVCVEFEQVFIL01Bc0dBMVVkRHdRRUF3SUJCakFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBZ1l0Tgo3RVl1R1htUFA4RWdNMmc2MDBab2lzT0xhL1QyWjg3RDMxTlFueWZEWWJseWtlZGx6V0xrRko1Z3RiWjM5aVcvCmovTFVsUTNlVHpuVzYwZkI5VWc1WDBjQjB0UHg4a3Z0MWNwZHFIQTFYanZvOEV4OGhBTFdONUhiRlpvSlhWV1kKR1VnRXVKSjBDRXJFKzNKVllJblBBOE5IZHpqREJEd1grMzJZeThXQ2oraG5lK3FPN002MlREU0RraXo1dFJXKwpwRWl5TnFKbXJtVm43enFDZDZCOXg5ZUFDSktVTFVKcXgrRzFKd1V2MHhCbmZQcXJwTForK3RsQklramw4VzhXCmczOTZZdGpScVVFWXBLL1pjcUEvS2IzT2JxblB4L1hldjlLa1B6dFF6UW9OajYyeXBzSURlM1YzR3dVamV5QjkKR1kzdXRNNjIyZDluZGR3STNBPT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo8L2NhPgprZXktZGlyZWN0aW9uIDEKPHRscy1hdXRoPgojCiMgMjA0OCBiaXQgT3BlblZQTiBzdGF0aWMga2V5CiMKLS0tLS1CRUdJTiBPcGVuVlBOIFN0YXRpYyBrZXkgVjEtLS0tLQo1ZTVhN2VkNmI2NWM1MzA1NWU3YmZjMmZjMzYxMDAwMgoxMTJkNjE5MzNmM2FkODczYmU0OWJkNzA1MDMwYzQ1NAplNjg2ODEwOThmYjFhYzg4NDNiZDQ3ZDM2NDgzM2VlMQowNTg4OTQ4ZTliNWU4ZmU1ODIzZjZmZDJkOGI0YjU4ZQo2YjcxOWUxNWI0YmU4YjMwM2QzMGM5NzY4YWYzNzhmNQphNTJhNDE3ZDYwZmRjNGEwNzczNmFiYzhjMDgyMWU3Zgo5MTU2NzZlOGM2Yjk3ZDAxMTg4NzU5MDMyNmRlZmFlMAo5NDA3NzVmMGI0MTNlNjA0MzQyN2ZmOTBkODdlNjVjYQpjNzAxZGIxYmVmZmVmN2M2Y2U4NWNmZDQ3Mjk0NTBkMgplOTNkY2EwZDI1ZWMxN2MyZDcxZjRjYTgzZTM4NGM1MAoyOTM4MWRkMjYzMGJhNzRlZTM3OGE3YTljNjMxNjZjNQo3OGMzYjFiODIxMTlmNGM4Y2VmNDJlYWRhNjI0Y2VjNwpiMDI0ZjUzNGQ0ZDA2YzVjOTgyMmE2Y2NjODRkOWYzMQo5MjllMzEyYjFkY2FjMjVlYTg5NjUxYTUyMDE1MDVlMgo4NDBkZTM3N2RiYjY3ZDUwMjI5NDM0YWJjYjQzOWRhZAo2YWE2MGQyZjNjZTIwNGU0ZWVkMDQ5YWY0MmY2YzBjNAotLS0tLUVORCBPcGVuVlBOIFN0YXRpYyBrZXkgVjEtLS0tLQo8L3Rscy1hdXRoPgoKcmVkaXJlY3QtZ2F0ZXdheSBkZWYxCg==";

    dockerVPN.getCertificateVPN("existent", testDir, (err, data) => {
      expect(err).to.be.null;
      expect(new Buffer(data).toString("base64")).to.be.eql(bExistent);
      done();
    });
  });

  it('Should get names', (done) => {
    const names = ['existent', 'existent2'];
    dockerVPN.getNames(testDir, (err, data) => {
      expect(err).to.be.null;
      expect(data).to.be.eql(names);
      done();
    });
  });
  it('Should remove existent', (done) => {
    dockerVPN.removeVPN('existent', testDir, (err, data) => {
      expect(err).to.be.null;
      expect(path.join(appRoot.toString(), "test", "util" ,"vpnDir", "existent.ovpn")).to.not.be.path();
      done();
    });
  });
  it('Should get all vpns', (done) => {
    const names = ['existent', 'existent2'];
    const isRunning = [true, false];
    execSync("docker run -d --rm --name dsp-vpn-existent dockersecplayground/alpine tail -f /dev/null");
    dockerVPN.getAllVPN(testDir, (err, data) => {
      // console.log(data);
      expect(err).to.be.null;
      expect(data.map((d) => d.name)).to.be.eql(names);
      expect(data.map((d) => d.isRunning)).to.be.eql(isRunning);
      execSync("docker rm -f dsp-vpn-existent");
      done();
    });
  });
  after((done) => {
    // execSync("docker volume rm existent");
    done();
  });
});
