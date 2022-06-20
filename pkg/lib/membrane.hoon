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
  %-  ot
  :~  meta+dejs-sheet-meta
  data+dejs-sheet-data
  ==
++  dejs-sheet-meta
  =,  dejs:format
  |=  jon=json
  ^-  sheet-meta
  %-  ot
  :_  jon
  :~  [%id dejs-id]
  [%title dejs-title]
  [%owner dejs-owner]
  [%tags dejs-tags]
  [%row-meta dejs-row-meta]
  [%column-meta dejs-column-meta]
  [%whitelist dejs-whitelist]
  [%last-modified dejs-date]
  [%row-count dejs-num]
  [%column-count dejs-num]
  ==
++  dejs-id
  =,  dejs:format
  |=  jon=json
  ^-  @uw
  ((se %uw) jon)
--