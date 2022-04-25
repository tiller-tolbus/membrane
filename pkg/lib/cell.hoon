/-  *cell
!:
|%
::  Type core
+$  json-sheet  $:(%a (list json-row))
+$  json-row  $:(%a (list json-cell))
+$  json-cell  $:(%s @t)
--
|%
::  Quite likely we can do the whole thing with something like:
::  ((ar (ar so)) jon)
++  dejs-sheet
  |=  jon=json-sheet
  ^-  sheet
  ::  input should have the format [%a p=(list row)]
  (turn +:jon dejs-row)
++  dejs-row
  |=  jon=json-row
  ^-  row
  ::  input should have the format [%a p=(list scell)]
  (turn +:jon dejs-scell)
++  dejs-scell
  |=  jon=json-cell
  ^-  scell
  ::  input should have the format [%s p=@t]
  (so:dejs:format jon)
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