#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=1
P0PORT=1011
CAPORT=1010
PEERPEM=organizations/peerOrganizations/hospital/tlsca/tlsca.hospital-cert.pem
CAPEM=organizations/peerOrganizations/hospital/ca/ca.hospital-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/hospital/connection-hospital.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/hospital/connection-hospital.yaml

ORG=2
P0PORT=1021
CAPORT=1020
PEERPEM=organizations/peerOrganizations/laboratory/tlsca/tlsca.laboratory-cert.pem
CAPEM=organizations/peerOrganizations/laboratory/ca/ca.laboratory-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/laboratory/connection-laboratory.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/laboratory/connection-laboratory.yaml

ORG=3
P0PORT=1041
CAPORT=1040
PEERPEM=organizations/peerOrganizations/pharmacy/tlsca/tlsca.pharmacy-cert.pem
CAPEM=organizations/peerOrganizations/pharmacy/ca/ca.pharmacy-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/pharmacy/connection-pharmacy.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/pharmacy/connection-pharmacy.yaml


ORG=4
P0PORT=1051
CAPORT=1050
PEERPEM=organizations/peerOrganizations/insProvider/tlsca/tlsca.insProvider-cert.pem
CAPEM=organizations/peerOrganizations/insProvider/ca/ca.insProvider-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/insProvider/connection-insProvider.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/insProvider/connection-insProvider.yaml
