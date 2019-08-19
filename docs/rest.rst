.. _rest:

REST API
========
This is our new API which is available for GatewayAPI.com and based
predominately on HTTP POST calls and JSON.

To use this API you must be a customer on the GatewayAPI.com platform, and run
on "modern" SSL/TLS software (support SHA-2, ie. OpenSSL 0.9.8+, NSS 3.11+,
Win2k8/Vista+, Java 7+).


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

Message Filtering
^^^^^^^^^^^^^^^^^

Some messages contain links that due to phishing attacks and generally unwanted spam cannot be accepted. Each account has a whitelist of links that are allowed, unique to that account, and approved by our staff. Any links found in the messages are checked against the whitelist, using the following method:

- A bare domain (such as ``gatewayapi.com``) allows all links pointing to that domain.
- A specific link (such as ``gatewayapi.com/docs``) only allows exactly that link to be allowed through the whitelist check.

Some certain accounts are marked as especially trusted and are excempt from having their messages checked.

You can submit new links, as well as check the current whitelist on the dashboard under Settings.

To learn more about the our efforts to stopping malicious messages, go read the blog post about `stopping illegal sms trafic`_.

Basic usage
^^^^^^^^^^^

Also see `Advanced usage`_ for a complete example of all features.

.. http:post:: /rest/mtsms
   :synopsis: Send a new SMS

   The root element can be either a dict with a single SMS or a list of SMS'es.
   You can send data in JSON format, or even as http form data or query args.

   :<json string class: Default "standard". The message class to use for this request. If specified it must be the same for all messages in the request.
   :<json string message: The content of the SMS, *always* specified in UTF-8 encoding, which we will transcode depending on the "encoding" field. The default is the usual :term:`GSM 03.38` encoding. *required*
   :<json string sender: Up to 11 alphanumeric characters, or 15 digits, that will be shown as the sender of the SMS. See :ref:`smssender`
   :<json string userref: A transparent string reference, you may set to keep track of the message in your own systems. Returned to you when you receive a `Delivery Status Notification`_.
   :<json string callback_url: If specified send status notifications to this URL, else use the default webhook.
   :<json array recipients: Array of recipients, described below. The number of recipients in a single message is limited to 10.000. *required*
   :<jsonarr string msisdn: :term:`MSISDN` aka the full mobile phone number of the recipient. *required*
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
   input. You can even send it all using just a GET url

.. http:get:: /rest/mtsms
  :synopsis: Send a new SMS

  You can use GET requests to send your SMS'es as well. Just pass the
  parameters you need as query parameters.

  https://gatewayapi.com/rest/mtsms?token=Go-Create-an-API-token&message=Hello+World&recipients.0.msisdn=4512345678&recipients.1.msisdn=4587654321


Connection limit
^^^^^^^^^^^^^^^^
Our API has a limit of 40 open connections per IP address, if you have more
than 40 open connections our web server will reject your requests.
If you need to send lots of smses consider bulking your requests with multiple
recipients, you can use tags and tagvalues to add unique data per recipient,
bulking your requests will also increase your delivery speed compared to making
a single request per recipient.

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
       'sender': 'ExampleSMS',
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
       'sender' => 'ExampleSMS',
       'message' => 'Hello World',
       'recipients.0.msisdn' => 4512345678,
   ));
   // Send it
   $result = file_get_contents('https://gatewayapi.com/rest/mtsms?' . $query);
   // Get SMS ids (optional)
   print_r(json_decode($result)->ids);


The above example is good for trying to get a quick sms through to your number
as a test, but is not recommened for production use, you should consider the
below examples, using composer or cURL.

