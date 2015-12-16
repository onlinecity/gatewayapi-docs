Legacy HTTP API
===============

Sending SMS'es
--------------

httppost.nimta.com
^^^^^^^^^^^^^^^^^^

It's currently the endpoint with the most traffic and it's not going away for
the foreseeable future. However we are deprecating it since the REST API is
where all future development takes place.

This API is deprecated and only supports sending limited SMS messages. Despite
the name you can send both GET and POST requests to this API endpoint.


.. http:post:: /sendsms
   :deprecated:

   Send a SMS message.

   Should only be performed via HTTPS connections since it contains plaintext
   credentials.

   Arguments can be sent as POST (form encoded) or as GET.

   :form user: account username
   :form password: account password
   :form to: One or more MSISDNs to send a message to. Ie 4512345678
   :form smsc: An ISO 3166-1 country code followed by a period and an ID representing the operator
   :form price: A numeric value with two decimals followed by an ISO 4217 currency code, ie. 10.00DKK
   :form text: An alphanumeric value representing the content of the SMS
   :form sessionid: Maximum length is 30 characters – and must always be unique. Recommended format is msisdn:time
   :form from: Optional alphanumeric sender. Maximum 11 characters
   :form callbackurl: Optional URL for status callbacks
   :form class: Class to use for message delivery. Defaults to 'A'
   :reqheader Content-Type: application/x-www-form-urlencoded
   :status 200: with a plaintext body: "Processing:sessionid", with sessionid replaced with the given sessionid
   :status 400: if the request can't be processed due to an exception. The body contains the exception message

   **Example request**:

   .. sourcecode:: http

      POST /sendsms HTTP/1.1
      Host: httppost.nimta.com
      Accept: */*
      Content-Length: 139
      Content-Type: application/x-www-form-urlencoded

      user=myusername&password=mypassword&to=4512345678&smsc=dk.tdc&sessionid=4512345678:20100507151010&price=6.00DKK&from=MyCompany&text=MyMessage

   **Example response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Date: Mon, 23 May 2005 22:38:34 GMT
      Server: Apache/2.2 (FreeBSD)
      Content-Length: 36
      Content-Type: text/plain

      Processing:4512345678:20100507151010


nimta.com
^^^^^^^^^

This API available on www.nimta.com and nimta.com, is one of our first and has
been deprecated since 2010, however it still works.

Originally this API supported various other features such as: WapPush, Charged
Messaging and MMS, however these features are now defunct and thus left
undocumented.

.. http:get:: /Gateway/Kunder/Opret/Gateway.aspx
   :deprecated:

   Send a SMS message.

   Should only be performed via HTTPS connections since it contains plaintext
   credentials.

   Arguments can only be sent as GET Query Params.

   :query username: account username
   :query password: account password
   :query number: The mobile subscriber number, without country code but including any area code. Ie. 87654321
   :query countryCode: The country code of the mobile subscriber, ie. 45
   :query message: The content of the SMS
   :query gatewayclass: Class to use for message delivery, defaults to 'A'
   :query alphatext: Optional alphanumeric sender. Maximum 11 characters
   :status 200: with a .NET hidden form or other nonsensical output
   :status 200: If the request can't be processed it will still return 200, but with a error message


Webhooks
--------

Webhooks are used to respond to changes in the message delivery status, also
known as Delivery Status Notifications or DSNs for short.

Delivery Status Notification
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

By adding a URL to the callbackurl field, you can setup a webhook that will be
called whenever the current status (state) of the message changes, ie. goes from
a transient state (ie. BUFFERED) to final state (ie. DELIVERED) or an other
transient state. Once a final state is reached we will no longer call your
webhook with updates for this particular message and recipient.

*Work in progress...*
