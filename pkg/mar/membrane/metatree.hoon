/-  *membrane-sheet
/+  *membrane-enjs
|_  mtr=(map ^path sheet-meta)
++  grow
  |%
  ++  noun  mtr
  ++  json
    ^-  ^json
    %-  pairs
    ^-  (list [@t ^json])
    %-  turn  
    :-  ~(tap by mtr)
      |=  [=^path meta=sheet-meta]
      :-  (spat path)
        (enjs-sheet-meta meta)
  --
++  grab
  |%
  ++  noun  ^-((map ^path sheet-meta) mtr)
  --
++  grad  %noun
  --