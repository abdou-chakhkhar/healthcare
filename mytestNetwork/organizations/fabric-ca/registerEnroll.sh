#!/bin/bash

function createHospital() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/hospital/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/hospital/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:1010 --caname ca-hospital --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-1010-ca-hospital.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-1010-ca-hospital.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-1010-ca-hospital.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-1010-ca-hospital.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/hospital/msp/config.yaml"

  # Since the CA serves as both the organization CA and TLS CA, copy the org's root cert that was generated by CA startup into the org level ca and tlsca directories

  # Copy hospital's CA cert to hospital's /msp/tlscacerts directory (for use in the channel MSP definition)
  mkdir -p "${PWD}/organizations/peerOrganizations/hospital/msp/tlscacerts"
  cp "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem" "${PWD}/organizations/peerOrganizations/hospital/msp/tlscacerts/ca.crt"

  # Copy hospital's CA cert to hospital's /tlsca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/hospital/tlsca"
  cp "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem" "${PWD}/organizations/peerOrganizations/hospital/tlsca/tlsca.hospital-cert.pem"

  # Copy hospital's CA cert to hospital's /ca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/hospital/ca"
  cp "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem" "${PWD}/organizations/peerOrganizations/hospital/ca/ca.hospital-cert.pem"

  # ===========================================================
  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-hospital --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  # ===========================================================

  infoln "Registering peer1"
  set -x
  fabric-ca-client register --caname ca-hospital --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  # ===========================================================

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-hospital --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  # ===========================================================

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-hospital --id.name hospitaladmin --id.secret hospitaladminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  # ===========================================================

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1010 --caname ca-hospital -M "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/msp" --csr.hosts peer0.hospital --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hospital/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/msp/config.yaml"

  # ===========================================================

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1010 --caname ca-hospital -M "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls" --enrollment.profile tls --csr.hosts peer0.hospital --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls/keystore/"* "${PWD}/organizations/peerOrganizations/hospital/peers/peer0.hospital/tls/server.key"

  # ===========================================================
  # ===========================================================

  infoln "Generating the peer1 msp"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1010 --caname ca-hospital -M "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/msp" --csr.hosts peer1.hospital --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hospital/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/msp/config.yaml"

  # ===========================================================

  infoln "Generating the peer1-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1010 --caname ca-hospital -M "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls" --enrollment.profile tls --csr.hosts peer1.hospital --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls/keystore/"* "${PWD}/organizations/peerOrganizations/hospital/peers/peer1.hospital/tls/server.key"

  # ===========================================================

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:1010 --caname ca-hospital -M "${PWD}/organizations/peerOrganizations/hospital/users/User1@hospital/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hospital/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hospital/users/User1@hospital/msp/config.yaml"
  
  # ===========================================================
  
  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://hospitaladmin:hospitaladminpw@localhost:1010 --caname ca-hospital -M "${PWD}/organizations/peerOrganizations/hospital/users/Admin@hospital/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/hospital/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hospital/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hospital/users/Admin@hospital/msp/config.yaml"
}

function createLaboratory() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/laboratory/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/laboratory/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:1020 --caname ca-laboratory --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-1020-ca-laboratory.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-1020-ca-laboratory.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-1020-ca-laboratory.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-1020-ca-laboratory.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/laboratory/msp/config.yaml"

  # Since the CA serves as both the organization CA and TLS CA, copy the org's root cert that was generated by CA startup into the org level ca and tlsca directories

  # Copy laboratory's CA cert to laboratory's /msp/tlscacerts directory (for use in the channel MSP definition)
  mkdir -p "${PWD}/organizations/peerOrganizations/laboratory/msp/tlscacerts"
  cp "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem" "${PWD}/organizations/peerOrganizations/laboratory/msp/tlscacerts/ca.crt"

  # Copy laboratory's CA cert to laboratory's /tlsca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/laboratory/tlsca"
  cp "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem" "${PWD}/organizations/peerOrganizations/laboratory/tlsca/tlsca.laboratory-cert.pem"

  # Copy laboratory's CA cert to laboratory's /ca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/laboratory/ca"
  cp "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem" "${PWD}/organizations/peerOrganizations/laboratory/ca/ca.laboratory-cert.pem"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-laboratory --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering peer1"
  set -x
  fabric-ca-client register --caname ca-laboratory --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-laboratory --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-laboratory --id.name laboratoryadmin --id.secret laboratoryadminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1020 --caname ca-laboratory -M "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/msp" --csr.hosts peer0.laboratory --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/laboratory/msp/config.yaml" "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1020 --caname ca-laboratory -M "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls" --enrollment.profile tls --csr.hosts peer0.laboratory --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls/keystore/"* "${PWD}/organizations/peerOrganizations/laboratory/peers/peer0.laboratory/tls/server.key"

  infoln "Generating the peer1 msp"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1020 --caname ca-laboratory -M "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/msp" --csr.hosts peer1.laboratory --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/laboratory/msp/config.yaml" "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/msp/config.yaml"

  infoln "Generating the peer1-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1020 --caname ca-laboratory -M "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls" --enrollment.profile tls --csr.hosts peer1.laboratory --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls/keystore/"* "${PWD}/organizations/peerOrganizations/laboratory/peers/peer1.laboratory/tls/server.key"

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:1020 --caname ca-laboratory -M "${PWD}/organizations/peerOrganizations/laboratory/users/User1@laboratory/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/laboratory/msp/config.yaml" "${PWD}/organizations/peerOrganizations/laboratory/users/User1@laboratory/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://laboratoryadmin:laboratoryadminpw@localhost:1020 --caname ca-laboratory -M "${PWD}/organizations/peerOrganizations/laboratory/users/Admin@laboratory/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/laboratory/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/laboratory/msp/config.yaml" "${PWD}/organizations/peerOrganizations/laboratory/users/Admin@laboratory/msp/config.yaml"
}

