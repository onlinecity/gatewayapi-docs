.. _rest:

REST API
========
This is our new API which is available for GatewayAPI.com and based
predominately on HTTP POST calls and JSON.

To use this API you must be a customer on the GatewayAPI.com platform, and run
on "modern" SSL/TLS software (support SHA-2, ie. OpenSSL 0.9.8+, NSS 3.11+,
Win2k8/Vista+, Java 7+).
If you are stuck on ie. Windows XP/2k3, try https://sha1.gatewayapi.com/.
If nothing works, use http://badssl.gatewayapi.com/ - you can use this domain
without SSL at all, but your API keys will be sent as cleartext, so we advise
against it.


Authentication
--------------
Use either :ref:`oauth`, :ref:`HTTP Basic Authentication` or
:ref:`API Token`. We encourage the use of :ref:`oauth`, since it
provides the best protection and although not as ubiquitous as basic auth, it's
well supported by most frameworks.

.. _oauth:

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


.. _`HTTP Basic Authentication`:

HTTP Basic Authentication
^^^^^^^^^^^^^^^^^^^^^^^^^
`HTTP Basic auth`_ must only be used with HTTPS connections (SSL encrypted),
since the credentials are sent as base64 encoded plaintext.

Support is built-in on most networking frameworks, but it's also simple to do
yourself. The credentials are sent as "Authorization: Basic ``basic-cookie``".
basic-cookie is ``username ":" password`` which is then base64 encoded.

You can use basic auth with credentials (deprecated: ie. username + password),
or with an API Token. The API Token is sent as the username with password left
empty. You can find and create a set of credentials under "Settings",
"Credentials (deprecated)", the API Token is available under API Keys.

.. sourcecode:: http

   POST /rest/mtsms HTTP/1.1
   Host: gatewayapi.com
   Authorization: Basic Zm9vOmJhcg==
   Accept: application/json, text/javascript
   Content-Type: application/json

   { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] }

If you can't use/specify an Authorization header, you can provide the username
and password as form or query arguments. The username is sent as 'user', and
the password as 'password'.

.. _`API Token`:

API Token
^^^^^^^^^
Your API keys are expressed as a key+secret combo, and as an API token. The
key+secret is used for :ref:`oauth` while the token can be used for a simpler
scheme with better compatibility.

You can send the token as the username via :ref:`HTTP Basic Authentication`,
or you may send the token as a query argument or form value. This means that
if you can send a HTTP request, you can use Token Authentication.

Example of JSON body and API token as a query argument.

.. sourcecode:: http

   POST /rest/mtsms?token=Go-Create-an-API-token HTTP/1.1
   Host: gatewayapi.com
   Accept: application/json, text/javascript
   Content-Type: application/json

   { "message": "Hello World", "recipients": [ { "msisdn": 4512345678 } ] }

Sending SMS'es
--------------

Also known as :term:`MT SMS`, short for Mobile Terminated SMS, is when you want to
deliver a SMS to a users mobile device.

Basic usage
^^^^^^^^^^^

Also see `Advanced usage`_ for a complete example of all features.

.. http:post:: /rest/mtsms
   :synopsis: Send a new SMS

   The root element can be either a dict with a single SMS or a list of SMS'es.
   You can send data in JSON format, or even as http form data or query args.

   :<json string class: Default "standard". The message class to use for this request. If specified it must be the same for all messages in the request.
   :<json string message: The content of the SMS, *always* specified in UTF-8 encoding, which we will transcode depending on the "encoding" field. The default is the usual :term:`GSM 03.38` encoding.
   :<json string sender: Up to 11 alphanumeric characters, or 15 digits, that will be shown as the sender of the SMS.
   :<json string userref: A transparent string reference, you may set to keep track of the message in your own systems. Returned to you when you receive a `Delivery Status Notification`_.
   :<json string callback_url: If specified send status notifications to this URL, else use the default webhook.
   :<json array recipients: Array of recipients, described below:
   :<jsonarr string msisdn: :term:`MSISDN` aka the full mobile phone number of the recipient.
   :>json array ids: If successful you receive a object containing a list of message ids.
   :>json dictionary usage: If successful you receive a usage dictionary with usage information for you request.
   :status 200: Returns a dict with an array of message IDs and a dictionary with usage information on success
   :status 400: Ie. invalid arguments, details in the JSON body
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 422: Invalid json request body
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

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

   .. sourcecode:: http

      POST /rest/mtsms?token=Go-Create-an-API-token HTTP/1.1
      Host: gatewayapi.com
      Content-Type: application/x-www-form-urlencoded

      message=Hello World&recipients.0.msisdn=4512345678&recipients.1.msisdn=4587654321

   The two examples above do the exact same thing, but with different styles of
   input. You can even send it all using just a GET url::

     https://gatewayapi.com/rest/mtsms?token=Go-Create-an-API-token&message=Hello+World&recipients.0.msisdn=4512345678&recipients.1.msisdn=4587654321


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

