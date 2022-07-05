/-  *membrane-sheet
/+  *membrane-dejs
/+  *membrane-enjs
|_  shet=sheet
::  grow: methods for converting from our mark to another mark
::
++  grow
  |%
  ++  noun  shet
  ++  json  (enjs-sheet shet)
  --
::  grab:  methods for converting to our mark from another mark.
::
++  grab
  |%
  ++  noun  ^-(sheet shet)
  ++  json  dejs-sheet
  --
::  revision control methods
::
++  grad  %noun
--