.. sourcecode:: php

   <?php
   $recipients = ['4527128516', '4561856583'];
   $url = "https://gatewayapi.com/rest/mtsms";
   $api_token = "Go-Create-An-API-token";
   $json = [
      'sender' => 'ExampleSMS',
      'message' => 'Hello world',
      'recipients' => [],
   ];
   foreach ($recipients as $msisdn) {
      $json['recipients'][] = ['msisdn' => $msisdn];
   }
   $ch = curl_init();
   curl_setopt($ch,CURLOPT_URL, $url);
   curl_setopt($ch,CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
   curl_setopt($ch,CURLOPT_USERPWD, $api_token.":");
   curl_setopt($ch,CURLOPT_POSTFIELDS, json_encode($json));
   curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
   $result = curl_exec($ch);
   curl_close($ch);
   print($result); // print result as json string
   $json = json_decode($result); // convert to object
   print_r($json->ids); // print the array with ids
   print_r($json->usage->total_cost); // print total cost from ‘usage’ object

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
       'sender'     => 'ExampleSMS',
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
       'sender' => 'ExampleSMS',
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
     -d sender="ExampleSMS" \
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
       sender = "ExampleSMS",
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
     'sender' => 'ExampleSMS',
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
       sender: 'ExampleSMS',
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
         + "&sender=" + URLEncoder.encode("ExampleSMS", "UTF-8")
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
   json.put("sender", "ExampleSMS");
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

Httpie
~~~~~~~
For quick testing with a pretty jsonified response in your terminal you can use
`Httpie`. It can be done simply using your token as follows.

.. sourcecode:: bash

  http --auth=GoGenerateAnApiToken: \
  https://gatewayapi.com/rest/mtsms \
  sender='ExampleSMS' \
  message='Hello world' \
  recipients:='[{"msisdn": 4512345678}]'

Or you can install the httpie-oauth library and use your API key and secret.

.. sourcecode:: bash

  # install httpie oauth lib, with pip install httpie-oauth
  http --auth-type=oauth1 \
  --auth="Create-an-API-Key:" \
  "GoGenerateAnApiKeyAndSecret" \
  https://gatewayapi.com/rest/mtsms \
  sender='ExampleSMS' \
  message='Hello world' \
  recipients:='[{"msisdn": 4512345678}]'


Advanced usage
^^^^^^^^^^^^^^

.. http:post:: /rest/mtsms
   :synopsis: Send a new SMS

   The root element can be either a dict with a single SMS or a list of SMS'es.

   :<json string class: Default 'standard'. The message class, 'standard', 'premium' or 'secret' to use for this request. If specified it must be the same for all messages in the request. The secret class can be used to blur the message content you send, used for very sensitive data. It is priced as premium and uses the same routes, which ensures end to end encryption of your messages. Access to the secret class will be very strictly controlled.
   :<json string message: The content of the SMS, *always* specified in UTF-8 encoding, which we will transcode depending on the "encoding" field. The default is the usual :term:`GSM 03.38` encoding. Required unless payload is specified.
   :<json string sender: Up to 11 alphanumeric characters, or 15 digits, that will be shown as the sender of the SMS. See :ref:`smssender`
   :<json integer sendtime: Unix timestamp (seconds since epoch) to schedule message sending at certain time.
   :<json array tags: A list of string tags, which will be replaced with the tag values for each recipient.
   :<json string userref: A transparent string reference, you may set to keep track of the message in your own systems. Returned to you when you receive a `Delivery Status Notification`_.
   :<json string priority: Default 'NORMAL'. One of 'BULK', 'NORMAL', 'URGENT' and 'VERY_URGENT'. Urgent and Very Urgent normally require the use of premium message class.
   :<json integer validity_period: Specified in seconds. If message is not delivered within this timespan, it will expire and you will get a notification. The minimum value is 60. Every value under 60 will be set to 60.
   :<json string encoding: Encoding to use when sending the message. Defaults to 'UTF8', which means we will use :term:`GSM 03.38`. Use :term:`UCS2` to send a unicode message.
   :<json string destaddr: One of 'DISPLAY', 'MOBILE', 'SIMCARD', 'EXTUNIT'. Use display to do "flash sms", a message displayed on screen immediately but not saved in the normal message inbox on the mobile device.
   :<json string payload: If you are sending a binary SMS, ie. a SMS you have encoded yourself or with speciel content for feature phones (non-smartphones). You may specify a payload, encoded as Base64. If specified, message must not be set and tags are unavailable.
   :<json string udh: UDH to enable additional functionality for binary SMS, encoded as Base64.
   :<json string callback_url: If specified send status notifications to this URL, else use the default webhook.
   :<json string label: A label added to each sent message, can be used to uniquely identify a customer or company that you sent the message on behalf of, to help with invoicing your customers. If specied it must be the same for all messages in the request.
   :<json int max_parts: A number between 1 and 255 used to limit the number of smses a single message will send. Can be used if you send smses from systems that generates messages that you can't control, this way you can ensure that you don't send very long smses. You will not be charged for more than the amount specified here. Can't be used with Tags or BINARY smses.
   :<json string extra_details: To get more details about the number of parts sent to each recipient set this to 'recipients_usage'. See example response below.
   :<json array recipients: Array of recipients, described below. The number of recipients in a single message is limited to 10.000. *required*
   :<jsonarr string msisdn: :term:`MSISDN` aka the full mobile phone number of the recipient. Duplicates are not allowed in the same message. *required*
   :<jsonarr object charge: Charge data. See `Overcharged SMSes`_.
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
   both be set at the same time, but it shows every possible field in the API
   like multiple recipients to the same message and multiple messages in the same payload.

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
              "message": "Hello World, regards %Firstname, --Lastname--",
              "payload": "cGF5bG9hZCBlbmNvZGVkIGFzIGI2NAo=",
              "label": "Deathstar inc."
              "recipients": [
                  {
                      "msisdn": 1514654321,
                      "tagvalues": [
                          "Vader",
                          "Darth"
                      ]
                  },
                  {
                      "msisdn": 1514654322,
                      "tagvalues": [
                          "Maul",
                          "Darth"
                      ]
                  }
              ],
              "sender": "Test Sender",
              "sendtime": 915148800,
              "tags": [
                  "--Lastname--",
                  "%Firstname"
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
             421332671, 4421332672
         ],
         "usage": {
             "countries": {
                 "DK": 3
             },
             "currency": "DKK",
             "total_cost": 0.36
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

   If the ``extra_details`` option is set to ``recipients_usage`` the response will look like:


   .. sourcecode:: http

     HTTP/1.1 200 OK
     Content-Type: application/json

     {
         "ids": [
             421332671, 4421332672
         ],
         "usage": {
             "countries": {
                 "DK": 3
             },
             "currency": "DKK",
             "total_cost": 0.36
         },
         "details": {
            "messages": [
               {
                  "id": 421332671,
                  "recipients": [
                     {
                        "country": "DK",
                        "msisdn": 1514654321,
                        "parts": 1
                     },
                     {
                        "country": "DK",
                        "msisdn": 1514654322,
                        "parts": 1
                     }
                  ]
               },
               {
                  "id": 421332672,
                  "recipients": [
                     {
                        "country": "DK",
                        "msisdn": 4512345678,
                        "parts": 1
                     }
                  ]
               }
            ]
         }
     }

Overcharged SMSes
^^^^^^^^^^^^^^^^^

*Overcharged SMSes are only possible in Denmark for the moment. Contact our support if you are interested in using this feature.*

An overcharged SMS is sent like a normal SMS, with a few extra parameters and restrictions.

Only one recipient per message is allowed. Messageclass *charge* must be used. Sendername is limited to ``1204`` or your own shortcode.

The ``charge`` object in recipient takes the following. See `Advanced usage`_ for full list of parameters.

.. http:post:: /rest/mtsms

   :<json float amount: The amount to be charged including VAT. *required*
   :<json string currency: Currency used in ISO 4217. *required*
   :<json string code: Product code. P01-P10. *required*
   :<json string description: Description of the charge to appear on the phonebill for the MSISDN owner. *required*
   :<json string category: Service category category. SC00-SC34. *required*


**Full example**

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
              "message": "Thank you for your purchase",
              "class": "charge",
              "sender": 1204,
              "recipients": [
                  {
                    "msisdn": 4512345678,
                    "charge": {
                      "amount": 50.75,
                      "currency": "DKK",
                      "code": "P01",
                      "category": "SC29",
                      "description": "Nokia tune",
                    }
                  }
              ]
          }
      ]