function createPharmacy() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/pharmacy/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/pharmacy/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:1040 --caname ca-pharmacy --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-1040-ca-pharmacy.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-1040-ca-pharmacy.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-1040-ca-pharmacy.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-1040-ca-pharmacy.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/pharmacy/msp/config.yaml"

  # Since the CA serves as both the organization CA and TLS CA, copy the org's root cert that was generated by CA startup into the org level ca and tlsca directories

  # Copy pharmacy's CA cert to pharmacy's /msp/tlscacerts directory (for use in the channel MSP definition)
  mkdir -p "${PWD}/organizations/peerOrganizations/pharmacy/msp/tlscacerts"
  cp "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem" "${PWD}/organizations/peerOrganizations/pharmacy/msp/tlscacerts/ca.crt"

  # Copy pharmacy's CA cert to pharmacy's /tlsca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/pharmacy/tlsca"
  cp "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem" "${PWD}/organizations/peerOrganizations/pharmacy/tlsca/tlsca.pharmacy-cert.pem"

  # Copy pharmacy's CA cert to pharmacy's /ca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/pharmacy/ca"
  cp "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem" "${PWD}/organizations/peerOrganizations/pharmacy/ca/ca.pharmacy-cert.pem"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-pharmacy --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering peer1"
  set -x
  fabric-ca-client register --caname ca-pharmacy --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-pharmacy --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-pharmacy --id.name pharmacyadmin --id.secret pharmacyadminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1040 --caname ca-pharmacy -M "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/msp" --csr.hosts peer0.pharmacy --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/pharmacy/msp/config.yaml" "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1040 --caname ca-pharmacy -M "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls" --enrollment.profile tls --csr.hosts peer0.pharmacy --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls/keystore/"* "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer0.pharmacy/tls/server.key"

  infoln "Generating the peer1 msp"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1040 --caname ca-pharmacy -M "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/msp" --csr.hosts peer1.pharmacy --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/pharmacy/msp/config.yaml" "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/msp/config.yaml"

  infoln "Generating the peer1-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1040 --caname ca-pharmacy -M "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls" --enrollment.profile tls --csr.hosts peer1.pharmacy --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls/keystore/"* "${PWD}/organizations/peerOrganizations/pharmacy/peers/peer1.pharmacy/tls/server.key"


  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:1040 --caname ca-pharmacy -M "${PWD}/organizations/peerOrganizations/pharmacy/users/User1@pharmacy/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/pharmacy/msp/config.yaml" "${PWD}/organizations/peerOrganizations/pharmacy/users/User1@pharmacy/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://pharmacyadmin:pharmacyadminpw@localhost:1040 --caname ca-pharmacy -M "${PWD}/organizations/peerOrganizations/pharmacy/users/Admin@pharmacy/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/pharmacy/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/pharmacy/msp/config.yaml" "${PWD}/organizations/peerOrganizations/pharmacy/users/Admin@pharmacy/msp/config.yaml"
}

