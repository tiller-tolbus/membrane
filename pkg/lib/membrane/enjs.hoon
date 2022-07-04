/-  *membrane
=,  enjs:format
!:
|%
++  enjs-sheet
  |=  =sheet
  ^-  json
  %-  pairs
  ^-  (list [@t json])
  :~  [%meta (enjs-sheet-meta meta:sheet)]
    [%data (enjs-sheet-data data:sheet)]
  ==
++  enjs-sheet-meta
  |=  meta=sheet-meta
  ^-  json
  %-  pairs
  ^-  (list [@t json])
  :~  [%id (enjs-id id:meta)]
    [%path (enjs-path path:meta)]
    [%title (enjs-title title:meta)]
    [%owner (enjs-owner owner:meta)]
    [%tags (enjs-tags tags:meta)]
    [%row-meta (enjs-map-meta row-meta:meta)]
    [%column-meta (enjs-map-meta column-meta:meta)]
    [%row-count (numb row-count:meta)]
    [%column-count (numb column-count:meta)]
    [%whitelist (enjs-whitelist whitelist:meta)]
    [%last-modified (time last-modified:meta)]
  ==
++  enjs-id
  |=  id=@uw
  ^-  json
  (tape (scow %uw id))
++  enjs-path
  |=  path=^path
  ^-  json
  (tape (spud path))
++  enjs-title
  |=  title=@t
  ^-  json
  (tape (trip title))
++  enjs-owner
  |=  owner=@p
  ^-  json
  (tape (scow %p owner))
++  enjs-tags
  |=  tags=(set tag)
  ^-  json
  :-  %a
  ^-  (list json)
  %-  turn
  :_  (cork trip tape)
    ~(tap in tags)
++  enjs-map-meta
  |=  meta=(map @ud (set visual))
  ^-  json
  :-  %a
  ^-  (list json)
  %-  turn
  :-  ~(tap by meta)
    |=  duo=[@ud (set visual)]
    ^-  json
    :-  %a
    ^-  (list json)
    :~  (numb -.duo)
      (enjs-set-visual +.duo)
    ==
++  enjs-set-visual
  |=  sev=(set visual)
  ^-  json
  :-  %a
  ^-  (list json)
  %-  turn
  :_  enjs-visual
    ~(tap in sev)
++  enjs-visual
  |=  =visual
  ^-  json
  %-  frond
  :-  -.visual
  ?-  -.visual
    $?  %bold
      %italic
      %underline
      %monospace
      %strikethrough
    ==
      [%b +.visual]
    $?  %foreground
      %background
      %font
    ==
      (tape +.visual)
    $?  %size
      %height
      %width
    ==
      (numb +.visual)
  ==
++  enjs-whitelist 
  |=  =whitelist
  ^-  json
  :-  %a
  ^-  (list json)
  %-  turn
  :-  ~(tap by whitelist)
    |=  duo=[@p access]
    ^-  json
    :-  %a
    ^-  (list json)
    :~  (tape (scow %p -.duo))
      (tape (trip +.duo))
    ==
++  enjs-sheet-data
  |=  data=(map address scell)
  ^-  json
  :-  %a
  ^-  (list json)
  %-  turn
  :-  ~(tap by data)
    |=  duo=[address scell]
    ^-  json
    :-  %a
    ^-  (list json)
    :~  (enjs-address -.duo)
      (enjs-scell +.duo)
    ==
++  enjs-address
  |=  =address
  ^-  json
  :-  %a
  ^-  (list json)
  :~  (numb -.address)
    (numb +.address)
  ==
++  enjs-scell
  |=  =scell
  ^-  json
  %-  pairs
  ^-  (list [@t json])
  :~  [%meta (enjs-set-visual meta:scell)]
    [%data (enjs-scell-data data:scell)]
  ==
++  enjs-scell-data
  |=  data=scell-data
  ^-  json
  %-  pairs
  ^-  (list [@t json])
  :~  [%input (tape (trip input:data))]
    [%output (tape (trip input:data))]
  ==
--