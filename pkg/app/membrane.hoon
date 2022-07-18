::  Imports
::
::  todo: take out tars and call the libs names
/-  *membrane-sheet
/-  *membrane-action
/-  *membrane-share
/-  *membrane-config
/+  *membrane-utils
/+  default-agent, dbug, agentio
::  Type core
::
|%
+$  state-0
  $:
    files=(map path sheet)
    =inbox
    =outbox
    =config
  ==
+$  card  card:agent:gall
--
::  Gall agent boilerplate
::
%-  agent:dbug
=|  state-0
=*  state  -
::  temporary filesystem (pre-clay)
=*  files  files.state
=*  inbox  inbox.state
=*  outbox  outbox.state
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %) bowl)
    io  ~(. agentio bowl)
::  Agent arms (10) (mandatory)
::
++  on-init  on-init:def
::  on-save exports state to vase for Gall for upgrade
::  this is a demo so probably this will never be used, but just in case
::
++  on-save
  ^-  vase
  !>(state)
::  on-load imports state post-upgrade
::  probably won't use this either
:: 
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  `this(state !<(state-0 old-vase))
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ::  branch on mark first
  ?+  mark  (on-poke:def mark vase)
    %membrane-action
    ::  only accept edit actions from our ship
    ::  (we probably will change this in the future)
    ?>  =(our.bowl src.bowl)
    =/  act  !<(action vase)
    ?-  -.act
      %replace
        =/  pax=path  +<.act
        `this(files (~(put by files) pax +>.act))
      %create
        =/  pax=path  +<.act
        =/  tit=@t  +>.act
        `this(files (~(put by files) pax (create-sheet pax tit bowl)))
      %rename
        =/  pax=path  +<.act
        =/  tit=@t  +>.act
        `this(files (~(jab by files) pax (rename-gate tit)))
      %retag
        =/  pax=path  +<.act
        =/  tags=(set tag)  +>.act
        `this(files (~(jab by files) pax (retag-gate tags)))
      %delete
        =/  pax=path  +.act
        `this(files (~(del by files) pax))
      %move
        =/  opax=path  +<.act
        =/  npax=path  +>.act
        `this(files (move-sheet files opax npax))
    ==
    %membrane-message
    ::  handle sharing events across the network
    =/  msg  !<(message vase)
    ?-  -.msg
      ::  handle initial invitations
      ::  puts invitation into the inbox
      ::  a notification might be appropriate here
      %invite
        =/  =appeal  +.msg
        =/  =invitation  (process-appeal appeal src.bowl now.bowl)
        `this(inbox (~(put by inbox) id.appeal invitation))
      ::  handle an accepted invite
      %rsvp
        =/  id=@uw  +.msg
        =/  uinv=(unit invitation)  (~(get by outbox) id)
        ?~  uinv
          ::  insert proper error message here
          (on-poke:def mark vase)
        =/  inv=invitation  u.uinv
        ?>  !=(why.inv %received)
        ?>  =(who.inv src.bowl)
        =/  uwhat=(unit sheet)  (~(get by files) where.inv)
        ?~   uwhat
          ::  insert proper error message here
          (on-poke:def mark vase)
        =/  what=sheet  u.uwhat
        =/  =dock  [who.inv %membrane]
        =/  =cage  [%membrane-message !>([%package what])]
        :-  ~[(~(poke pass:io /membrane/rsvp) dock cage)]
          this(outbox (~(jab by outbox) id.inv (mark-status %sent)))
      ::  handle an incoming sheet
      %package
        =/  id=@uw  +<.msg
        =/  what=sheet  +>.msg
        ::  authenticate package
        =/  uinv=(unit invitation)  (~(get by inbox) id)
        ?~  uinv
          ::  insert proper error message here
          (on-poke:def mark vase)
        =/  inv=invitation  u.uinv
        ?>  =(why.inv %granted)
        ::  save sheet and mark invitation as received
        :-  ~
        %=  this
          inbox  (~(jab by inbox) id (mark-status %received))
          files  (~(put by files) where.inv what)
        ==
      ==
    ==
::  We are not accepting subscriptions at this time.
::
++  on-watch  on-watch:def
++  on-agent  on-agent:def
++  on-leave  on-leave:def
::
++  on-peek
  |=  pax=path
  ^-  (unit (unit cage))
  ?.  ?=([%x @ *] pax)
    ~
  ?+  i.t.pax  (on-peek:def pax)
    %retrieve
      =/  rsv=sheet  (~(got by files) t.t.pax)
      :^  ~  ~  %sheet
        !>(rsv)
    %tree
      =/  pat=path  t.t.pax
      =/  keys=(list path)
        (filter-tree pat ~(tap in ~(key by files)))
      :^  ~  ~  %membrane-tree
        !>(keys)
    %metatree
      =/  pat=path  t.t.pax
      =/  keys=(list path)
        (filter-tree pat ~(tap in ~(key by files)))
      =/  rsv=(map path sheet-meta)
        (tree-to-metatree files keys)
      :^  ~  ~  %membrane-metatree
        !>(rsv)
    ==
::  We will not be accepting calls from Arvo at this time
::
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