See `Charge status`_ for info about status reports and `Refund charged sms`_ for info about refunding a charged sms.

Get SMS and SMS status
---------------------------

You can use http get requests to retrieve a message based on its id, this will
give you back the original message that you send, including delivery status and
error codes if something went wrong. You get the ID when you send your message,
so remember to keep track of the id, if you need to retrieve a message. This is
only possible after the message has been sent, since only then is it
transferred to long term storage.

Please note we strongly recommend using `Webhooks`_ to get the status pushed to
you when it changes, rather than poll for changes. We do not provide the same
guarantees for this particular API endpoint as the others, since it runs on the
reporting infrastructure.

.. http:get:: /rest/mtsms/<message_id>
  :synopsis: Get SMS corresponding to id

  :arg integer id: A SMS ID, as returned when sending the SMS
  :status 200: Returns a dict that represents the SMS on success
  :status 400: Ie. invalid arguments, details in the JSON body
  :status 401: Ie. invalid API key or signature
  :status 403: Ie. unauthorized ip address
  :status 404: SMS is not found, or is not yet transferred to datastore.
  :status 422: Invalid json request body
  :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

  **Example response**

  .. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Length: 729
    Content-Type: application/json
    Date: Thu, 1 Jan 1970 00:00:00 GMT
    Server: Werkzeug/0.11.15 Python/3.6.0

     [
         {
             "class": "standard",
             "message": "Hello World, regards %Firstname, --Lastname--",
             "payload": null,
             "id": 1
             "label": "Deathstar inc."
             "recipients": [
                 {
                     "country": "DK",
                     "csms": 1,
                     "dsnerror": null,
                     "dsnerrorcode": null,
                     "dsnstatus": "DELIVERED",
                     "dsntime": 1498040129.0,
                     "mcc": 302,
                     "mnc": 720,
                     "msisdn": 1514654321,
                     "senttime": 1498040069.0,
                     "tagvalues": [
                         "Vader",
                         "Darth"
                     ]
                 }
                 {

                    "country": "DK",
                    "csms": 1,
                    "dsnerror": null,
                    "dsnerrorcode": null,
                    "dsnstatus": "DELIVERED",
                    "dsntime": 1498040129.0,
                    "mcc": 238,
                    "mnc": 1,
                    "msisdn": 4512345678,
                    "senttime": 1498040069.0,
                    "tagvalues": null
                },

             ],
             "sender": "Test Sender",
             "sendtime": 915148800,
             "tags": [
                 "--Lastname--",
                 "%Firstname"
             ],
             "userref": "1234",
             "priority": "NORMAL",
             "validity_period": 86400,
             "encoding": "UTF8",
             "destaddr": "MOBILE",
             "udh": null,
             "callback_url": "https://example.com/cb?foo=bar"
         }
     ]


.. _delete:

Delete scheduled SMS
---------------------
If you send smses using the sendtime parameter to schedule the sms for a specific time.
You can send us DELETE requests for the id of the schudeled message and remove it from,
the queue.

.. http:delete:: /rest/mtsms/{id}
   :synopsis: Delete the message with id, from our queue.

   You can only delete smses that have been added to the queue using the sendtime
   parameter.

   :arg integer id: A SMS ID, as returned when sending the SMS
   :status 204:
   :status 410: Message is already gone, either deleted or has been sent.
   :status 400: Ie. invalid arguments, details in the JSON body
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 404: SMS is not found, or is not yet transferred to datastore.
   :status 422: Invalid json request body
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

Check account balance
---------------------

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

Get prices
---------------------

