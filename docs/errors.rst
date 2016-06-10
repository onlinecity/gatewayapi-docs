Error code index
================
You may encounter errors not listed here, but we try to keep this list updated.
If you get an error it will always be accompanied with an error description, so
this list provides a reference, but you don't need to know all these.

All error codes in gatewayapi.com follow the same pattern. They are a 32-bit
unsigned integer, often represented in hex format as four hex chars, ie. 0x104A.
The first two hex chars (first byte), represent the origin of the error. The
following list of error codes are divided into sections depending on the origin.


General error codes
-------------------
Regardless of the error origin, all error codes that end in 00-0F, have the same
meaning.
These do not map to a specific error, but may be caused by different issues
depending on the context. Thus these are left undocumented since the exact cause
varies.

====  =========================================
Code  Description
====  =========================================
00    Success (no error)
01    Unknown error
02    Generic NACK
03    Operation not permitted
04    Input/output error
05    Shutting down
06    Insufficient Resources
07    Permission denied
08    Invalid Argument
09    Resource temporarily unavailable (EAGAIN)
====  =========================================

This means that if you get an 0x1001, it's an "Unknown error" from the
`SMS Errors`_. If you get an 0x0308 it's an "Invalid Argument" from
`API Errors`_ etc.

.. _apierror:

API Errors
----------
These cover codes 0x0100-0x07FF. You might encounter these when
communicating with one of our API's ie. :ref:`rest`.

======  =======================
 Code   Description
======  =======================
0x0210  Invalid username: %1
0x0211  Invalid password
0x0212  Invalid IP-address: %1
0x0213  Unauthorized IP-address: %1
0x0214  Temporary blacklist for MSISDN %1 with hash %2
0x0215  MSISDN %1 blacklisted
0x0216  Insufficient credit
0x0217  Unauthorized destination: country %1
0x0218  Unknown message class id %1
0x0219  E-mail not enabled for account
0x021A  HLR not enabled for account
0x021B  Phonebook not enabled for account
0x021C  MMS not enabled for account
0x021D  SMS not enabled for account
0x021E  Message class %1 is not configured for %2
0x021F  Unauthorized operator: MCC %1, MNC %2
0x0220  Unsupported parameter %1
0x0221  Unsupported signature method %1
0x0222  Missing required parameter %1
0x0223  Invalid Consumer Key
0x0224  Invalid signature
0x0225  Expired timestamp
0x0226  Invalid / used nonce
0x0227  No push settings for account %1
0x0228  No push setting for VAS ID
0x0229  Invalid token
0x0310  A message contains the same recipient more than once. MSISDNs %1 is duplicated
0x0311  Priority %1 not available
======  =======================

.. _smserror:

SMS Errors
----------
The following table is an exhaustive list of error codes that might be returned
to you in a Delivery Status Notification. We do our best to keep track of all
these, but some may be missing. Not all error codes are relevant or expected to
occur in normal operations. This section covers codes 0x0100-0x01FF.

These supplement the :ref:`states` to provide additional insight on
failures.

