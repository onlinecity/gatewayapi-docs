Kannel API
==========

For this API you need a set of credentials. These are different from the
OAuth API the Rest API uses. You'll find them in the dashboard, under "API".

We use the term Kannel API, because this is an API designed specifically for
the Open Source Kannel SMS Gateway. It uses the Kannel--HTTP--Kannel interface,
which we re-implemented in gatewayapi based on the `Kannel source code`_.

.. _config:

Config
------
To use the API simply set up a new Kannel SMSC::

   group = smsc
   smsc = http
   system-type = kannel
   smsc-id = oc
   port = 13019
   send-url = "https://gatewayapi.com/kannel/sendsms/standard"
   smsc-username = "{YOUR CREDENTIAL USERNAME}"
   smsc-password = "{YOUR CREDENTIAL PASSWORD}"

The last path fragment is the message class to use. In this example set to
'standard'

The important part is that you set the ``system-type`` to ``kannel``, which
tells Kannel to use it's own protocol for this SMSC.

Features
--------

Our kannel API is (almost) fully featured. The implemented features are listed
below with their `variable`_.

charset
   We support Windows-1252, UTF-8 and UTF-16BE.
coding
   You can send a SMS with :term:`GSM 03.38` (default), 8-bit or UCS-2 encoding.
dlr-url
   Specify an URL and have us call it with delivery status reports.
validity
   Have the SMS expire X minutes from now, so if not delivered will be discarded.
deferred
   Have the SMS delivered X minutes in the future.
mclass
   Send a SMS to the ie. screen directly. Aka flash sms.
account
   Account name or number to enable tracing in your own systems. Will be set in userref.
udh
   You may specify your udh and optionally binary SMS body for full control.
from
   You may set an alphanumeric sender max 11 chars, or up to 15 digits for a phonenumber.

The only feature we don't support yet is MWI (message waiting indicator). If
you have a good use case for this feature, let us know in the live chat, and
we'll add it to the feature request tracker.


Delivery Reports
----------------
If you are not already an expert on kannels status reports, take a brief look
at `Chapter 10 SMS Delivery Reports`_.

You are expected to provide a URL, which contains one or more variables which
kannel then replaces with data. Especially ``%d`` which gives back the report
type or 'status code'.

Variables
^^^^^^^^^

``%d``
   Kannel report type, ie. 1 for delivered.
``%A``
   The answer of the SMSC. We give an answer in the form ``status`` ``/`` (``errorcode``).
``%p``
   The MSISDN of the phone who received the message.
``%q``
   The international phone number (:term:`E.164`), who received the message.
``%T``
   The time of the delivery report expressed as seconds since unix epoch.
``%F``
   The SMS ID used on GatewayAPI.com to track the message.
``%o``
   The userref/account for this SMS if specified.


DLR URL Chaining
^^^^^^^^^^^^^^^^

The normal behavior is for you to provide the dlr-url to your kannel server,
when you send an SMS using the /cgi-bin/sendsms interface. Then as the final
destination we will call your URL and not your kannel server. However if this
is not what you want, maybe you have firewall blocking it, you can have us
call your kannel server, which will then forward or chain the DLR to your server
as if your kannel server was the final destination. This is explained in some
length in the `Kannel source code`_.

Should you have a need for kannel to receive the DLR and then forward it to
you as "normal" then add this to your config::

   dlr-url = "http://203.0.113.1:13019/?username=SAME_AS_SMSC&password=SAME_AS_SMSC"
   connect-allow-ip = 77.66.39.*

You would have to replace the IP with a public IP where we can reach your
server. Also make sure username and password is the same as in the
:ref:`config` above.


Caveats
-------

Concatenated SMS
^^^^^^^^^^^^^^^^

In order to support concatenated SMS, make sure to set the smsbox config var
``sms-length`` to something more than the default 140. Kannel will then split
long SMS'es into several parts and set an UDH to allow the end user device to
concatenate them together. Unfortunately kannel insists on doing this on it's
end, so in the GatewayAPI traffic log it is going to show each segment
separately.


Feedback appreciated
^^^^^^^^^^^^^^^^^^^^

This is a brand new API and although it's tested extensively, it might not
exactly fit your kannel setup. We really appreciate feedback on this API.
Please contact us via the livechat, especially if you have an urgent situation.

.. _`Kannel source code`: https://redmine.Kannel.org/projects/Kannel/repository/annotate/tags/version_1_4_4/gw/smsc/smsc_http.c#L451
.. _`Variable`: http://www.kannel.org/download/1.4.4/userguide-1.4.4/userguide.html#AEN5095
.. _`Chapter 10 SMS Delivery Reports`: http://www.kannel.org/download/1.4.4/userguide-1.4.4/userguide.html#delivery-reports
