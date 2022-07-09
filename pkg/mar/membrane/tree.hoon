=,  enjs:format
|_  tree=(set ^path)
++  grow
  |%
  ++  noun  tree
  ++  json
    ^-  ^json
    :-  %a
    ^-  (list ^json)
    %-  turn
    :_  path
    ~(tap in tree)
  --
++  grab
  |%
  ++  noun  ^-((set ^path) tree)
  --
++  grad  %noun
  --