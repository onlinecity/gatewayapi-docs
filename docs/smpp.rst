SMPP
====

We offer SMPP connection for select customers. Contact sales@gatewayapi.com to get access. We use SMPP version 3.4, which should be backwards compatible with version 3.3.

Connection
----------
Use the following to connect

================= =================================
Host              smpp1.gatewayapi.com
Port              7777
Port TLS          7778
Bind type         Transceiver or transmitter and receiver.
Maximum sessions  1 transceiver or 1 transmitter/receiver.
================= =================================

Supported SMPP commands
-----------------------
The following commands are supported

======================  ==========
Command                 Hex
======================  ==========
generic_nack            0x80000000
bind_receiver           0x00000001
bind_receiver_resp      0x80000001
bind_transmitter        0x00000002
bind_transmitter_resp   0x80000002
submit_sm               0x00000004
submit_sm_resp          0x80000004
deliver_sm              0x00000005
deliver_sm_resp         0x80000005
unbind                  0x00000006
unbind_resp             0x80000006
bind_transceiver        0x00000009
bind_transceiver_resp   0x80000009
enquire_link            0x00000015
enquire_link_resp       0x80000015
======================  ==========

bind_receiver, bind_transmitter, bind_transceiver
-------------------------------------------------
Multiple sessions are supported but must be enabled in SMPP server.

*Note* that only first active session binded as transceiver or receiver will receive delivery receipts.

======== ================= ===================
Type     Field             Description
======== ================= ===================
COctet   system_id         Account information
COctet   password          Account information
COctet   system_type       Empty or "EX"
Integer  interface_version 0x33 or 0x34
Integer  addr_ton          Ignored
Integer  addr_npi          Ignored
COctet   address_range     Ignored
======== ================= ===================