For a really simple integration, the following will suffice:

.. sourcecode:: php

   <?php
   // Query args
   $query = http_build_query(array(
       'token' => 'Go-Create-an-API-token',
       'message' => 'Hello World',
       'recipients.0.msisdn' => 4512345678,
   ));
   // Send it
   $result = file_get_contents('https://gatewayapi.com/rest/mtsms?' . $query);
   // Get SMS ids (optional)
   print_r(json_decode($result)->ids);


However if you are using composer, then you'll want to use our Guzzle example.
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

API Tokens and the support for form data is a great match for cURL integration,
since sending an SMS becomes as easy as:

.. sourcecode:: bash

   curl -v https://gatewayapi.com/rest/mtsms \
     -u Go-Create-an-API-token: \
     -d message="Hello World" \
     -d recipients.0.msisdn=4512345678


.. _csharp:

C#
~~

This example uses `RestSharp`_. and `NewtonSoft`_. If you're using the NuGet
Package Manager Console: ``Install-Package RestSharp``,
``Install-Package Newtonsoft.Json -Version 9.0.1``.

.. sourcecode:: csharp

   var client = new RestSharp.RestClient("https://gatewayapi.com/rest");
   var apiKey = "Create-an-API-Key";
   var apiSecret = "GoGenerateAnApiKeyAndSecret";
   client.Authenticator = RestSharp.Authenticators
       .OAuth1Authenticator.ForRequestToken(apiKey, apiSecret);
   var request = new RestSharp.RestRequest("mtsms", RestSharp.Method.POST);
   request.AddJsonBody(new {
       recipients = new[] { new { msisdn = 4512345678} },
       message = "Hello World"
   });
   var response = client.Execute(request);

   // On 200 OK, parse the list of SMS IDs else print error
   if ((int) response.StatusCode == 200) {
       var res = Newtonsoft.Json.Linq.JObject.Parse(response.Content);
       foreach (var i in res["ids"]) {
           Console.WriteLine(i);
       }
   } else if (response.ResponseStatus == RestSharp.ResponseStatus.Completed) {
      Console.WriteLine(response.Content);
    } else {
      Console.WriteLine(response.ErrorMessage);
    }


Ruby
~~~~

Install the deps with ``gem install oauth``.

.. sourcecode:: ruby

   # encoding: UTF-8
   require 'oauth'
   require 'json'

   consumer = OAuth::Consumer.new(
     'Create-an-API-Key',
     'GoGenerateAnApiKeyAndSecret',
     :site => 'https://gatewayapi.com/rest',
     :scheme => :header
   )
   access = OAuth::AccessToken.new consumer
   body = JSON.generate({
     'recipients' => [{'msisdn' => 4512345678}],
     'message' => 'Hello World',
   })
   response = access.post('/mtsms', body, {'Content-Type'=>'application/json'})
   puts response.body


Node.js
~~~~~~~

Install the deps with ``npm install request``.

.. sourcecode:: js


   var request = require('request');
   request.post({
     url: 'https://gatewayapi.com/rest/mtsms',
     oauth: {
       consumer_key: 'Create-an-API-Key',
       consumer_secret: 'GoGenerateAnApiKeyAndSecret',
     },
     json: true,
     body: {
       sender: 'Example SMS',
       message: 'Hello World',
       recipients: [{msisdn: 4512345678}],
     },
   }, function (err, r, body) {
     console.log(err ? err : body);
   });


Java
~~~~

Using nothing but standard edition java, you can send a SMS like so.

.. sourcecode:: java

   import java.io.DataOutputStream;
   import java.net.URL;
   import java.net.URLEncoder;
   import javax.net.ssl.HttpsURLConnection;

   public class HelloWorld {
     public static void main(String[] args) throws Exception {
       URL url = new URL("https://gatewayapi.com/rest/mtsms");
       HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
       con.setDoOutput(true);

       DataOutputStream wr = new DataOutputStream(con.getOutputStream());
       wr.writeBytes(
         "token=Go-Create-an-API-token"
         + "&sender=" + URLEncoder.encode("Example SMS", "UTF-8")
         + "&message=" + URLEncoder.encode("Hello World", "UTF-8")
         + "&recipients.0.msisdn=4512345678"
       );
       wr.close();

       int responseCode = con.getResponseCode();
       System.out.println("Got response " + responseCode);
     }
   }


