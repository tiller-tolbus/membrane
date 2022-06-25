/-  *membrane
=,  dejs:format
!:
|%
::  Type core
|%
++  dejs-sheet
  |=  jon=json
  ^-  sheet
  %.  jon
  %-  ot
  :~  meta+dejs-sheet-meta jon
  data+dejs-sheet-data
  ==
++  dejs-sheet-meta
  |=  jon=json
  ^-  sheet-meta
  %-  silt
  %.  jon
  %-  of
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
  ((as so) jon))
++  dejs-row-meta
  |=  jon=json
  ^-  (map @ud (set row-visual))
  %-  my
  ((ar (at ~[ni dejs-row-visual])) jon)
++  dejs-row-visual
  |=  jon=json
  ^-  (set row-visual)
  %-  silt
  %.  jon
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
  [%height ni]
  ==
++  dejs-column-meta
  |=  jon=json
  ^-  (map @ud (set column-visual))
  %-  my
  ((ar (at ~[ni dejs-column-visual])) jon)
++  dejs-column-visual
  |=  jon=json
  ^-  (set column-visual)
  %.  jon
  %-  ot
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
  %-  my
  (ar (at ~[(se %p) dejs-access]))
++  dejs-access
  |=  jon=json
  ^-  access
  (so jon)
++  dejs-date
  |=  jon=json
  ^-  @da
  (di jon)
++  dejs-sheet-data
  |=  jon=json
  ^-  (map address sell)
  %-  my
  ((ar (at ~[dejs-address dejs-sell])) jon)
++  dejs-address
  |=  jon=json
  ^-  address
  ((at ~[ni ni]) jon)
++  dejs-sell
  |=  jon=json
  ^-  sell
  ((at ~[dejs-sell-meta dejs-sell-data]) jon)
++  dejs-sell-meta
  |=  jon=json
  ^-  sell-meta
  %-  silt
  %.  jon
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
++  dejs-sell-data
  |=  jon=json
  ^-  sell-data
  ((ot ~[so so]) jon)
--