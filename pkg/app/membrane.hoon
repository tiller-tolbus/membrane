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
      %write
        :_  this
        [(mut-card where.act (update what.act now.bowl)]~
      %create
        :_  this
        [(ins-card where.act (create-sheet where.act what.act bowl)]~
      %rename
        =/  sht=sheet  ^.(sheet %cx (meld /=membrane=/sheets/ where.act))
        :_  this
        [(mut-card where.act (update sht(title.meta what.act) now.bowl)]~
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
      %send-invite
        =/  who=@p  +<.act
        =/  pax=path  +>.act
        =/  what=sheet  (~(got by files) pax)
        =/  id=@uw  (create-id eny.bowl)
        =/  appl=appeal  [id title.meta.what pax]
        =/  =dock  [who %membrane]
        =/  =cage  [%membrane-message !>(`message`[%invite appl])]
        :-  ~[(~(poke pass:io /invite/(scot %uw id)) dock cage)]
        this(outbox (~(put by outbox) id (process-appeal-out appl who now.bowl)))
      %send-rsvp
        =/  id=@uw  +.act
        =/  inv=invitation  (~(got by inbox) id)
        =/  who=@p  who.inv 
        =/  =dock  [who %membrane]
        =/  =cage  [%membrane-message !>(`message`[%rsvp id])]
        :-  ~[(~(poke pass:io /rsvp/(scot %uw id)) dock cage)]
        this(inbox (~(put by inbox) id inv(why %accepted)))
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
        =/  =cage  [%membrane-message !>(`message`[%package id what])]
        :-  ~[(~(poke pass:io /package/(scot %uw id)) dock cage)]
          this(outbox (~(jab by outbox) id (mark-status %sent)))
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
        ?>  =(why.inv %accepted)
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
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ::  wires should be two atoms, action and id
  ?>  ?=([@ @ ~] wire)
  ?+  -.sign  (on-agent:def wire sign)
    %poke-ack
      ?~  p.sign
        =/  id=@uw  (slav %uw +<.wire)
        ::  synchronize status across ships (read receipts basically)
        ?+  -.wire  (on-agent:def wire sign)
          %invite
            `this(outbox (~(jab by outbox) id (mark-status %waiting)))
          %rsvp
            `this(inbox (~(jab by inbox) id (mark-status %accepted)))
          %package
            `this(outbox (~(jab by outbox) id (mark-status %received)))
          ==
      ::  better error handling may eventually be necessary here
      (on-agent:def wire sign)
    ==
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
    %comms
      =/  comms=[^inbox ^outbox]  [inbox outbox]
      :^  ~  ~  %membrane-comms
        !>(comms)
    ==
::  We will not be accepting calls from Arvo at this time
::
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