You can use the prices endpoint to get our price as csv, xlsx or json.

.. http:get:: /api/prices/list/sms/<type>
   :synopsis: Get current prices for all countries

   :status 200: Returns a dict with an array containing information on your account.
   :status 403: Ie. unauthorized ip address
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

   **Response example**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

       {
          "premium": [
            {
              "country": "AD",
              "country_name": "Andorra",
              "dkk": 0.33000,
              "eur": 0.04430,
              "prefix": 376
            },
            {
              "country": "AE",
              "country_name": "United Arab Emirates",
              "dkk": 0.19000,
              "eur": 0.02600,
              "prefix": 971
            }
          ],
          "standard": [
            {
              "country": "AD",
              "country_name": "Andorra",
              "dkk": 0.31000,
              "eur": 0.04160,
              "prefix": 376
            },
            {
              "country": "AE",
              "country_name": "United Arab Emirates",
              "dkk": 0.16000,
              "eur": 0.02100,
              "prefix": 971
            }
          ]
       }

Webhooks
--------

Although the REST API supports polling for the message status, we strongly
encourage to use our simple webhooks for getting Delivery Status Notifications,
aka DSNs.

In addition webhooks can be used to react to enduser initiated events, such as
MO SMS (Mobile Originated SMS, or Incoming SMS).

If you filter IPs, note that we will call your webhook from the IP range
35.241.147.191/32 and 35.233.1.105/32. In the future we may add IPs but for now this is the range.


Delivery Status Notification
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _states:

States and status codes
~~~~~~~~~~~~~~~~~~~~~~~
By adding a URL to the callbackurl field, or setting one of your webhooks as
the default for status notifications, you can setup a webhook that will be
called whenever the current status (state) of the message changes, ie. goes
from a transient state (Circles, ie. Enroute) to final state (Boxes, ie.
DELIVERED) or an other transient state. Once a final state is reached we will
no longer call your webhook with updates for this particular message and
recipient.

.. graphviz::

   digraph foo {
      rankdir=LR;
      size=5;
      DELIVERED [shape=box];
      EXPIRED [shape=box];
      DELETED [shape=box];
      ACCEPTED [shape=box];
      REJECTED [shape=box];
      SKIPPED [shape=box];
      UNKNOWN [shape=plaintext];
      UNDELIVERABLE [shape=box];
      UNKNOWN -> BUFFERED -> ENROUTE -> DELIVERED [color=blue];
      UNKNOWN -> UNDELIVERABLE [style=dotted];
      UNKNOWN -> SCHEDULED -> Buffered;
      ENROUTE -> UNDELIVERABLE;
      ENROUTE -> EXPIRED;
      SCHEDULED -> DELETED;
      ENROUTE -> REJECTED;
      ENROUTE -> DELETED [style=dotted];
      ENROUTE -> ACCEPTED [style=dotted];
      ENROUTE -> SKIPPED [style=dotted];
      { rank=same; UNKNOWN SCHEDULED }
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
UNKNOWN       Messages start here, but you should not encounter this state.
SCHEDULED     Used for messages where you set a sendtime in the future.
BUFFERED      The message is held in our internal queue and awaits delivery to the mobile network.
ENROUTE       Message has been sent to mobile network, and is on it's way to it's final destination.
DELIVERED     The end user's mobile device has confirmed the delivery, and if message is charged the charge was successful.
EXPIRED       Message has exceeded it's validity period without getting a delivery confirmation. No further delivery attempts.
DELETED       Message was canceled.
UNDELIVERABLE Message is permanently undeliverable. Most likely an invalid :term:`MSISDN`.
ACCEPTED      The mobile network has accepted the message on the end users behalf.
REJECTED      The mobile network has rejected the message. If this message was charged, the charge has failed.
SKIPPED       The message was accepted, but was deliberately ignored due to network-specific rules.
============= =========================================

Charge status
~~~~~~~~~~~~~
For overcharged smses there is an extra status for the charging. The 'NOCHARGE'
state is a placeholder for the start of the charging flow.

The 'REFUND_FAIL' state is just a notification, the actual state will still be
'CAPTURED'.

.. graphviz::

   digraph foocharge {
      rankdir=LR;
      size=5;
      REFUND_FAIL [shape=box];
      REFUNDED [shape=box];
      CAPTURED [shape=box];
      AUTHORIZED [shape=box];
      FAILED [shape=box];
      CANCELLED [shape=box];
      NOCHARGE [shape=plaintext];
      NOCHARGE -> AUTHORIZED -> CAPTURED [color=blue];
      AUTHORIZED -> CANCELLED [style=dotted];
      NOCHARGE -> FAILED;
      CAPTURED -> REFUNDED;
      CAPTURED -> REFUND_FAIL;
   }

The normal path for messages are marked in blue above. The dotted lines are
very rare events not often used and/or applicable only to specific use cases.

============= =========================================
Status        Description
============= =========================================
NOCHARGE      Messages start here, but you should not encounter this state.
AUTHORIZED    The transaction is authorized
CANCELLED     The transaction is cancelled or timed out
CAPTURED      The transaction is captured and the amount will be charged from the recipients phone bill
FAILED        The transaction failed. Usually because the phone number has blocked for overcharged sms
REFUNDED      A previously captured transaction has been successfully refunded to the phone owner
REFUND_FAIL   The refund procedure failed.
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
   :<json string country_code: Optional country code of the msisdn.
   :<json integer country_prefix: Optional country prefix of the msisdn.
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
          "userref": "foobar",
          "charge_status": "CAPTURED",
          "country_code": "DK",
          "country_prefix": 45
      }

   If we can't reach your server, or you reply with a http status code >= 300,
   then we will re-attempt delivery of the DSN after a 60 second delay, then
   120 seconds, 360 seconds, 24 minutes, 2 hours and lastly after 12 hours.
   We expect you to reply with a 2XX status code within 15 seconds, or we
   consider it a failed attempt.

   The `charge_status` is only present for overcharged smses.


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
   :<json string country_code: Optional country code of the msisdn.
   :<json integer country_prefix: Optional country prefix of the msisdn.


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
          "webhook_label": "test",
          "country_code": "DK",
          "country_prefix": 45
      }

   If we can't reach your server, or you reply with a http status code >= 300,
   then we will re-attempt delivery of the DSN after a 60 second delay, then
   120 seconds, 360 seconds, 24 minutes, 2 hours and lastly after 12 hours.
   We expect you to reply with a 2XX status code within 15 seconds, or we
   consider it a failed attempt.


