.. _rest:

REST API
========
This is our new API which is available for GatewayAPI.com and based
predominately on HTTP POST calls and JSON.

To use this API you must be a customer on the GatewayAPI.com platform, and run
on modern SSL/TLS software (support SHA-2 & ECDHE_ECDSA, ie. OpenSSL 1.0+,
NSS 3.11+, Win2k8/Vista+, Java 7+).

Authentication
--------------
Use either :ref:`oauth-howto` or :ref:`basic-auth-howto`. We encourage the use
of :ref:`oauth-howto`, since it provides the best protection and although not
as ubiquitous as basic auth, it's well supported by most frameworks.

.. _oauth-howto:

OAuth
^^^^^
The OAuth specification exists in two versions; 1 and 2, each having little to
do with the other. `OAuth 1.0a`_ is suitable for API usage without a user
present and provides protection against replay attacks.

No user interaction is required for the authentication, so this part is skipped
from OAuth. There are only two parties: consumer and service provider. Thus
this is a special `two-legged`_ variant of `OAuth 1.0a`_. The signing process is
identical to the normal three-legged OAuth, but we simply leave the token and
secret as empty strings.

The oauth parameters can be sent as the `OAuth Authorization header`_ or as URL
params. Your framework should take care of all the details for you, however if
you are fiddling with it yourself,  it's important that the nonce is unique and
the timestamp is correct.

**Header example**

.. sourcecode:: http

   POST /rest/mtsms HTTP/1.1
   Host: gatewayapi.com
   Authorization: OAuth oauth_consumer_key="Create-an-API-Key",
     oauth_nonce="128817750813820944501450124113",
     oauth_timestamp="1450124113",
     oauth_version="1.0",
     oauth_signature_method="HMAC-SHA1",
     oauth_signature="t9w86dddubh4XofnnPgH%2BY6v5TU%3D"
   Accept: application/json, text/javascript
   Content-Type: application/json

   { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] }

**URL Params**

.. sourcecode:: http

   POST /rest/mtsms?oauth_consumer_key=CreateAKey&oauth_nonce=12345&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1191242096&oauth_version=1.0 HTTP/1.1
   Host: gatewayapi.com
   Accept: application/json, text/javascript
   Content-Type: application/json

   { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] }


.. _`basic-auth-howto`:

HTTP Basic Authentication
^^^^^^^^^^^^^^^^^^^^^^^^^
`HTTP Basic auth`_ must only be used with HTTPS connections (SSL encrypted),
since the credentials is sent as base64 encoded plaintext.

Support is built-in on most network frameworks, but it's also simple to do
yourself. The credentials is sent as "Authorization: Basic ``basic-cookie``".
basic-cookie is ``username ":" password`` which is then base64 encoded.

.. sourcecode:: http

   POST /rest/mtsms HTTP/1.1
   Host: gatewayapi.com
   Authorization: Basic Zm9vOmJhcg==
   Accept: application/json, text/javascript
   Content-Type: application/json

   { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] }

Basic auth also has the advantage of being easy to do with curl::

  curl -vv "https://myuser:mypass@gatewayapi.com/rest/mtsms" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] }'


Sending SMS'es
--------------

Also known as MT SMS, short for Mobile Terminated SMS, is when you want to
deliver a SMS to a users mobile device.

Request Examples
^^^^^^^^^^^^^^^^