function createInsProvider() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/insProvider/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/insProvider/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:1050 --caname ca-insProvider --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-1050-ca-insProvider.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-1050-ca-insProvider.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-1050-ca-insProvider.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-1050-ca-insProvider.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/insProvider/msp/config.yaml"

  # Since the CA serves as both the organization CA and TLS CA, copy the org's root cert that was generated by CA startup into the org level ca and tlsca directories

  # Copy insProvider's CA cert to insProvider's /msp/tlscacerts directory (for use in the channel MSP definition)
  mkdir -p "${PWD}/organizations/peerOrganizations/insProvider/msp/tlscacerts"
  cp "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem" "${PWD}/organizations/peerOrganizations/insProvider/msp/tlscacerts/ca.crt"

  # Copy insProvider's CA cert to insProvider's /tlsca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/insProvider/tlsca"
  cp "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem" "${PWD}/organizations/peerOrganizations/insProvider/tlsca/tlsca.insProvider-cert.pem"

  # Copy insProvider's CA cert to insProvider's /ca directory (for use by clients)
  mkdir -p "${PWD}/organizations/peerOrganizations/insProvider/ca"
  cp "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem" "${PWD}/organizations/peerOrganizations/insProvider/ca/ca.insProvider-cert.pem"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-insProvider --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering peer1"
  set -x
  fabric-ca-client register --caname ca-insProvider --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-insProvider --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-insProvider --id.name insProvideradmin --id.secret insProvideradminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1050 --caname ca-insProvider -M "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/msp" --csr.hosts peer0.insProvider --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/insProvider/msp/config.yaml" "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:1050 --caname ca-insProvider -M "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls" --enrollment.profile tls --csr.hosts peer0.insProvider --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls/keystore/"* "${PWD}/organizations/peerOrganizations/insProvider/peers/peer0.insProvider/tls/server.key"


  infoln "Generating the peer1 msp"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1050 --caname ca-insProvider -M "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/msp" --csr.hosts peer1.insProvider --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/insProvider/msp/config.yaml" "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/msp/config.yaml"

  infoln "Generating the peer1-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:1050 --caname ca-insProvider -M "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls" --enrollment.profile tls --csr.hosts peer1.insProvider --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the peer's tls directory that are referenced by peer startup config
  cp "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls/keystore/"* "${PWD}/organizations/peerOrganizations/insProvider/peers/peer1.insProvider/tls/server.key"


  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:1050 --caname ca-insProvider -M "${PWD}/organizations/peerOrganizations/insProvider/users/User1@insProvider/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/insProvider/msp/config.yaml" "${PWD}/organizations/peerOrganizations/insProvider/users/User1@insProvider/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://insProvideradmin:insProvideradminpw@localhost:1050 --caname ca-insProvider -M "${PWD}/organizations/peerOrganizations/insProvider/users/Admin@insProvider/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/insProvider/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/insProvider/msp/config.yaml" "${PWD}/organizations/peerOrganizations/insProvider/users/Admin@insProvider/msp/config.yaml"
}

function createOrderer() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/ordererOrganizations/example.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/ordererOrganizations/example.com

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:1030 --caname ca-orderer --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-1030-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-1030-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-1030-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-1030-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml"

  # Since the CA serves as both the organization CA and TLS CA, copy the org's root cert that was generated by CA startup into the org level ca and tlsca directories

  # Copy orderer org's CA cert to orderer org's /msp/tlscacerts directory (for use in the channel MSP definition)
  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/msp/tlscacerts"
  cp "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem" "${PWD}/organizations/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

  # Copy orderer org's CA cert to orderer org's /tlsca directory (for use by clients)
  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/tlsca"
  cp "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem" "${PWD}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem"

  infoln "Registering orderer"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering orderer2"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name orderer2 --id.secret ordererpw --id.type orderer --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering orderer3"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name orderer3 --id.secret ordererpw --id.type orderer --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the orderer admin"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null




  infoln "Generating the orderer msp"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp" --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/config.yaml"

  infoln "Generating the orderer-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls" --enrollment.profile tls --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the orderer's tls directory that are referenced by orderer startup config
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/signcerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/keystore/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

  # Copy orderer org's CA cert to orderer's /msp/tlscacerts directory (for use in the orderer MSP definition)
  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"






  infoln "Generating the orderer2 msp"
  set -x
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/msp" --csr.hosts orderer2.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/config.yaml"

  infoln "Generating the orderer2-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls" --enrollment.profile tls --csr.hosts orderer2.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the orderer's tls directory that are referenced by orderer startup config
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/ca.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/signcerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/keystore/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.key"

  # Copy orderer org's CA cert to orderer's /msp/tlscacerts directory (for use in the orderer MSP definition)
  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"





  infoln "Generating the orderer3 msp"
  set -x
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/msp" --csr.hosts orderer3.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/config.yaml"

  infoln "Generating the orderer3-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls" --enrollment.profile tls --csr.hosts orderer3.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  # Copy the tls CA cert, server cert, server keystore to well known file names in the orderer's tls directory that are referenced by orderer startup config
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/ca.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/signcerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/keystore/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.key"

  # Copy orderer org's CA cert to orderer's /msp/tlscacerts directory (for use in the orderer MSP definition)
  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"





  infoln "Generating the admin msp"
  set -x
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:1030 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/ca-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp/config.yaml"
}