Authentication token
^^^^^^^^^^^^^^^^^^^^

When setting up your webhook you have an option to add an authentication token
if you add text to this field we will use it to make a JWT token, which
we will send back to your server in the :code:`X-Gwapi-Signature` header.

JWT is widely supported and you can find libraries for mostly any programming
language on https://jwt.io, that will show you how to verify the token.

To verify you need the token we send in the :code:`X-Gwapi-Signature` header
and the authentication token that you chose when setting up your webhook.


Code Examples
~~~~~~~~~~~~~

How to verify JWT tokens in differnt languages. More examples can be found on
https://jwt.io.

In the following examples the secret shared between you and GatewayAPI are
written directly in the code, in production environments, the shared secret
should be part of your configuration, so it is better protected.

- PHP

.. sourcecode:: php

  <?php
  require_once 'vendor/autoload.php';
  use \Firebase\JWT\JWT;
  /*
    Token is extracted from the X-Gwapi-Signature header in the post request
    received on your webserver.
  */
  $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjM4MTcwMywibXNpc2RuIjo0NTQyNjA5MDQ1LCJ0aW1lIjoxNTIyNzY0MDYyLCJzdGF0dXMiOiJERUxJVkVSRUQiLCJlcnJvciI6bnVsbCwiY29kZSI6bnVsbCwidXNlcnJlZiI6bnVsbCwiY2FsbGJhY2tfdXJsIjoiaHR0cDovL2JiYWY3MTQyLm5ncm9rLmlvIiwiYXBpIjo0fQ.KdfDH65bnQtgxEkFnpAQodOciAJedZFB13r9wEo8t3Y';
  // secret is the secret token you have chosen when setting up your webhook.
  $secret = "secret";
  // Verify.
  $decoded = JWT::decode($token, $secret, array('HS256'));
  print_r($decoded);
  ?>

- Python

.. sourcecode:: python

  # The token variable contains the jwt token
  # extracted from X-Gwapi-Signature header from the post request received.
  # on your webserver
  token = (
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjM4MTcwMywibXNpc2RuIjo'
    '0NTQyNjA5MDQ1LCJ0aW1lIjoxNTIyNzY0MDYyLCJzdGF0dXMiOiJERUxJVkVSRUQiLCJlcnJ'
    'vciI6bnVsbCwiY29kZSI6bnVsbCwidXNlcnJlZiI6bnVsbCwiY2FsbGJhY2tfdXJsIjoiaHR'
    '0cDovL2JiYWY3MTQyLm5ncm9rLmlvIiwiYXBpIjo0fQ.KdfDH65bnQtgxEkFnpAQodOciAJ'
    'edZFB13r9wEo8t3Y')
  # The secret chosen by you when setting up your webhook
  secret = 'secret'
  # Verify
  decoded = jwt.decode(token, secret, algorithms=['HS256'])
  print(decoded)

- NodeJS

.. sourcecode:: js

  var jwt = require('jsonwebtoken');
  // var secret is the secret that you chose and entered on gatewayapi.com
  // when setting up your webhook.
  var secret = 'secret'
  var auth = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjM4MTcwMywibXNpc2RuIjo0NTQyNjA5MDQ1LCJ0aW1lIjoxNTIyNzY0MDYyLCJzdGF0dXMiOiJERUxJVkVSRUQiLCJlcnJvciI6bnVsbCwiY29kZSI6bnVsbCwidXNlcnJlZiI6bnVsbCwiY2FsbGJhY2tfdXJsIjoiaHR0cDovL2JiYWY3MTQyLm5ncm9rLmlvIiwiYXBpIjo0fQ.KdfDH65bnQtgxEkFnpAQodOciAJedZFB13r9wEo8t3Y'
  var decoded = jwt.verify(auth, secret);
  console.log(decoded);

- Ruby

