/-  *membrane
=,  dejs:format
!:
::  Type core
|%
++  dejs-sheet
  |=  jon=json
  ^-  sheet
  %.  jon
  %-  ot
  :~  meta+dejs-sheet-meta  
  data+dejs-sheet-data
  ==
++  dejs-sheet-meta
  |=  jon=json
  ^-  sheet-meta
  %.  jon
  %-  ot
  :~  [%id dejs-id]
  [%title dejs-title]
  [%owner dejs-owner]
  [%tags dejs-tags]
  [%row-meta dejs-row-meta]
  [%column-meta dejs-column-meta]
  [%row-count dejs-row-count]
  [%column-count dejs-column-count]
  [%whitelist dejs-whitelist]
  [%last-modified dejs-date]
  ==
++  dejs-id
  |=  jon=json
  ^-  @uw
  ((se %uw) jon)
++  dejs-title
  |=  jon=json
  ^-  path
  ((ar so) jon)
++  dejs-owner
  |=  jon=json
  ^-  @p
  ((se %p) jon)
++  dejs-tags
  |=  jon=json
  ^-  (set tag)
  ((as so) jon)
++  dejs-row-meta
  |=  jon=json
  ^-  (map @ud (set row-visual))
  %-  molt
  ((ar (at ~[ni dejs-row-visual])) jon)
++  dejs-row-visual
  |=  jon=json
  ^-  (set row-visual)
  %-  silt
  %.  jon
  %-  of
  %-  ar
  :~  [%bold bo]
  [%italic bo]
  [%underline bo]
  [%monospace bo]
  [%strikethrough bo]
  [%foreground sa]
  [%background sa]
  [%size ni]
  [%font sa]
  [%height ni]
  ==
++  dejs-column-meta
  |=  jon=json
  ^-  (map @ud (set column-visual))
  %-  molt
  ((ar (at ~[ni dejs-column-visual])) jon)
++  dejs-column-visual
  |=  jon=json
  ^-  (set column-visual)
  %.  jon
  %-  ar
  %-  of
  :~  [%bold bo]
  [%italic bo]
  [%underline bo]
  [%monospace bo]
  [%strikethrough bo]
  [%foreground sa]
  [%background sa]
  [%size ni]
  [%font sa]
  [%width ni] 
  ==
++  dejs-row-count
  |=  jon=json
  ^-  @ud
  (ni jon)
++  dejs-column-count
  |=  jon=json
  ^-  @ud
  (ni jon)
++  dejs-whitelist
  |=  jon=json
  ^-  whitelist
  %-  molt
  ((ar (at ~[(se %p) dejs-access])) jon)
++  dejs-access
  |=  jon=json
  ^-  access
  =/  acc  (so jon)
  ?>  ?=(access acc)
  acc
++  dejs-date
  |=  jon=json
  ^-  @da
  (di jon)
++  dejs-sheet-data
  |=  jon=json
  ^-  (map address scell)
  %-  molt
  ((ar (at ~[dejs-address dejs-scell])) jon)
++  dejs-address
  |=  jon=json
  ^-  address
  ((at ~[ni ni]) jon)
++  dejs-scell
  |=  jon=json
  ^-  scell
  %.  jon
  %-  at
  :~  dejs-sell-meta
  dejs-sell-data
++  dejs-scell-meta
  |=  jon=json
  ^-  scell-meta
  %-  silt
  %.  jon
  %-  ar
  %-  of
  :~  [%bold bo]
  [%italic bo]
  [%underline bo]
  [%monospace bo]
  [%strikethrough bo]
  [%foreground sa]
  [%background sa]
  [%size ni]
  [%font sa]
  ==
++  dejs-scell-data
  |=  jon=json
  ^-  scell-data
  ((ot ~[input+so output+so]) jon)
--