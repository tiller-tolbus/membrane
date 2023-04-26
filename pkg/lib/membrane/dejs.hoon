/+  *membrane
=,  dejs:format :: overwrites cell:membrane with cell from hoon.hoon
!:
|%
:: Helper core 
++  visual-ops
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
      [%tags dejs-tags]
      [%row-meta dejs-row-meta]
      [%column-meta dejs-column-meta]
      [%row-count dejs-row-count]
      [%column-count dejs-column-count]
      [%last-modified di]
  ==
++  dejs-id
  |=  jon=json
  ^-  @uw
  ((se %uw) jon)
++  dejs-path
  |=  jon=json
  ^-  path
  (wrap-path (stab (so jon)))
++  dejs-title
  |=  jon=json
  ^-  @t
  (so jon)
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
++  dejs-sheet-data
  |=  jon=json
  ^-  (map address ^cell)
  %-  molt
  ((ar (at ~[dejs-address dejs-cell])) jon)
++  dejs-address
  |=  jon=json
  ^-  address
  ((at ~[ni ni]) jon)
++  dejs-cell
  |=  jon=json
  ^-  ^cell
  %.  jon
  %-  ot
  :~  meta+dejs-cell-meta
      data+dejs-cell-data
  ==
++  dejs-cell-meta
  |=  jon=json
  ^-  cell-meta
  %-  silt
  %.  jon
  %-  ar
  (of visual-ops)
++  dejs-cell-data
  |=  jon=json
  ^-  cell-data
  ((ot ~[input+so output+so]) jon)
--