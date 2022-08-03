/-  *membrane-sheet
/+  *membrane-enjs
/+  *membrane-utils
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
      :-  (spat (unwrap-path path))
        (enjs-sheet-meta meta)
  --
++  grab
  |%
  ++  noun  (map ^path sheet-meta)
  --
++  grad  %noun
  --