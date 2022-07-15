/-  *membrane-sheet
/-  *membrane-action
/+  *membrane-dejs
/+  *membrane-enjs
!:
|_  act=action
++  grow
  |%
  ++  noun  act
  --
++  grab
  |%
  ++  noun  action
  ++  json
    =,  dejs:format
    %-  of
    :~  
      [%replace (at ~[pa dejs-sheet])]
      [%create (at ~[pa so])]
      [%rename (at ~[pa so])]
      [%retag (at ~[pa (ar so)])]
    ==
  --
++  grad  %noun  
--
