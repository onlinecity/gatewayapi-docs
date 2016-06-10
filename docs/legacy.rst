Legacy HTTP API
===============

For these APIs you need a set of credentials. These are different from the
API Keys the REST API uses. You'll find them in the dashboard, under Settings.

If you are having problems connecting over SSL to gatewayapi.com, try
badssl.gatewayapi.com. You can use badssl.gatewayapi.com without ssl, but we
strongly recommend against it, since these APIs send your credentials in
plaintext.

Sending SMS'es
--------------

httppost.nimta.com
^^^^^^^^^^^^^^^^^^

This API is available at httppost.nimta.com for the old gateway (oc.dk/gateway)
and https://gatewayapi.com/legacy/http/v2/sendsms for the new.

It's currently one of the endpoint with the most traffic and it's not going
away for the foreseeable future. However we are deprecating it since the REST
API is where all future development takes place.

This API is deprecated and only supports sending limited SMS messages. Despite
the name you can submit both GET and POST requests to this API endpoint.


.. http:post:: /sendsms
   :deprecated:
   :synopsis: Use REST API instead

   Send a SMS message.

   Should only be performed via HTTPS connections since it contains plaintext
   credentials.

   Arguments can be sent as POST (form encoded) or as GET.

   If you don't know the mobile network operator or (smsc) then you can set it
   to ie. "dk.unknown" for danish recipients, as long as your message is not
   charged.

   :form user: credential username
   :form password: credential password
   :form to: One or more recipient MSISDNs to send a message to. Ie 4512345678
   :form smsc: An ISO 3166-1 country code followed by a period and an ID representing the operator
   :form price: A numeric value with two decimals followed by an ISO 4217 currency code, ie. 10.00DKK
   :form text: An alphanumeric value representing the content of the SMS.
   :form sessionid: Maximum length is 30 characters – and must always be unique. Recommended format is msisdn:time
   :form from: Optional alphanumeric sender. Maximum 11 characters
   :form callbackurl: Optional URL for status callbacks
   :form class: Class to use for message delivery. Defaults to 'A'
   :form charset: Charset of inputs, either 'utf-8' or 'iso-8859-1' (default). Only available at gatewayapi.com.
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

This API is available at both www.nimta.com and nimta.com. The API is one of our first and has
been deprecated since 2010. It remains operative, however.

This API is also available at https://gatewayapi.com/legacy/http/v1/sendsms.

Originally this API supported various other features such as: WapPush, Charged
Messaging and MMS. These features are now defunct and thus left
undocumented.

.. http:get:: /Gateway/Kunder/Opret/Gateway.aspx
   :deprecated:
   :synopsis: Obsolete. Use REST API or httppost.nimta.com API instead.

   Send a SMS message.

   Should only be performed via HTTPS connections since it contains plaintext
   credentials.

   Arguments can only be sent as GET Query Params.

   :query username: credential username
   :query password: credential password
   :query number: The recipient mobile subscriber number, without country code but including any area code. Ie. 87654321
   :query countryCode: The country code of the mobile subscriber, ie. 45
   :query message: The content of the SMS
   :query gatewayclass: Class to use for message delivery, defaults to 'A'
   :query alphatext: Optional alphanumeric sender. Maximum 11 characters
   :status 200: with a .NET hidden form or other nonsensical output
   :status 200: If the request can't be processed it will still return 200, but with an error message


Delivery Status Notification
^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Callbacks are used to respond to changes in the message delivery status, also
known as Delivery Status Notifications or DSNs for short.

By adding a URL to the callbackurl field, you can set up a webhook that will be
called so you can keep track of whether the message was delivered successfully
or not, and if not then why.

==== =================== =====
Code Description         Cause
==== =================== =====
1    Delivered           All okay. Message delivered, and charged if charge was requested
2    Insufficient funds  The recipient lacks the funds, ie. prepaid, or cannot be charged.
3    Blacklisted         The mobile subscriber is blacklisted by the operator, and cannot receive messages
4    Unknown recipient   The msisdn is not recognized by the operator
5    Unknown status      Message is still enroute or an unknown error occurred
6    Expired             Message has expired according to validity period
7    Undeliverable       Message could not be delivered, typically because of error with content
8    Deleted             Message was deleted and not delivered
==== =================== =====

If you set a callbackurl when you sent the message, we will call your url with
one of these status codes and the sessionid you provided when you sent the
message. You can use this sessionid to track the message in your internal
systems.

When calling your service, we will perform a GET request, ie.
https://example.com/callback?sessionid=4587654321:1234&statuscode=1

Beware that if you specify any query params in your callbackurl they will not
be returned to you, only the sessionid and statuscode params will be included.

.. http:get:: /example/callback
   :noindex:

   :query sessionid: The sessionid you provided when you sent the message. Optional.
   :query statuscode: One of the status codes (integer) described above
   :status 200: If you reply with exactly 200 (not 204 etc) we consider the DSN delivered successfully. Else we re-attempt later.

Receiving SMS'es
----------------
When we receive a MO SMS (mobile originated SMS), we will look at the first word
in the SMS, known as the keyword. The SMS is then routed to the customer who
has an active subscription for this keyword.

We then send a HTTP GET request to the URL configured for that keyword, ie.
https://example.com/mosms?sender=4512345678&smsc=unknown&sessionid=4512345678%3A9379401&appnr=1204&keyword=test

You must respond with a very specific body, otherwise we'll treat your response
as a failure and re-attempt delivery of the MO SMS. It's important that the
content type is "text/plain" and your reply body is exactly
``cmd=asynch-no-trace``, no extra whitespace or other output except headers is
allowed.

.. http:get:: /example/mosms
   :noindex:

   Example of what our request to you could look like. The path and hostname are
   configureable of course.


   :query sender: The MSISDN of the end user who initiated the MO SMS (sent it)
   :query smsc: The SMSC of the end user, this can be used to later send a charged SMS
   :query sessionid: To enable you to track the message we provide an unique sessionid
   :query appnr: Application number or shortcode, where the user sent the SMS
   :query keyword: The keyword we matched
   :query text: The body of the SMS, excluding the matched keyword. Optional.
   :resheader Content-Type: must be "text/plain"


   **Example request**:

   .. sourcecode:: http

      GET /example/mosms?sender=4512345678&smsc=unknown&sessionid=4512345678%3A9379401&appnr=1204&keyword=test HTTP/1.1
      Host: example.com
      Accept: */*

   **Mandatory response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: text/plain

      cmd=asynch-no-trace