======= ====== =============================================
Group   Code   Description
======= ====== =============================================
HLR     0x1010 Unknown subscriber
HLR     0x1011 Call barred
HLR     0x1012 Teleservice not provisioned
HLR     0x1013 Absent subscriber
HLR     0x1014 Facility not supported
HLR     0x1015 HLR System failure
HLR     0x1016 Unexpected data value
HLR     0x1017 HLR Data missing
HLR     0x1018 Memory capacity exceeded
HLR     0x1019 Mobile subscriber not reachable
HLR     0x101A VLR System failure
HLR     0x101B HLR Internal Error
MSC     0x1020 Unidentified subscriber
MSC     0x1021 Absent subscriber, IMSI detached
MSC     0x1022 Absent subscriber, no page response
MSC     0x1023 Subscriber busy for MT SMS
MSC     0x1024 Facility not supported
MSC     0x1025 Illegal subscriber
MSC     0x1026 Illegal equipment
MSC     0x1027 System failure
MSC     0x1028 Unexpected data value
MSC     0x1029 Data missing
MSC     0x102A Memory capacity exceeded
MSC     0x102B Equipment protocol error
MSC     0x102C Equipment not short message equipped
MSC     0x102D Illegal error
MSC     0x102E MSC Internal Error
SCREEN  0x1030 Screening block
SCREEN  0x1031 Terminating IMSI blocked
SCREEN  0x1032 Originating location mismatch
SCREEN  0x1033 Error, originator blocked
SCREEN  0x1034 Error, destination blocked
SCREEN  0x1035 Error, keyword blocked
SCREEN  0x1036 Error, SC address blocked
SCREEN  0x1037 Error, blocked due to exceeded quota
SCREEN  0x1038 Error, loop detected
SCREEN  0x1039 Error, data coding scheme blocked
SCREEN  0x103A Error, information element identifier blocked
SCREEN  0x103B Error, personal service barring, MO
SCREEN  0x103C Error, personal service barring, MT
SMSC    0x1040 Unidentified Subscriber
SMSC    0x1041 Facility not supported
SMSC    0x1042 System failure
SMSC    0x1043 Unexpected data value
SMSC    0x1044 Data missing
SMSC    0x1045 Equipment protocol error
SMSC    0x1046 Unknown service centre address
SMSC    0x1047 Service centre congestion
SMSC    0x1048 Invalid short message entity address
SMSC    0x1049 Subscriber not service centre subscriber
SMSC    0x104A SMSC Internal Error
ROUTE   0x1050 Internal routing error
ROUTE   0x1051 Unsupported number plan
ROUTE   0x1052 Unsupported type of number
ROUTE   0x1053 Message not deliver
ROUTE   0x1054 Dialling zone not found
ROUTE   0x1055 Not home zone and IMSI not allowed
ROUTE   0x1056 Not home zone and IMSI fetch failed
ROUTE   0x1057 Destination network type unknown
ESME    0x1060 Invalid destination address
ESME    0x1061 Invalid destination numbering plan
ESME    0x1062 Invalid destination type of number
ESME    0x1063 Invalid destination flag
ESME    0x1064 Invalid number of destinations
ESME    0x1065 Invalid source address
ESME    0x1066 Invalid source numbering plan
ESME    0x1067 Invalid source type of number
ESME    0x1068 ESME Receiver permanent error
ESME    0x1069 ESME Receiver reject error
ESME    0x106A ESME Receiver temporary error
ESME    0x106B Invalid command length
ESME    0x106C Invalid service type
ESME    0x106D Invalid operation
ESME    0x106E Operation not allowed
ESME    0x106F Invalid parameter
ESME    0x1070 Parameter not allowed
ESME    0x1071 Invalid parameter length
ESME    0x1072 Invalid optional parameter
ESME    0x1073 Optional parameter missing
ESME    0x1074 Invalid validity parameter
ESME    0x1075 Invalid scheduled delivery parameter
ESME    0x1076 Invalid distribution list
ESME    0x1077 Invalid message class
ESME    0x1078 Invalid message length
ESME    0x1079 Invalid message reference
ESME    0x107A Invalid number of messages
ESME    0x107B Invalid predefined message
ESME    0x107C Invalid priority
ESME    0x107D Invalid replace flag
ESME    0x107E Request failed
ESME    0x107F Invalid delivery report request
ESME    0x1080 Message queue full
ESME    0x1081 External error
ESME    0x1082 Cannot find information
ESME    0x1081 IMSI lookup blocked
ESME    0x1082 ESME error
ESME    0x1082 ESME Internal error
ESME    0x1083 ESME Unknown external error
ESME    0x1084 Invalid Mobile Subscriber
ESME    0x1085 Short message exceeds maximum
ESME    0x1086 Unable to Unpack GSM message
ESME    0x1087 Unable to convert IRA Alphabet
SP      0x1090 Internal error
SP      0x1091 Network time-out
SP      0x1092 Operation barred - insufficient funds
SP      0x1093 Illegal mobile subscriber - blocked
SP      0x1094 Refunded by network operator
======= ====== =============================================
