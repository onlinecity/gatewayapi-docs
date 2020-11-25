SMPP
====

We offer SMPP connection for select customers. Contact sales@gatewayapi.com to get access. We use SMPP version 3.4, which should be backwards compatible with version 3.3.

Connection
----------
Use the following to connect. We recommend to connect to two hosts. When we do scheduled maintainence, only one host is restarted at a time. By keeping a connection to two hosts, constant connectivity can be achieved.

================= =================================
Host              a.smpp.gatewayapi.com
Host              b.smpp.gatewayapi.com
Port              2775
Port TLS          8775
Bind type         Transceiver or transmitter and receiver.
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

We currently do not support `Schedule Delivery Time` on `submit_sm`.

Delivery reports
----------------
Connect with at least one transceiver or receiver to receive delivery reports. A maximum of 25.000 unacknowledged reports will be kept for 48 hours.

The delivery report format is as follows:

.. code-block:: none

    id:{message_id} sub:{message_sub} dlvrd:{message_dlvrd}
    submit date:{message_submit_date} done date:{message_done_date}
    stat:{message_stat} err:{message_err}

Following status types:

* ENROUTE
* DELIVRD
* EXPIRED
* UNDELIV
* ACCEPTD
* UNKNOWN
* REJECTD


Coding schemes
----------------

Following DCS values are supported

===== ====================
DCS   Encoding
===== ====================
0     IA5 / GSM7
3     Latin1 / ISO-8859-1
8     UCS2
===== ====================


TLV fields
----------------

We support the following common TLV fields for `submit_sm` as well as one our own custom for use with message classes.

======== ======================= ============= ========================
Tag      Name                    Size          Description
======== ======================= ============= ========================
0x0005   dest_addr_subunit       1 byte        For "flash" sms
0x0204   user_message_reference  2 bytes       User assigned reference for delivery reports
0x0424   message_payload         1 byte        For sending messages longer than 255 octets
0x2900   message_class           octetstring   To send with a specific GatewayAPI messageclass
======== ======================= ============= ========================