.. sourcecode:: ruby

  require 'jwt'
  token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjM4MTcwMywibXNpc2RuIjo0NTQyNjA5MDQ1LCJ0aW1lIjoxNTIyNzY0MDYyLCJzdGF0dXMiOiJERUxJVkVSRUQiLCJlcnJvciI6bnVsbCwiY29kZSI6bnVsbCwidXNlcnJlZiI6bnVsbCwiY2FsbGJhY2tfdXJsIjoiaHR0cDovL2JiYWY3MTQyLm5ncm9rLmlvIiwiYXBpIjo0fQ.KdfDH65bnQtgxEkFnpAQodOciAJedZFB13r9wEo8t3Y'
  secret = 'secret'
  decoded = JWT.decode token, secret
  puts decoded_token


Get MOSMS by API
----------------
A webhook is required to receive incoming messages, but in addition messages can also be retreived using a GET request.

.. http:get:: /rest/mosms
   :synopsis: Get incoming messages for a date range

   :query from: The from date, in YYYY-MM-DD format *required*
   :query to: The to date, in YYYY-MM-DD format *required*
   :query page:      Page number
   :query per_page:  Results per page (max 200)
   :>jsonarr int results:   Total results
   :>jsonarr int pages:     Pages available
   :>jsonarr int per_page:  Results per page
   :>jsonarr int page:      Current page
   :>jsonarr array messages:  Array of messages

   **Example request**

   .. sourcecode:: http

     GET /rest/mosms?from=2019-01-01&to=2019-01-14

   **Example response**

   .. sourcecode:: http

     HTTP/1.1 200 OK
     Content-Type: application/json

     {
       "messages": [
          {
            "anonymized": null,
            "encoding": null,
            "message": "test",
            "mosms_id": 2398517,
            "msisdn": 4512345678,
            "receiver": 451204,
            "sender": null,
            "senttime": 1554465205.0,
            "webhook": "Rukikab"
          },
          {
            "anonymized": null,
            "encoding": null,
            "message": "test2",
            "mosms_id": 2398518,
            "msisdn": 4512345678,
            "receiver": 451204,
            "sender": null,
            "senttime": 1554465459.0,
            "webhook": "Fibotfus"
          }
       ],
       "page": 1,
       "pages": 1,
       "per_page": 50,
       "results": 2
     }


Get usage by label
------------------

You can get the account usage for a specific date range, sub divided by label
and country. This can be used for billing your own customers (specified by
label) if you do not keep track of each sms sent yourself.

.. http:post:: /api/usage/labels
   :synopsis: Get usage for a date range

   :<json string from: The from date, in YYYY-MM-DD format *required*
   :<json string to: The to date, in YYYY-MM-DD format *required*
   :<json string label: Optional label you want to look for.
   :>jsonarr float amount: Amount of SMSes
   :>jsonarr float cost: Cost of the SMSes
   :>jsonarr string country: The country the SMSes was sent to
   :>jsonarr string currency: Either DKK or EUR
   :>jsonarr string label: The label specified when the SMSes was sent
   :>jsonarr string messageclass_id: The class specified when the SMSes was sent


   :status 200: Returns a array with a dict containing usage info.
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

   **Response example**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      [
        {
          "amount": 29,
          "cost": 3.48,
          "country": "DK",
          "currency": "DKK",
          "label": null,
          "messageclass_id": "standard"
        },
        {
          "amount": 6,
          "cost": 1.5,
          "country": "IT",
          "currency": "DKK",
          "label": null,
          "messageclass_id": "standard"
        }
      ]

.. _email:

Sending emails (beta)
---------------------
You can send emails through gatewayapi using our email endpoint. This endpoint
is in private beta, contact sales@gatewayapi.com to request access to the beta.

.. http:post:: /rest/email
   :synopsis: Send a new email

   :<json string html: The html content of the email.
   :<json string plaintext: The plain text content of the email.
   :<json string subject: The subject line of the email, tags can be used like in the message to personalise the subject.
   :<json string from: The name and email of the sender, can be just the email if no name is specified, see below for format.
   :<json string reply: The name and email of the sender, can be just the email if no name is specified, see below for format.
   :<json string returnpath: Receive emails with bounce information.
   :<json array tags: A list of string tags, which will be replaced with the tag values for each recipient, if used remember to also add tagvalues to all recipients.
   :<json array attachments: A list of base64 encoded files to be attached to the email, described below:
   :<json string data: The base64 encoded data of the file to attach.
   :<json string filename: The name of the file attached to the email.
   :<json string mimetype: The mimetype of the file, eg. text/csv.
   :<json array recipients: list of email addresses to receive the email, described below:
   :<json string address: The recipient email address.
   :<json string name: The name of the recipient shown in the email client.
   :<json array tagvalues: A list of string values corresponding to the tags in the email. The order and amount of tag values must exactly match the tags.
   :<json array cc: A list of cc recipients, taks an address and optionally a name of the recipient.
   :<json array bcc: A list of cc recipients, taks an address and optionally a name of the recipient.
   :status 200: Returns a dict with an array of message IDs and a dictionary with usage information on success
   :status 400: Ie. invalid arguments, details in the JSON body
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 422: Invalid json request body
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body


   .. sourcecode:: http

      POST /rest/email HTTP/1.1
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
          "html": "<b>Hello %firsname %surname %target is about to be removed.",
          "plaintext": "Hello %firsname %surname %target is about to be removed.",
          "subject": "Annihilation: %target",
          "from": "Darth Vader <darth@example.com>",
          "returnpath": "bounce@example.com",
          "tags": ["%firstname", "%surname", '%target'],
          "recipients": [
              {"address": "l.organa@example.com", "name": "Leia Organa", "tagvalues": ["Leia", "Organa", "Alderaan"], "cc": [{"address": "h.solo@example.com", "name": "Han Solo"}], "bcc": [{"address": "chewie@example.com", "name": "Chewbacca"}]},
              {"address": "l.skywalker@example.com", "name": "Luke Skywalker", "tagvalues": ["Luke", "Skywalker", "Alderaan"] }
          ]
      }


   **Example response**

     If the request succeed, the internal message identifiers are returned to
     the caller like this:

     .. sourcecode:: http

       HTTP/1.1 200 OK
       Content-Type: application/json

       {
           "ids": [
               431332671
           ]
           "usage": {
               "amount": 1,
               "currency": "DKK",
               "total_cost": 0.003
           }

       }


