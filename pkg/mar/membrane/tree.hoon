=,  enjs:format
|_  tree=(list ^path)
++  grow
  |%
  ++  noun  tree
  ++  json
    ^-  ^json
    :-  %a
    ^-  (list ^json)
    %-  turn
    :-  tree  path
  --
++  grab
  |%
  ++  noun  ^-((list ^path) tree)
  --
++  grad  %noun
  --