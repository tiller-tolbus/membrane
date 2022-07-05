/-  *membrane
=,  dejs:format
!:
|%
:: Helper core 
++  visual-ops
  :~
    [%bold bo]
    [%italic bo]
    [%underline bo]
    [%monospace bo]
    [%strikethrough bo]
    [%foreground sa]
    [%background sa]
    [%size ni]
    [%font sa]
    [%height ni]
    [%width ni]
  ==
--
::  DeJS core
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
    [%path dejs-path]
    [%title dejs-title]
    [%owner dejs-owner]
    [%tags dejs-tags]
    [%row-meta dejs-row-meta]
    [%column-meta dejs-column-meta]
    [%row-count dejs-row-count]
    [%column-count dejs-column-count]
    [%whitelist dejs-whitelist]
    [%last-modified di]
  ==
++  dejs-id
  |=  jon=json
  ^-  @uw
  ((se %uw) jon)
++  dejs-path
  |=  jon=json
  ^-  path
  (stab (so jon))
++  dejs-title
  |=  jon=json
  ^-  @t
  (so jon)
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
  ^-  (map @ud (set visual))
  %-  molt
  ((ar (at ~[ni dejs-row-visual])) jon)
++  dejs-row-visual
  |=  jon=json
  ^-  (set visual)
  %-  silt
  %.  jon
  %-  ar
  (of visual-ops)
++  dejs-column-meta
  |=  jon=json
  ^-  (map @ud (set visual))
  %-  molt
  ((ar (at ~[ni dejs-column-visual])) jon)
++  dejs-column-visual
  |=  jon=json
  ^-  (set visual)
  %-  silt
  %.  jon
  %-  ar
  (of visual-ops)    
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
  %-  ot
  :~  meta+dejs-scell-meta
    data+dejs-scell-data
  ==
++  dejs-scell-meta
  |=  jon=json
  ^-  scell-meta
  %-  silt
  %.  jon
  %-  ar
  (of visual-ops)
++  dejs-scell-data
  |=  jon=json
  ^-  scell-data
  ((ot ~[input+so output+so]) jon)
--