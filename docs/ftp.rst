FTP API
=======

For this API you need a set of credentials. These are different from the
OAuth API the Rest API uses. You'll find them in the dashboard, under Settings.

We made this API upon request by our valued customers, but we strongly
encourage all customers to use the REST API. You can also batch many SMS'es
together in one REST call.

Access to this API is controlled by our support staff, so if you require access
please contact our live support and help us understand your use case so we
can provide you with the best solution.

We have two active ftp servers, "**a.ftp.gatewayapi.com**" and
"**b.ftp.gatewayapi.com**". Both see the same files, if you can't connect to one,
try the other server. Ideally have your solution automatically failover if one
is temporary unavailable.

Flow
----
* After uploading your file, you send the file by adding ".ready" to the end
  of the file. That is you rename the file. If the file is in excel format,
  add ".excel.ready".
* The moment you rename the file, we start sending it and ".ready" is changed
  to a timestamped (Ymd'T'His) ".processing". Beware that most FTP clients
  cache the file listing, so you might need to click refresh in your FTP client
  to see this change.
* If the file could not be processed, it will be renamed to ".rejected". The
  cause of the failure will be added to the bottom of the file.
* When the file is processed and queued for delivery it will be renamed to
  ".success".

.. graphviz::

   digraph foo {
      rankdir=LR;
      size=5;
      Upload [shape=plaintext];
      ".ready";
      ".processing";
      ".rejected" [shape=box];
      ".success" [shape=box];
      Upload -> ".ready" -> ".processing" -> ".success" [color=blue];
      ".processing" -> ".rejected";
   }

If processing fails due to internal errors, the file batch will be retried up
to 5 times, with 30 minutes between each attempt.


Format
------
The first row in the CSV must ALWAYS be a list of column names. We understand
the following column names, which must match *exactly*.

========= =========================================
column    Description
========= =========================================
msisdn    :term:`MSISDN` aka the full mobile phone number of the recipient
message   The message to send. If longer than 160 normal chars, it will be split into parts of 153 normal chars.
sender    *Optional*. Up to 11 alphanumeric characters, or 15 digits, that will be shown as the sender of the SMS.
class     *Optional*. Default "standard". The message class to use for this request. If specified it must be the same for all messages in the file.
userref   *Optional*. A transparent string reference, you may set to keep track of the message in your own systems.
========= =========================================

We will attempt to auto detect the file encoding (ie. UTF-8 or
Windows-1252/cp1252). You can override this by adding ".utf8" or ".cp1252" to
the file. Keep in mind the file must *end with* ".ready" in order for
processing to start, so to override auto detected and force utf-8, call it
ie ".utf8.ready". UTF-16/32 is supported too, but only with auto detection.

Example of a unix encoded file

.. code-block:: none
   :linenos:

   "userref","msisdn","sender","class",message"
   "test","4510203040","MyCompany","standard","I'm John Doe, who ""randomly"" quote things."
   ,"4512345678",,"standard","Optional fields"

If you added ".excel" to the file name, excels format is used. The target is
what excel outputs on windows, running a Western Language and using the Save As
"CSV (Semicolon Delimited)".

.. code-block:: none
   :linenos:

   userref;msisdn;sender;class;message
   "test";"4510203040";"MyCompany";"standard";"I'm John Doe, who ""randomly"" quote things."

We do not support escaping double quotes by adding backslashes. Double quotes
must be escaped by adding an extra double quote, as is the most widely used
convention.

You can terminate each row with CR+LF (\\r\\n) or LF (\\n). We recommend LF for
unix and CR+LF for excel format, as is standard on the respective platforms.
Tab delimited files are not supported.


Caveats
-------
* You can't upload Excel .xls(x) files, save the file as "CSV (Semicolon
  delimited)", and remember to add ".excel.ready" when sending the file.
* The encoding/charset of the file is auto detected, consider adding explicit
  encoding to the file name. Although auto detection is very good, there are a
  few rare edgecases.
* We recommend you do not create the CSV yourself, but have some standard
  software do it.
* You can use newlines (ie. \\n) as normal, as long as the text is in double
  quotes " ". Remember that CR+LF (\\r\\n) is two chars in the SMS (unless you
  have the new SMS optimization feature enabled which can remove the CR (\\r).
* The FTP has strongly limited feature set compared the the REST API, this
  is by design.
* Many FTP clients cache the directory listing, so they do not show the
  subsequent ".processing" and ".success" steps unless you force refresh the
  client.
* You can't delete or rename files in the ".processing" stage. You can however
  delete .success or .rejected files.
* You can't create new directories.
* You can't modify the file permissions.
* Due to FTPs protocol design, it's not trivial to implement load balancing, so
  you may experience an outage of one ftp servers during maintenance windows.
  If possible automatically try the other server if one fails.
* The timestamp added to the files is in UTC
* Existing files will be overwritten, but due to the timestamp this is unlikely.
* Files larger than 30 MB will not be processed, we recommend you split very
  large batches into smaller files of 10.000 rows each.
