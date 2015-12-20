Glossary
========

Throughout the documentation we are going to refer some terms that might not be
commonly used outside the mobile gateway business, so you'll find them all
explained here.

.. glossary::

   MT SMS
      Mobile Terminated SMS. Sent SMS. Outgoing SMS.
      A SMS going from our gateway to an end users mobile device.

   MO SMS
      Mobile Originated SMS. Received SMS. Incoming SMS.
      A SMS sent by an end user to one of our application numbers.

   MSISDN
      Mobile Station International Subscriber Directory Number, but you may
      think of this as the full mobile number, including area code if available
      and the country code, but without prefixed zeros or '+'.
      Examples:
       * 4510203040 (In Denmark known as: 10 20 30 40)
       * 46735551020 (In Sweden known as: 073-555 10 20)
       * 17325551020 (In US known as: (732) 555-1020)
      The MSISDN is easily interchangeable with :term:`E.164` numbers, you
      simply remove or add the leading '+' in :term:`E.164`.
      It can contain up to 15 digits, so we use an unsigned 64-bit integer.

   E.164
      The standard format for international phone numbers. Up to 15 digits.


*More to come...*
