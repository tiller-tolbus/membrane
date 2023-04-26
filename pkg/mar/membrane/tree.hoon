/+  *membrane-enjs
|_  tree=(list ^path)
++  grow
  |%
  ++  noun  tree
  ++  json
    ^-  ^json
    :-  %a
    ^-  (list ^json)
    %-  turn
    :-  tree  enjs-path
  --
++  grab
  |%
  ++  noun  (list ^path)
  --
++  grad  %noun
--