Email code examples
^^^^^^^^^^^^^^^^^^^
Code examples for sending emails.

Python
~~~~~~

For this example you'll need the excellent `Requests-OAuthlib`_. If you are
using pip, simply do ``pip install requests_oauthlib``.

.. sourcecode:: python

  from requests_oauthlib import OAuth1Session
  key = 'Go-Create-an-API-Key'
  secret = 'Go-Create-an-API-Key-and-Secret'
  gwapi = OAuth1Session(key, client_secret=secret)
  req = {
    'html': '<b>Hello %firsname %surname %target is about to be removed.',
    'plaintext': 'Hello %firsname %surname %target is about to be removed.',
    'subject': 'Annihilation: %target',
    'from': 'Darth Vader <darth@galacticempire.com>',
    'reply': 'Count Dokuu <c.dokuu@galacticempire.com>',
    'returnpath': 'bounce@galacticempire.com',
    'recipients': [{'address': 'l.organa@example.com',
                    'name': 'Leia Organa',
                    'tagvalues': ['Leia', 'Organa', 'Alderaan'],
                    'cc': [{'address': 'h.solo@example.com',
                            'name': 'Han Solo'}],
                    'bcc': [{'address': 'chewie@example.com',
                             'name': 'Chewbacca'}],
                    }],
    'tags': ['%firstname', '%surname', '%target'],
    'attachments': [{
    'data': '/9j/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCg'
      'sOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEA'
      'AD8A0s8g/9k=',
      'filename': 'kyber.jpeg', 'mimetype': 'image/jpeg'}]
  }
  res = gwapi.post('https://gatewayapi.com/rest/email', json=req)
  print(res.json())
  res.raise_for_status()


.. _`OAuth 1.0a`: http://tools.ietf.org/html/rfc5849
.. _`two-legged`: http://oauth.googlecode.com/svn/spec/ext/consumer_request/1.0/drafts/2/spec.html
.. _`HTTP Basic Auth`: http://tools.ietf.org/html/rfc1945#section-11.1
.. _`OAuth Authorization header`: http://tools.ietf.org/html/rfc5849#section-3.5.1
.. _`Requests-OAuthlib`: https://requests-oauthlib.readthedocs.org/
.. _`Guzzle`: http://guzzlephp.org/
.. _`RestSharp`: http://restsharp.org/
.. _`NewtonSoft`: http://www.newtonsoft.com/json
.. _`Httpie`: https://httpie.org
.. _`stopping illegal sms trafic`: https://gatewayapi.com/blog/tech/2019/02/07/blocking-illegal-sms-traffic.html

HLR and Number lookup
---------------------
We are at work on expanding our services with a HLR API, for now we are offering
a number lookup API for danish numbers only. This will only be available to selected customer.
If you have use of this API talk to us on support and we will figure something out.
Requested numbers can be of any of these forms '+4512345678', 004512345678, 4512345678.


.. http:post:: /rest/hlr
   :synopsis: Lookup requested numbers.

   :<json array msisdns: List of numbers to lookup.
   :status 200: Returns a dict with information for each number in the request.
   :status 400: Ie. invalid arguments, details in the JSON body
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address, or account is not authorized to use this API.
   :status 422: Invalid json request body
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

   **Example response**

     If the requests succeeds information for each valid number passed to the API,
     will be returned as below.

     .. sourcecode:: http

       HTTP/1.1 200 OK
       Content-Type: application/json

       {
          "currency": "DKK",
          "hlr": {
              "4512345678": {
                  "current_carrier": {
                      "mcc": "238",
                      "mnc": "20",
                      "name": "Telia"
                  },
                  "network_operator": {
                      "mcc": "238",
                      "mnc": "20",
                      "name": "Telia"
                  },
                  "original_carrier": {
                      "mcc": "238",
                      "mnc": "20",
                      "name": "Telia"
                  },
              "ported": false,
              "type": "GSM"
              }
          },
          "lookups": 1,
          "total_cost": 0.06
        }

Code examples
^^^^^^^^^^^^^^^^^^^
Code examples for hlr lookups


Python
~~~~~~

For this example you'll need the excellent `Requests-OAuthlib`_. If you are
using pip, simply do ``pip install requests_oauthlib``.