.. http:post:: /rest/mtsms

   The root element can be either a dict with a single SMS or a list of SMS'es.

   **Minimal request**

   .. sourcecode:: http

      POST /rest/mtsms HTTP/1.1
      Host: gatewayapi.com
      Authorization: OAuth oauth_consumer_key="Create-an-API-Key",
        oauth_nonce="128817750813820944501450124113",
        oauth_timestamp="1450124113",
        oauth_version="1.0",
        oauth_signature_method="HMAC-SHA1",
        oauth_signature="t9w86dddubh4XofnnPgH%2BY6v5TU%3D"
      Accept: application/json, text/javascript
      Content-Type: application/json

      {
          "message": "Hello World",
          "recipients": [
              { "msisdn": 4512345678 },
              { "msisdn": 4587654321 }
          ]
      }


   **Fully fledged request**

   This is a bit of contrived example since ``message`` and ``payload`` can't
   both be set at the same time, but it shows every possible field in the API.

   .. sourcecode:: http

      POST /rest/mtsms HTTP/1.1
      Host: gatewayapi.com
      Authorization: OAuth oauth_consumer_key="Create-an-API-Key",
        oauth_nonce="128817750813820944501450124113",
        oauth_timestamp="1450124113",
        oauth_version="1.0",
        oauth_signature_method="HMAC-SHA1",
        oauth_signature="t9w86dddubh4XofnnPgH%2BY6v5TU%3D"
      Accept: application/json, text/javascript
      Content-Type: application/json

      [
          {
              "class": "bulk",
              "message": "Hello World, %1, --MYTAG--",
              "payload": "cGF5bG9hZCBlbmNvZGVkIGFzIGI2NAo=",
              "recipients": [
                  {
                      "msisdn": 1514654321
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
              "udh": "BQQLhCPw"
          },
          {
              "message": "Hello World",
              "recipients": [
                  { "msisdn": 4512345678 }
              ]
          }
      ]

   **Example response**

   If the request succeed, the internal message identifiers are returned to
   the caller like this:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {"ids": [132,134,135,137,138]}


   If the request fails, the response will look like the example below:

   .. sourcecode:: http

      HTTP/1.1 403 FORBIDDEN
      Content-Type: application/json

      {
        "code": "0x0213",
        "incident_uuid": "d8127429-fa0c-4316-b1f2-e610c3958f43",
        "message": "Unauthorized IP-address: %1",
        "variables": [
          "1.2.3.4"
        ]
      }

   ``code`` and ``vars`` are left out of the response if they are empty.

Code Examples
^^^^^^^^^^^^^
Since sending SMS'es is a central part of most customers' use cases we'll list
the code examples in full. These examples are also available preconfigured with
your own API keys on the dashboard at https://gatewayapi.com/app/.

Since the OAuth bits are the same for all API calls, these examples can easily
be modified for other calls.

Python
~~~~~~

For this example you'll need the excellent `Requests-OAuthlib`_. If you are
using pip, simply do ``pip install requests_oauthlib``.

.. sourcecode:: python

   from requests_oauthlib import OAuth1Session
   key = 'Create-an-API-Key'
   secret = 'GoGenerateAnApiKeyAndSecret'
   gwapi = OAuth1Session(key, client_secret=secret)
   req = {
       'recipients': [{'msisdn': 4512345678}],
       'message': 'Hello World',
   }
   res = gwapi.post('https://gatewayapi.com/rest/mtsms', json=req)
   res.raise_for_status()

PHP
~~~

If you are using composer, then you'll want to use our Guzzle example.
Install the deps with ``composer require "guzzlehttp/oauth-subscriber 0.3.*"``.

.. sourcecode:: php

   <?php
   require_once 'vendor/autoload.php';
   $stack = \GuzzleHttp\HandlerStack::create();
   $oauth_middleware = new \GuzzleHttp\Subscriber\Oauth\Oauth1([
       'consumer_key'    => 'Create-an-API-Key',
       'consumer_secret' => 'GoGenerateAnApiKeyAndSecret',
       'token'           => '',
       'token_secret'    => ''
   ]);
   $stack->push($oauth_middleware);
   $client = new \GuzzleHttp\Client([
       'base_uri' => 'https://gatewayapi.com/rest/',
       'handler'  => $stack,
       'auth'     => 'oauth'
   ]);

   $req = [
       'recipients' => [['msisdn' => 4512345678]],
       'message'    => 'Hello World',
   ];
   $client->post('mtsms', ['json' => $req]);


It's also possible to do oauth signing using only the built-in PHP functions.
Although it's not going to look as nice as guzzle, this one won't require
composer or any other dependencies.

.. sourcecode:: php

   <?php
   // Variables for OAuth 1.0a Signature
   $nonce = rawurlencode(uniqid());
   $ts = rawurlencode(time());
   $key = rawurlencode('Create-an-API-Key');
   $secret = rawurlencode('GoGenerateAnApiKeyAndSecret');
   $uri = 'https://gatewayapi.com/rest/mtsms';
   $method = 'POST';

   // OAuth 1.0a - Signature Base String
   $oauth_params = array(
       'oauth_consumer_key' => $key,
       'oauth_nonce' => $nonce,
       'oauth_signature_method' => 'HMAC-SHA1',
       'oauth_timestamp' => $ts,
       'oauth_version' => '1.0',
   );
   $sbs = $method . '&' . rawurlencode($uri) . '&';
   $it = new ArrayIterator($oauth_params);
   while ($it->valid()) {
       $sbs .= $it->key() . '%3D' . $it->current();$it->next();
       if ($it->valid()) $sbs .= '%26';
   }

   // OAuth 1.0a - Sign SBS with secret
   $sig = base64_encode(hash_hmac('sha1', $sbs, $secret . '&', true));
   $oauth_params['oauth_signature'] = rawurlencode($sig);

   // Construct Authorization header
   $it = new ArrayIterator($oauth_params);
   $auth = 'Authorization: OAuth ';
   while ($it->valid()) {
       $auth .= $it->key() . '="' . $it->current() . '"';$it->next();
       if ($it->valid()) $auth .= ', ';
   }

   // Request body
   $req = array(
       'recipients' => array(array('msisdn' => 4512345678)),
       'message' => 'Hello World',
   );


   // Send request with cURL
   $c = curl_init($uri);
   curl_setopt($c, CURLOPT_HTTPHEADER, array(
       $auth,
       'Content-Type: application/json'
   ));
   curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($req));
   curl_exec($c);


cURL
~~~~

This is how you would do OAuth in curl, altough it's not likely that you'll use
this for shell scripting, because OAuth requires calculating a few variables.

.. sourcecode:: bash

   curl -v https://gatewayapi.com/rest/mtsms \
   -H 'Content-Type: application/json' \
   -H 'Authorization: OAuth oauth_consumer_key="Create-an-API-Key", '\
   'oauth_nonce="132016094718881349551450127578", '\
   'oauth_timestamp="1450127578", oauth_version="1.0", '\
   'oauth_signature_method="HMAC-SHA1", '\
   'oauth_signature="lQzrZkJyQ9Gx27mh5z9waCwkGlQ%3D"' \
   -d '{ "message": "Hello World", '\
   '"recipients": [ { "msisdn": 4512345678 } ] }'


.. sourcecode:: bash

   curl -v "https://myuser:mypass@gatewayapi.com/rest/mtsms" \
   -H "Content-Type: application/json" \
   -d '{ "message": "Hello World", '\
   '"recipients": [ { "msisdn": 4512345678 } ] }'

Webhooks
--------

Although the REST API will support polling for the message status, we strongly
encourage to use our simple webhooks for geting Delivery Status Notifications,
aka DSNs.

In addition webhooks can be used to react to enduser initiated events, such as
MO SMS (Mobile Originated SMS, or Incoming SMS).

*Work in progress...*

.. _`OAuth 1.0a`: http://tools.ietf.org/html/rfc5849
.. _`two-legged`: http://oauth.googlecode.com/svn/spec/ext/consumer_request/1.0/drafts/2/spec.html
.. _`HTTP Basic Auth`: http://tools.ietf.org/html/rfc1945#section-11.1
.. _`OAuth Authorization header`: http://tools.ietf.org/html/rfc5849#section-3.5.1
.. _`Requests-OAuthlib`: https://requests-oauthlib.readthedocs.org/
.. _`Guzzle`: guzzlephp.org
