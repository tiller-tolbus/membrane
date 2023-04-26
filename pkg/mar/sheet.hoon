/-  *membrane
/+  *membrane-dejs
/+  *membrane-enjs
|_  s=sheet
::  grow: methods for converting from our mark to another mark
::
++  grow
  |%
  ::  mime type so mounting a clay desk doesn't return an error   
  ::  not currently useful for anything
  ++  mime  [/application/octet-stream (as-octs:mimes:html (jam s))]
  ++  noun  s
  ++  json  (enjs-sheet s)
  --
::  grab:  methods for converting to our mark from another mark.
::
++  grab
  |%
  ++  mime  |=(=^mime (sheet (cue q.q.mime)))
  ++  noun  sheet
  ++  json  dejs-sheet
  --
::  revision control methods
::
++  grad  %noun
--