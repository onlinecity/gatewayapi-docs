Appendix
========

Throughout the documentation we are going to refer some terms that might not be
commonly used outside the mobile gateway business, so you'll find them all
explained here.

Glossary
--------
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

   MCC
      Mobile Country Code, as defined by the ITU-T E.212 standard.

   MNC
      Mobile Network Code, as defined by the ITU-T E.212 standard.

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

   UCS2
      Universal Coded Character Set, an early Unicode implementation. For the
      most part you can use UTF-16-BE (Big Endian) interchangeably with UCS-2.



SMS Length
----------
  A sms message has a maximum size of 140 bytes, messages larger than 140
  bytes are chained together using some of these bytes, leaving 134 bytes
  for the message on each "page".

  Using :term:`GSM 03.38` the length is extended by only using 7 bits per
  character instead of the normal 8 bits used by UTF-8 this gives 160
  characters for one page messages, when chaining the messages this
  extension by using 7 bits leave 153 characters.

  Using :term:`UCS2` encoding will enable to use a wide range of different
  characters that is not available in :term:`GSM 03.38`, this is achieved
  by using 2 bytes per character. giving you 70 characters for one page
  messages, if you go above 70 characters the messages will be chained
  giving you 134 bytes or 67 characters for your message.

  In short:

  * GSM 03.38 (default)

    * Uses 7 bits per character, to extend the 140 bytes max length of a
      sms

    * 160 normal characters for one page.

    * Messages longer than 160 characters are chained and gives a length
      of 153 characters per page.

  * UCS2

    * Allows the use of a lot of different special characters by using 2
      bytes per character

    * 70 characters for one page.

    * Messages longer then 70 characters are chained and gives a leaves
      67 characters per page.

SMS Sender
----------
The originator of the SMS message. The SMS standards limit the length up to 15
digits if it's a number and up to 11 characters if it's a text. You can use
spaces in the sender, but most modern smartphones do not display the space.

For some destinations there may be country/network specific restrictions on the
senders, and the sender may be automatically replaced or you may need to use a
special sender for the destination/network.

We recommend you stick with characters in the range a-zA-Z0-9, however if you
do use `Latin-1`_ characters ie. (æøå) we will support it on connections
where it is available. If the mobile network connection do not support these
characters, we will automatically replace them with basic latin chracters
according to the table below. If the replacement results in a too long sender,
only the first character of the replacement is used.

==== ==== ===========
Code Char Replacement
==== ==== ===========
00A0
00A1 ¡    !
00A2 ¢    C/
00A3 £    PS
00A4      $?
00A5 ¥    Y=
00A6 ¦    |
00A7 §    SS
00A8 ¨    "
00A9 ©    \(c\)
00AA ª    a
00AB «    <<
00AC ¬    !
00AD
00AE ®    \(r\)
00AF ¯    \-
00B0 °    deg
00B1 ±    +-
00B2 ²    2
00B3 ³    3
00B4 ´    '
00B5 µ    u
00B6 ¶    P
00B7 ·    \*
00B8 ¸    ,
00B9 ¹    1
00BA º    o
00BB »    >>
00BC ¼    1/4
00BD ½    1/2
00BE ¾    3/4
00BF ¿    ?
00C0 À    A
00C1 Á    A
00C2 Â    A
00C3 Ã    A
00C4 Ä    A
00C5 Å    Aa
00C6 Æ    Ae
00C7 Ç    C
00C8 È    E
00C9 É    E
00CA Ê    E
00CB Ë    E
00CC Ì    I
00CD Í    I
00CE Î    I
00CF Ï    I
00D0 Ð    D
00D1 Ñ    N
00D2 Ò    O
00D3 Ó    O
00D4 Ô    O
00D5 Õ    O
00D6 Ö    O
00D7 ×    x
00D8 Ø    Oe
00D9 Ù    U
00DA Ú    U
00DB Û    U
00DC Ü    U
00DD Ý    Y
00DE Þ    Th
00DF ß    ss
00E0 à    a
00E1 á    a
00E2 â    a
00E3 ã    a
00E4 ä    a
00E5 å    aa
00E6 æ    ae
00E7 ç    c
00E8 è    e
00E9 é    e
00EA ê    e
00EB ë    e
00EC ì    i
00ED í    i
00EE î    i
00EF ï    i
00F0 ð    d
00F1 ñ    n
00F2 ò    o
00F3 ó    o
00F4 ô    o
00F5 õ    o
00F6 ö    o
00F7 ÷    /
00F8 ø    oe
00F9 ù    u
00FA ú    u
00FB û    u
00FC ü    u
00FD ý    y
00FE þ    th
00FF ÿ    y
==== ==== ===========

We route the traffic to the best connection regardless of their support of
special characters, so you may experience the sender is replaced. With that
said, if you have a special need for these characters in your sender fields,
contact support and we can work something out.

.. _`Latin-1`: https://unicode-table.com/en/blocks/latin-1-supplement/