However we expect many of you are using OkHttp or similar, which gives you a
nice API. Combine this with your favorite JSON package. Install the dependencies
with.

.. sourcecode:: java

   compile 'com.squareup.okhttp3:okhttp:3.4.1'
   compile 'se.akerfeldt:okhttp-signpost:1.1.0'
   compile 'org.json:json:20160810'

.. sourcecode:: java

   final String key = "Create-an-API-Key";
   final String secret = "GoGenerateAnApiKeyAndSecret";

   OkHttpOAuthConsumer consumer = new OkHttpOAuthConsumer(key, secret);
   OkHttpClient client = new OkHttpClient.Builder()
           .addInterceptor(new SigningInterceptor(consumer))
           .build();
   JSONObject json = new JSONObject();
   json.put("sender", "Example SMS");
   json.put("message", "Hello World");
   json.put("recipients", (new JSONArray()).put(
           (new JSONObject()).put("msisdn", 4512345678L)
   ));

   RequestBody body = RequestBody.create(
           MediaType.parse("application/json; charset=utf-8"), json.toString());
   Request signedRequest = (Request) consumer.sign(
           new Request.Builder()
                   .url("https://gatewayapi.com/rest/mtsms")
                   .post(body)
                   .build()).unwrap();

   try (Response response = client.newCall(signedRequest).execute()) {
       System.out.println(response.body().string());
   }


Advanced usage
^^^^^^^^^^^^^^

.. http:post:: /rest/mtsms
   :synopsis: Send a new SMS

   The root element can be either a dict with a single SMS or a list of SMS'es.

   :<json string class: Default 'standard'. The message class to use for this request. If specified it must be the same for all messages in the request.
   :<json string message: The content of the SMS, *always* specified in UTF-8 encoding, which we will transcode depending on the "encoding" field. The default is the usual :term:`GSM 03.38` encoding. Required unless payload is specified.
   :<json string sender: Up to 11 alphanumeric characters, or 15 digits, that will be shown as the sender of the SMS.
   :<json integer sendtime: Unix timestamp to schedule message sending at certain time.
   :<json array tags: A list of string tags, which will be replaced with the tag values for each recipient.
   :<json string userref: A transparent string reference, you may set to keep track of the message in your own systems. Returned to you when you receive a `Delivery Status Notification`_.
   :<json string priority: Default 'NORMAL'. One of 'BULK', 'NORMAL', 'URGENT' and 'VERY_URGENT'. Urgent and Very Urgent normally require the use of premium message class.
   :<json integer validity_period: Specified in seconds. If message is not delivered within this timespan, it will expire and you will get a notification.
   :<json string encoding: Encoding to use when sending the message. Defaults to 'UTF8', which means we will use :term:`GSM 03.38`.
   :<json string destaddr: One of 'DISPLAY', 'MOBILE', 'SIMCARD', 'EXTUNIT'. Use display to do "flash sms", a message displayed on screen immediately but not saved in the normal message inbox on the mobile device.
   :<json string payload: If you are sending a binary SMS, ie. a SMS you have encoded yourself or with speciel content for feature phones (non-smartphones). You may specify a payload, encoded as Base64. If specified, message must not be set and tags are unavailable.
   :<json string udh: UDH to enable additional functionality for binary SMS, encoded as Base64.
   :<json string callback_url: If specified send status notifications to this URL, else use the default webhook.
   :<json array recipients: Array of recipients, described below:
   :<jsonarr string msisdn: :term:`MSISDN` aka the full mobile phone number of the recipient.
   :<jsonarr integer mcc: :term:`MCC`, mobile country code. Must be specified if doing charged SMS'es.
   :<jsonarr integer mnc: :term:`MNC`, mobile network code. Must be specified if doing charged SMS'es.
   :<jsonarr object charge: Charge data. More details on sending charged SMS'es to come.
   :<jsonarr array tagvalues: A list of string values corresponding to the tags in message. The order and amount of tag values must exactly match the tags.
   :>json array ids: If successful you receive a object containing a list of message ids.
   :status 200: Returns a dict with message IDs on success
   :status 400: Ie. invalid arguments, details in the JSON body
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 422: Invalid json request body
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body


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
              "class": "standard",
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
              "udh": "BQQLhCPw",
              "callback_url": "https://example.com/cb?foo=bar"
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

     {
         "ids": [
             421332671
         ],
         "usage": {
             "countries": {
                 "DK": 1
             }
         }
     }

   Please note that this response is subject to change and will continually,
   be updated to contain more useful data.


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

   ``code`` and ``variables`` are left out of the response if they are empty.
   For a complete list of the various codes see :ref:`apierror`.


