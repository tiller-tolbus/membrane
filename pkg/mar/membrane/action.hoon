/-  *membrane-sheet
/-  *membrane-action
/+  *membrane-dejs
/+  *membrane-enjs
|_  act=action
++  grow
  |%
  ++  noun  act
  ++  json  (of ~[%replace dejs-sheet])
  --
++  grab
  |%
  ++  noun  ^-(action act)
  ++  json  (frond:enjs:format %replace (enjs-sheet +.action))
  --
++  grad  %noun  --