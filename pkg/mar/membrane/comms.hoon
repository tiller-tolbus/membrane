/-  *membrane-share
/+  *membrane-enjs
|_  coms=[inb=inbox out=outbox]
++  grow
  |%
  ++  noun  coms
  ++  json
    ^-  ^json
    %-  pairs
    ^-  (list [@t ^json])
    :~  [%inbox (enjs-inbox inb.coms)]
      [%outbox (enjs-inbox out.coms)]
    ==
    ++  enjs-inbox
      |=  box=inbox
      ^-  ^json
      %-  pairs
      ^-  (list [@t ^json])
      %-  turn
      :-  ~(tap by box)
        |=  [id=@uw inv=invitation]
        ^-  [@t ^json]
        :-  (scot %uw id)
        (enjs-invitation inv)
    ++  enjs-invitation
      |=  inv=invitation
      ^-  ^json
      %-  pairs
      ^-  (list [@t ^json])
      :~  [%who (tape (scow %p who.inv))]
        [%what (tape (trip what.inv))]
        [%when (time when.inv)]
        [%where (path where.inv)]
        [%why (tape (trip why.inv))]
        ==
    --
++  grab
  |%
  ++  noun  [inbox outbox]
  --
++  grad  %noun
--