Webhooks
--------

Although the REST API will support polling for the message status, we strongly
encourage to use our simple webhooks for getting Delivery Status Notifications,
aka DSNs.

In addition webhooks can be used to react to enduser initiated events, such as
MO SMS (Mobile Originated SMS, or Incoming SMS).

If you filter IPs, note that we will call your webhook from the IP range
77.66.39.128/25. In the future we may add IPs but for now this is the range.


Delivery Status Notification
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _states:

States and status codes
~~~~~~~~~~~~~~~~~~~~~~~
By adding a URL to the callbackurl field, or setting one of your webhooks as
the default for status notifications, you can setup a webhook that will be
called whenever the current status (state) of the message changes, ie. goes
from a transient state (Circles, ie. Enroute) to final state (Boxes, ie.
Delivered) or an other transient state. Once a final state is reached we will
no longer call your webhook with updates for this particular message and
recipient.

.. graphviz::

   digraph foo {
      rankdir=LR;
      size=5;
      Delivered [shape=box];
      Expired [shape=box];
      Deleted [shape=box];
      Accepted [shape=box];
      Rejected [shape=box];
      Skipped [shape=box];
      Unknown [shape=plaintext];
      Undeliverable [shape=box];
      Unknown -> Buffered -> Enroute -> Delivered [color=blue];
      Unknown -> Undeliverable [style=dotted];
      Unknown -> Scheduled -> Buffered;
      Enroute -> Undeliverable;
      Enroute -> Expired;
      Scheduled -> Deleted;
      Enroute -> Rejected;
      Enroute -> Deleted [style=dotted];
      Enroute -> Accepted [style=dotted];
      Enroute -> Skipped [style=dotted];
      { rank=same; Unknown Scheduled }
   }

The normal path for messages are marked in blue above. The dotted lines are
very rare events not often used and/or applicable only to specific use cases.

We try to deliver DSNs in a logical order, but they may not always arrive at
your webhook in order and sometimes you may receive a transient state after
already having received a final state. In this case you should ignore the
transient state.

============= =========================================
Status        Description
============= =========================================
Unknown       Messages start here, but you should not encounter this state.
Scheduled     Used for messages where you set a sendtime in the future.
Buffered      The message is held in our internal queue and awaits delivery to the mobile network.
Enroute       Message has been sent to mobile network, and is on it's way to it's final destination.
Delivered     The end user's mobile device has confirmed the delivery, and if message is charged the charge was successful.
Expired       Message has exceeded it's validity period without getting a delivery confirmation. No further delivery attempts.
Deleted       Message was canceled.
Undeliverable Message is permanently undeliverable. Most likely an invalid :term:`MSISDN`.
Accepted      The mobile network has accepted the message on the end users behalf.
Rejected      The mobile network has rejected the message. If this message was charged, the charge has failed.
Skipped       The message was accepted, but was deliberately ignored due to network-specific rules.
============= =========================================

HTTP Callback
~~~~~~~~~~~~~
If you specify a callback url when sending your message, or have a webhook
configured as your default webhook for status notification, we will perform a
http request to your webhook with the following data.


