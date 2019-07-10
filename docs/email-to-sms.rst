.. _email2sms:

Email to/from SMS
=================
Documentation of how to send emails to sms and using web hooks to receive messages
and have them delivered to your email inbox.

Email to SMS
------------

To use this API, you need to whitelist one or more emails or an entire domain,
for sending smses.

Whitelisting emails
^^^^^^^^^^^^^^^^^^^

To whitelist emails and domains go to "Settings" "Email Whitelist", add an email like
me@example.com or an entire domain e.g. @example.com if your whole organisation
should be able to send messages this way.

If you whitelist @example.com no other accounts will be able to use this domain.


Requirements
~~~~~~~~~~~~

To successfully deliver your email as a SMS you have two options for proper authentication:

1. Your whitelisted emails or domain, need to pass SPF check and have a DKIM record.
2. You need to put an API token in the Subject field of the e-mail.

For security reasons we highly recommend option 1, since e-mails in most cases are transferred
unencrypted over SMTP, an attacker might be able to capture your API tokens.
We do provide the second option for customers that are unable to setup SPF and DKIM for their e-mail.

Sending an SMS
^^^^^^^^^^^^^^

Sending via the Email to SMS api is straightforward, all you need to do is
send to the phonenumbers of your recipients and set a default sender id.

Recipients
~~~~~~~~~~~

Sending sms messages is a simple as sending an email to the
phonenumber@smtp.gatewayapi.com, for example 4512345678@smtp.gatewayapi.com

Sender ID
~~~~~~~~~~

Your sender ID is controlled by the default sender setting found under
"Settings", "SMS defaults".

SMS length
~~~~~~~~~~

Smses send on this API is limited to 5 sms parts, equal to 765 characters, this
is a measure to try and prevent unintenionally long smses send, when using email
clients like e.g. Gmail, where the mails are kept as conversation threads,
where responding to the original email, will keep the entrie conversation in
the email.

SMS to Email
------------

Receiving SMS messages from your users in your email inbox, requires you to
have a virtual number attached to your account, and to use this number with
a SMS to Email web hook.


SMS to Email Webhook
^^^^^^^^^^^^^^^^^^^^

Navigate to "Settings" "Web hooks" and setup a web hook, of the type, SMS to Email
Give your web hook a name, and add email adresses that should receive the smses.

Smses will be delivered with from address: 4512345678@smtp.gatewayapi.com for
example.
