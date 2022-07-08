/-  *membrane-sheet
/-  *membrane-action
/+  *membrane-dejs
/+  *membrane-enjs
!:
|_  act=action
++  grow
  |%
  ++  noun  act
  ++  json  (frond:enjs:format %replace (enjs-sheet +.act))
  --
++  grab
  |%
  ++  noun  action
  ++  json  (of:dejs:format ~[replace+dejs-sheet])
  --
++  grad  %noun  
  --