.. http:post:: /example/callback
   :noindex:

   Example of how our request to you could look like.

   :<json integer id: The ID of the SMS/MMS this notification concerns
   :<json integer msisdn: The :term:`MSISDN` of the mobile recipient.
   :<json integer time: The UNIX Timestamp for the delivery status event
   :<json string status: One of the states above, in all-caps, ie. DELIVERED
   :<json string error: Optional error decription, if available.
   :<json string code: Optional numeric code, in hex, see :ref:`smserror`, if available.
   :<json string userref: If you specified a reference when sending the message, it's returned to you
   :status 200: If you reply with a 2xx code, we will consider the DSN delivered successfully.
   :status 500: If we get a code >= 300, we will re-attempt delivery at a later time.

   **Callback example**

   .. sourcecode:: http

      POST /example/callback HTTP/1.1
      Host: example.com
      Accept: */*
      Content-Type: application/json

      {
          "id": 1000001,
          "msisdn": 4587654321,
          "time": 1450000000,
          "status": "DELIVERED",
          "userref": "foobar"
      }

   If we can't reach your server, or you reply with a http status code >= 300,
   then we will re-attempt delivery of the DSN after a 60 second delay, with
   truncated exponential backoff, doubling every attempt up to 2400 seconds
   (40 minutes).
   We expect you to reply with a 2XX status code within 60 seconds, or we
   consider it a failed attempt.


.. _mosms:

MO SMS (Receiving SMS'es)
^^^^^^^^^^^^^^^^^^^^^^^^^

Web hooks are also used to receive SMS'es. We call this MO SMS (Mobile
Originated SMS).

Prerequisites
~~~~~~~~~~~~~
In order to receive a SMS, you'll need a short code and/or keyword to which the
user sends the SMS. This short code and keyword is leased to you, so when we
receive a SMS on the specific short code, with the specific keyword, we know
where to deliver the SMS.

You can either lease a keyword on a shared short code, such as +45 1204, or
you can lease an entire short code, such as +45 60575797. Contact us via the
live chat if you need a new short code and/or keyword.

If you lease the keyword "foo" on the short code 45 1204, a Danish (+45) user
would send ie. "foo hello world" to "1204", and you'll receive the SMS.

Once you have a keyword lease, you'll need to assign the keyword to a
webhook. You can do this from the dashboard.
* If you do not have a webhook, add one.
* Click the webhook you want to receive SMS'es.
* Click the tab pane "Keywords"
* Make sure the checkbox next to "Assign" is checked for the keywords you want
to assign to this webhook.

If you have any questions, please contact us using the live chat found ie. in
the lower right when reading the documentation online.


HTTP Callback
~~~~~~~~~~~~~


.. http:post:: /example/callback
   :noindex:

   Example of how our request to you could look like.
   The many optional fields are rarely used.

   :<json integer id: The ID of the MO SMS
   :<json integer msisdn: The :term:`MSISDN` of the mobile device who sent the SMS.
   :<json integer receiver: The short code on which the SMS was received.
   :<json string message: The body of the SMS, incl. keyword.
   :<json integer senttime: The UNIX Timestamp when the SMS was sent.
   :<json string webhook_label: Label of the webhook who matched the SMS.
   :<json string sender: If SMS was sent with a text based sender, then this field is set. *Optional.*
   :<json integer mcc: :term:`MCC`, mobile country code. *Optional.*
   :<json integer mnc: :term:`MNC`, mobile network code. *Optional.*
   :<json integer validity_period: How long the SMS is valid. *Optional.*
   :<json string encoding: Encoding of the received SMS. *Optional.*
   :<json string udh: User data header of the received SMS. *Optional.*
   :<json string payload: Binary payload of the received SMS. *Optional.*

   :status 200: If you reply with a 2xx code, we will consider the DSN delivered successfully.
   :status 500: If we get a code >= 300, we will re-attempt delivery at a later time.

   **Callback example**

   .. sourcecode:: http

      POST /example/callback HTTP/1.1
      Host: example.com
      Accept: */*
      Content-Type: application/json

      {
          "id": 1000001,
          "msisdn": 4587654321,
          "receiver": 451204,
          "message": "foo Hello World",
          "senttime": 1450000000,
          "webhook_label": "test"
      }

   If we can't reach your server, or you reply with a http status code >= 300,
   then we will re-attempt delivery of the MO SMS after a 60 second delay, with
   truncated exponential backoff, doubling every attempt up to 2400 seconds
   (40 minutes).
   We expect you to reply with a 2XX status code within 60 seconds, or we
   consider it a failed attempt.

.. _`OAuth 1.0a`: http://tools.ietf.org/html/rfc5849
.. _`two-legged`: http://oauth.googlecode.com/svn/spec/ext/consumer_request/1.0/drafts/2/spec.html
.. _`HTTP Basic Auth`: http://tools.ietf.org/html/rfc1945#section-11.1
.. _`OAuth Authorization header`: http://tools.ietf.org/html/rfc5849#section-3.5.1
.. _`Requests-OAuthlib`: https://requests-oauthlib.readthedocs.org/
.. _`Guzzle`: http://guzzlephp.org/
.. _`RestSharp`: http://restsharp.org/
.. _`NewtonSoft`: http://www.newtonsoft.com/json

Check account balance
--------

You can use the /me endpoint to check your account balance, and what currency your account is set too.

.. http:get:: /rest/me
   :synopsis: Get credit balance of your account.

   :>json float credit: The remaining credit.
   :>json string currency: The currency of your credit.
   :>json integer account id: The id of your account.


   :status 200: Returns a dict with an array containing information on your account.
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

   **Response example**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "credit": 1234.56,
          "currency": "DKK",
          "id": 1
      }
