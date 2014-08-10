HttpPost API
============


Authentication
--------------
Use either `OAuth 1.0a`_ or `HTTP Basic Auth`_.

OAuth
^^^^^
No user interaction is required for the authentication, so this part is skipped
from OAuth. There are only two parties: consumer and service provider. Thus
this is a special `two-legged`_ variant of `OAuth 1.0a`_. The signing process is
identical to the normal three-legged OAuth, but we simply leave the token and
secret as empty strings.

The oauth parameters can be sent as the `OAuth Authorization header`_ or as URL
params.

**Header example**

.. sourcecode:: http

   POST /api/v2/sendsms HTTP/1.1
   Host: gatewayapi.com
   Authorization: OAuth oauth_consumer_key="dpf43f3p2l4k3l03",
     oauth_signature_method="HMAC-SHA1",
     oauth_signature="IxyYZfG2BaKh8JyEGuHCOin%2F4bA%3D",
     oauth_timestamp="1191242096",
     oauth_token="",
     oauth_nonce="kllo9940pd9333jh",
     oauth_version="1.0"
   Accept: application/json, text/javascript
   Content-Type: application/json

   [ { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] } ]

**URL Params**

.. sourcecode:: http

   POST /api/v2/sendsms?oauth_consumer_key=dpf43f3p2l4k3l03&oauth_nonce=kllo9940pd9333jh&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1191242096&oauth_token=&oauth_version=1.0 HTTP/1.1
   Host: gatewayapi.com
   Accept: application/json, text/javascript
   Content-Type: application/json

   [ { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] } ]


HTTP Basic Authentication
^^^^^^^^^^^^^^^^^^^^^^^^^
`HTTP Basic auth`_ must only be used with HTTPS connections (SSL encrypted),
since the credentials is sent as base64 encoded plaintext.

Support is built-in on most network frameworks, but it's also simple to do
yourself. The credentials is sent as "Authorization: Basic ``basic-cookie``".
basic-cookie is ``username ":" password`` which is then base64 encoded.

.. sourcecode:: http

   POST /api/v2/sendsms HTTP/1.1
   Host: gatewayapi.com
   Authorization: Basic Zm9vOmJhcg==
   Accept: application/json, text/javascript
   Content-Type: application/json

   [ { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] } ]

Basic auth also has the advantage of being easy to do with curl::

  curl -vv "https://myuser:mypass@gatewayapi.com/api/v2/sendsms" \
  -H "Content-Type: application/json" \
  -d '[ { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] } ]'

SMS'es
------

Examples
^^^^^^^^

.. http:post:: /api/v2/sendsms

   **Minimal request**

   .. sourcecode:: http

      POST /api/v2/sendsms HTTP/1.1
      Host: gatewayapi.com
      Authorization: OAuth oauth_consumer_key="dpf43f3p2l4k3l03",
        oauth_signature_method="HMAC-SHA1",
        oauth_signature="IxyYZfG2BaKh8JyEGuHCOin%2F4bA%3D",
        oauth_timestamp="1191242096",
        oauth_token="",
        oauth_nonce="kllo9940pd9333jh",
        oauth_version="1.0"
      Accept: application/json, text/javascript
      Content-Type: application/json

      [
        {
          "message": "Hello World",
          "recipients": [
            { "msisdn": 4512345678 },
            { "countrycode": 45, "number": 87654321 }
          ]
        }
      ]


   **Fully fledged request**

   .. sourcecode:: http

      POST /api/v2/sendsms HTTP/1.1
      Host: gatewayapi.com
      Authorization: OAuth oauth_consumer_key="dpf43f3p2l4k3l03",
                  oauth_signature_method="HMAC-SHA1",
                  oauth_signature="IxyYZfG2BaKh8JyEGuHCOin%2F4bA%3D",
                  oauth_timestamp="1191242096",
                  oauth_token="",
                  oauth_nonce="kllo9940pd9333jh",
                  oauth_version="1.0"
      Accept: application/json, text/javascript
      Content-Type: application/json

      [
        {
          "class": "A",
          "message": "Hello World, %1, --MYTAG--",
          "recipients": [
            {
              "countrycode": 1,
              "areacode": 514,
              "number": 654321,
              "mcc": 302,
              "mnc": 720,
              "charge": {
                "amount": 1.23,
                "currency": "CAD",
                "code": "P01",
                "description": "Example charged SMS",
                "category": "SC12",
                "servicename": "Example service"
              },
              "tagvalues": [
                "foo",
                "bar"
              ]
            }
          ],
          "sender": "Test Sender",
          "sendtime": 915148800,
          "tags": [
            "--MYTAG--",
            "%1"
          ],
          "userref": "1234",
          "priority": "NORMAL",
          "validity_period": 86400,
          "encoding": "UTF8",
          "destaddr": "MOBILE",
          "udh": "BQQLhCPw",
          "payload": "cGF5bG9hZCBlbmNvZGVkIGFzIGI2NAo="
        }
      ]


v1 API (deprecated)
-------------------

This API is deprecated and only supports sending limited SMS messages. We
strongly recommend using the new v2 API as seen above. This API is run from the
httppost.nimta.com domain.

.. http:post:: /sendsms
   :deprecated:

   Send a SMS message.

   Should only be performed via HTTPS connections since it contains plaintext
   credentials.

   Arguments and be sent as POST (form encoded) or as GET.

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
   :reqheader Content-type: application/x-www-form-urlencoded
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


.. _`OAuth 1.0a`: http://tools.ietf.org/html/rfc5849
.. _`two-legged`: http://oauth.googlecode.com/svn/spec/ext/consumer_request/1.0/drafts/2/spec.html
.. _`HTTP Basic Auth`: http://tools.ietf.org/html/rfc1945#section-11.1
.. _`OAuth Authorization header`: http://tools.ietf.org/html/rfc5849#section-3.5.1
