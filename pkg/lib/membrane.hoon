/-  *membrane
!:
|%
::  Type core
+$  json-sheet  $:(%a (list json-row))
+$  json-row  $:(%a (list json-scell))
+$  json-scell  $:(%s @t)
--
|%
++  dejs-sheet
  =,  dejs:format
  |=  jon=json
  ^-  sheet
  ((ar (ar so)) jon)
++  enjs-sheet
  |=  shet=sheet
  ^-  json
  :-  %a  (turn shet enjs-row)
++  enjs-row
  |=  ro=row
  ^-  json
  :-  %a  (turn ro enjs-scell)
++  enjs-scell
  |=  cel=scell
  ^-  json
  :-  %s  cel
--