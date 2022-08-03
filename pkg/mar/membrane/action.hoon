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
      [%write (at ~[dejs-path dejs-sheet])]
      [%create (at ~[dejs-path so])]
      [%rename (at ~[dejs-path so])]
      [%retag (at ~[dejs-path (as so)])]
      [%delete dejs-path]
      [%move (at ~[dejs-path dejs-path])]
      [%send-invite (at ~[(se %p) dejs-path])]
      [%send-rsvp (se %uw)]
      [%cancel-invite (se %uw)]
      [%decline-invite (se %uw)]
    ==
  --
++  grad  %noun  
--
