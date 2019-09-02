OVPN_DATA="ovpn-dsp"
docker volume create --name $OVPN_DATA
docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm dockersecplayground/vpn ovpn_genconfig -u udp://localhost
docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm -it dockersecplayground/vpn ovpn_initpki
docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm -it kylemanna/openvpn easyrsa build-client-full dsp nopass
docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm kylemanna/openvpn ovpn_getclient dsp > dsp.ovpn

# docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm --name dsp -it kylemanna/openvpn ovpn_initpki




