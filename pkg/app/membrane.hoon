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
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %) bowl)
    io  ~(. agentio bowl)
    prefix  ~[(scot %p our.bowl) %membrane (scot %da now.bowl)]
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
        [(mut-card where.act (update-time what.act now.bowl))]~
      %create
        :_  this
        [(ins-card where.act (create-sheet where.act what.act bowl))]~
      %rename
        =/  s=sheet  .^(sheet %cx (weld prefix where.act))
        :_  this
        [(mut-card where.act (update-time s(title.meta what.act) now.bowl))]~
      %retag
        =/  s=sheet  .^(sheet %cx (weld prefix where.act))
        :_  this
        [(mut-card where.act (update-time s(tags.meta what.act) now.bowl))]~
      %delete
        :_  this
        [(del-card where.act)]~
      %move
        =/  s=sheet  .^(sheet %cx (weld prefix opax.act))
        :_  this
        :~  
          %-  move-card 
          :+  opax.act  npax.act 
          (update-time s(path.meta npax.act) now.bowl)
        ==
      %send-invite
        =/  what=sheet  .^(sheet %cx (weld prefix where.act))
        =/  id=@uw  (create-id eny.bowl)
        =/  appl=appeal  [id title.meta.what where.act]
        =/  =dock  [who.act %membrane]
        =/  =cage  [%membrane-message !>(`message`[%invite appl])]
        :-  ~[(~(poke pass:io /invite/(scot %uw id)) dock cage)]
        this(outbox (~(put by outbox) id (process-appeal-out appl who.act now.bowl)))
      %send-rsvp
        =/  inv=invitation  (~(got by inbox) id.act)
        =/  =dock  [who.inv %membrane]
        =/  =cage  [%membrane-message !>(`message`[%rsvp id.act])]
        :-  ~[(~(poke pass:io /rsvp/(scot %uw id.act)) dock cage)]
        this(inbox (~(jab by inbox) id.act (mark-status %accepted)))
      %cancel-invite
        =/  inv=invitation  (~(got by outbox) id.act)
        =/  =dock  [who.inv %membrane]
        =/  =cage  [%membrane-message !>(`message`[%cancel id.act])]
        :-  ~[(~(poke pass:io /cancel/(scot %uw id.act)) dock cage)]
        this(outbox (~(jab by outbox) id.act (mark-status %canceled)))
      %decline-invite
        =/  inv=invitation  (~(got by inbox) id.act)
        =/  =dock  [who.inv %membrane]
        =/  =cage  [%membrane-message !>(`message`[%decline id.act])]
        :-  ~[(~(poke pass:io /decline/(scot %uw id.act)) dock cage)]
        this(inbox (~(jab by inbox) id.act (mark-status %declined)))
    ==
    %membrane-message
    ::  handle sharing events across the network
    =/  msg  !<(message vase)
    ?-  -.msg
      ::  handle initial invitations
      ::  puts invitation into the inbox
      ::  a notification might be appropriate here
      %invite
        ::  crash if id already exists
        ?<  (~(has by inbox) id.a.msg)
        =/  inv=invitation  (process-appeal a.msg src.bowl now.bowl)
        `this(inbox (~(put by inbox) id.a.msg inv))
      ::  handle an accepted invite
      %rsvp
        =/  uinv=(unit invitation)  (~(get by outbox) id.msg)
        ?~  uinv
          ::  insert proper error message here
          (on-poke:def mark vase)
        =/  inv=invitation  u.uinv
        ?>  =(why.inv %waiting)
        ?>  =(who.inv src.bowl)
        =/  what=sheet  .^(sheet %cx (weld prefix where.inv))
        =/  =dock  [who.inv %membrane]
        =/  =cage  [%membrane-message !>(`message`[%package id.msg what])]
        :-  ~[(~(poke pass:io /package/(scot %uw id.msg)) dock cage)]
          this(outbox (~(jab by outbox) id.msg (mark-status %sent)))
      ::  handle an incoming sheet
      %package
        ::  authenticate package
        =/  uinv=(unit invitation)  (~(get by inbox) id.msg)
        ?~  uinv
          ::  insert proper error message here
          (on-poke:def mark vase)
        =/  inv=invitation  u.uinv
        ?>  =(why.inv %accepted)
        ::  save sheet and mark invitation as received
        :-  [(ins-card where.inv s.msg)]~
        this(inbox (~(jab by inbox) id.msg (mark-status %received)))
      ::  handle case where sender cancels an invite to our ship
      %cancel
        `this(inbox (~(jab by inbox) id.msg (mark-status %canceled)))
      ::  handle case where receiver declines an invite from our ship
      %decline
        `this(outbox (~(jab by outbox) id.msg (mark-status %declined)))
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
        ::  synchronize status across ships (delivery receipts basically)
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
    %read
      ::  path: "/read/path/to/file"
      =/  s=sheet  .^(sheet %cx (weld prefix (wrap-path t.t.pax)))
      :^  ~  ~  %sheet  !>(s)
    %tree
      ::  path: "/tree/path/to/dir"
      ::  if path is just "/tree", returns all valid paths
      =/  tree=(list path)  .^((list path) %ct (zing ~[prefix /sheets t.t.pax]))
      :^  ~  ~  %membrane-tree
        !>(tree)
    %metatree
      ::  path: "/metatree/path/to/dir"
      ::  if path is just "/metatree", returns all valid paths
      =/  tree=(list path)  .^((list path) %ct (zing ~[prefix /sheets t.t.pax]))
      =/  mt=(map path sheet-meta)  (tree-to-metatree tree prefix)
      :^  ~  ~  %membrane-metatree
        !>(mt)
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