.. sourcecode:: python

  from requests_oauthlib import OAuth1Session
  key = 'Go-Create-an-API-Key'
  secret = 'Go-Create-an-API-Key-and-Secret'
  gwapi = OAuth1Session(key, client_secret=secret)
  req = {
      'msisdns': [4512345678]
  }
  res = gwapi.post('https://gatewayapi.com/rest/hlr', json=req)
  print(res.json())
  res.raise_for_status()

Httpie
~~~~~~~
For quick testing with a pretty jsonified response in your terminal you can use
`Httpie`. It can be done simply using your token as follows.

.. sourcecode:: bash

  http --auth=GoGenerateAnApiToken: \
  https://gatewayapi.com/rest/hlr \
  msisdns:='[451234678]'

.. _refund:

Refund charged sms
------------------
Charged smses that have successfully been captured are eligible for refunds.
Sending charged smses requires special setup and permissions. You will not
immediately know if the refund is successful, this info will be send to your
callback url, or will be visible through the sms log on your backend when
updated.

.. http:post:: /rest/refund
   :synopsis: Refund a successfully charged sms.

   Only charged smses with charge status capture, can be refunded.

   :<json integer mtsms_id: The id of the charged sms to refund.
   :<json integer msisdn: The msisdn the charged messages was sent to.
   :<json string callback_url: Optional url for getting status of the refund.
   :status 204:
   :status 400: Ie. invalid arguments, details in the JSON body
   :status 401: Ie. invalid API key or signature
   :status 403: Ie. unauthorized ip address
   :status 404: SMS is not found.
   :status 422: Invalid json request body
   :status 500: If the request can't be processed due to an exception. The exception details is returned in the JSON body

VAS
---
You can use this API to programmatically add new keywords to your account, for use with value added services (VAS), ie. your services.

Access to this API requires a separate agreement with GatewayAPI, intended for resellers and/or accounts with large needs for two-way messaging.

.. http:get:: /api/vas

    Get a list of keywords

    :reqheader Authorization: API Token or OAuth bearer token

    .. sourcecode:: http

        GET /api/vas HTTP/1.1
        User-Agent: curl/7.37.1
        Host: gatewayapi.com
        Accept: */*
        authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXV...

    **Example response**:

    .. sourcecode:: http

        HTTP/1.0 200 OK
        Content-Type: application/json
        Content-Length: 148
        Date: Mon, 18 May 2015 12:53:59 GMT

        [
            {
                'shortcode': 451204,
                'keyword': 'charlie',
                'pushsetting_reference': 'foo'
            }
        ],


Check if a keyword is available
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. sourcecode:: http

    :<json string keyword: Keyword to search for
    :<json integer shortcode: ie. 451204
    :>json string system: System using the keyword (gatewayapi/nimta)
    :>json boolean available: Is the keyword available
    :reqheader Authorization: API Token or OAuth bearer token
    :statuscode 200: no error, see json output
    :statuscode 422: input validation error


.. sourcecode:: http

    POST /api/vas/check HTTP/1.1
    Host: gatewayapi.com
    Accept: */*
    Authorization: Basic TzFsa3FtTGhRdHFRMXpHNHp
    Content-Type: application/json

    { "shortcode": 451204, "keyword": "foobar" }

**Example response**:

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
        "available": false,
        "system": "nimta"
    }

Add a new keyword
^^^^^^^^^^^^^^^^^

Please note that the price for the keyword will be deducted from your
GatewayAPI Credit immediately upon adding the keyword.

In addition once a month you will receive an invoice for all the keywords
you use.

When adding a new keyword you are charged the full price, regardless how
many days are left in the month until next invoice period.

If you want to assign the new keyword to a webhook right away, set the
optional field pushsetting_reference to the "unique label" of the webhook.

.. sourcecode:: http

    :<json string keyword: Keyword to add
    :<json integer shortcode: ie. 451204
    :<json string pushsetting_reference: Optional webhook to assign to.
    :reqheader Authorization: API Token or OAuth bearer token
    :statuscode 201: created
    :statuscode 422: input validation error


.. sourcecode:: http

    POST /api/vas HTTP/1.1
    Host: gatewayapi.com
    Accept: */*
    Authorization: Basic TzFsa3FtTGhRdHFRMXpHNHp
    Content-Type: application/json

    { "shortcode": 451204, "keyword": "foobar" }

**Example response**:

.. sourcecode:: http

    HTTP/1.1 201 CREATED
    Content-Type: application/json

    {
        "account_id": 1,
        "keyword": "foobar",
        "pushsetting_reference": null,
        "shortcode": 451204
    }


Cancel the keyword.
^^^^^^^^^^^^^^^^^^^
.. sourcecode:: http

    :query shortcode: ie. 451204
    :query keyword: The keyword to delete
    :reqheader Authorization: API Token or OAuth bearer token
    :statuscode 202: Accepted for deletion at end of payment period.
    :statuscode 404: couldn't find the keyword
    :statuscode 422: input validation error

.. sourcecode:: http

    DELETE /api/vas/451204/foobar HTTP/1.1
    Host: gatewayapi.com
    Accept: */*
    Authorization: Basic TzFsa3FtTGhRdHFRMXpHNHp

**Example response**:

.. sourcecode:: http

    HTTP/1.1 204 OK
    Content-Length: 0