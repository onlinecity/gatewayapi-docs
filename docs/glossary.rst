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

   GSM 03.38
      The de facto standard encoding in SMS, which supports up to 160 normal
      characters in a single SMS, and 153 normal characters in each SMS in a
      chained/concatenated SMS. It achives this by using 7 bits for each
      character and supports the common characters in most western languages.

      The full character set is:

       * Basic Latin

         * (Space) ``!`` ``"`` ``#`` ``$`` ``%`` ``&`` ``'`` ``(`` ``)`` ``*`` ``+`` ``,`` ``-`` ``.`` ``/``
         * 0 1 2 3 4 5 6 7 8 9
         * : ; < = > ? @
         * a b c d e f g h i j k l m n o p q r s t u v w x y z
         * A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

       * Special characters

         * (Currency sign) £ ¥
         * § ¿ _
         * (Newline \\n), (Carriage Return \\r)

       * Greek characters

         * Δ Φ Γ Λ Ω Π Ψ Σ Θ Ξ

       * Diacritics

         * è é ù ì ò Ç Ø ø Å å Æ æ ß É Ä Ö Ñ Ü ä ö ñ ü à ä ö ñ ü à

       * These characters use two GSM 03.38 chars to encode one of the following

         * ^ { } \ [ ] ~ | €


*More to come...*
