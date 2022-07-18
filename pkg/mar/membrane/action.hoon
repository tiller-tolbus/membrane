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
      [%retag (at ~[pa (as so)])]
      [%delete pa]
      [%move (at ~[pa pa])]
    ==
  --
++  grad  %noun  
--
