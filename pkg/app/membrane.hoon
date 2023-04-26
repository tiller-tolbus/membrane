/-  *membrane
/+  *membrane
/+  default-agent, dbug, agentio
:: import to force compilation during development
::
/=  a-  /mar/membrane/action
/=  c-  /mar/membrane/comms
/=  g-  /mar/membrane/message
/=  m-  /mar/membrane/metatree
/=  t-  /mar/membrane/tree
/=  s-  /mar/sheet
|%
+$  state-0
  $:  files=(map path sheet)
      =inbox
      =outbox
      =config
  ==
+$  card  card:agent:gall
--
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
::
++  on-init  on-init:def
++  on-save  !>(state)
:: 
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  `this(state !<(state-0 old-vase))
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:def mark vase)
      %membrane-action
    ?>  =(our src):bowl
    =/  act  !<(action vase)
    ?-    -.act
        %write
      =/  new=sheet
        (update-time what.act now.bowl)
      :_(this [(mut-card where.act new)]~)
      ::
        %create
      =/  new=sheet
        (create-sheet where.act what.act bowl)
      :_(this [(ins-card where.act new)]~)
      ::
        %rename
      =/  new=sheet  .^(sheet %cx (weld prefix where.act))
      =.  new  (update-time new(title.meta what.act) now.bowl)
      :_(this [(mut-card where.act new)]~)
      ::
        %retag
      =/  new=sheet  .^(sheet %cx (weld prefix where.act))
      =.  new  (update-time new(tags.meta what.act) now.bowl)
      :_(this [(mut-card where.act new)]~)
      ::
      %delete  :_(this [(del-card where.act)]~)
      ::
        %move
      =/  new=sheet  .^(sheet %cx (weld prefix opax.act))
      =.  new  (update-time new(path.meta npax.act) now.bowl)
      :_(this [(move-card opax.act npax.act new)]~)
      ::
        %send-invite
      =/  what=sheet  .^(sheet %cx (weld prefix where.act))
      =/  =id  (create-id eny.bowl)
      =/  appl=appeal  [id title.meta.what where.act]
      =/  =dock  [who.act %membrane]
      =/  =cage  [%membrane-message !>(`message`[%invite appl])]
      :-  ~[(~(poke pass:io /invite/(scot %uw id)) dock cage)]
      this(outbox (~(put by outbox) id (process-appeal-out appl who.act now.bowl)))
      ::
        %send-rsvp
      =/  inv=invitation  (~(got by inbox) id.act)
      =/  =dock  [who.inv %membrane]
      =/  =cage  [%membrane-message !>(`message`[%rsvp id.act])]
      :-  ~[(~(poke pass:io /rsvp/(scot %uw id.act)) dock cage)]
      this(inbox (~(jab by inbox) id.act (mark-status %accepted)))
      ::
        %cancel-invite
      =/  inv=invitation  (~(got by outbox) id.act)
      =/  =dock  [who.inv %membrane]
      =/  =cage  [%membrane-message !>(`message`[%cancel id.act])]
      :-  ~[(~(poke pass:io /cancel/(scot %uw id.act)) dock cage)]
      this(outbox (~(jab by outbox) id.act (mark-status %canceled)))
      ::
        %decline-invite
      =/  inv=invitation  (~(got by inbox) id.act)
      =/  =dock  [who.inv %membrane]
      =/  =cage  [%membrane-message !>(`message`[%decline id.act])]
      :-  ~[(~(poke pass:io /decline/(scot %uw id.act)) dock cage)]
      this(inbox (~(jab by inbox) id.act (mark-status %declined)))
    ==
    ::
      %membrane-message
    ::  handle sharing events across the network
    =/  msg  !<(message vase)
    ?-    -.msg
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
      ?~  uinv  !!  :: TODO: add error message
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
      ?~  uinv  !!  :: TODO: add error message
      =/  inv=invitation  u.uinv
      ?>  =(why.inv %accepted)
      ::  save sheet and mark invitation as received
      :-  [(ins-card where.inv s.msg)]~
      this(inbox (~(jab by inbox) id.msg (mark-status %received)))
      ::  handle case where sender cancels an invite to our ship
      %cancel   `this(inbox (~(jab by inbox) id.msg (mark-status %canceled)))
      ::  handle case where receiver declines an invite from our ship
      %decline  `this(outbox (~(jab by outbox) id.msg (mark-status %declined)))
    ==
  ==
::
++  on-watch  on-watch:def
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ::  wires should be two atoms, action and id
  ?>  ?=([@ @ ~] wire)
  ?+    -.sign  (on-agent:def wire sign)
      %poke-ack
    ?^  p.sign  (on-agent:def wire sign)
    =/  =id  (slav %uw +<.wire)
    ::  synchronize status across ships (delivery receipts basically)
    ?+  -.wire  (on-agent:def wire sign)
      %invite   `this(outbox (~(jab by outbox) id (mark-status %waiting)))
      %rsvp     `this(inbox (~(jab by inbox) id (mark-status %accepted)))
      %package  `this(outbox (~(jab by outbox) id (mark-status %received)))
    ==
  ==
::
++  on-leave  on-leave:def
::
++  on-peek
  |=  pax=path
  ^-  (unit (unit cage))
  ?+    pax  (on-peek:def pax)
    [%x %comms *]  ``membrane-comms+!>([inbox outbox])
    ::
      [%x %read *] :: path: "/read/path/to/file"
    =;  =sheet  ``sheet+!>(sheet)
    .^(sheet %cx (weld prefix (wrap-path t.t.pax)))
    ::
      [%x %tree *] :: path: "/tree/path/to/dir"
    ::  if path is just "/tree", returns all valid paths
    =;  tree=(list path)  ``membrane-tree+!>(tree)
    .^((list path) %ct (zing ~[prefix /sheets t.t.pax]))
    ::
      [%x %metatree *] :: path: "/metatree/path/to/dir"
    ::  if path is just "/metatree", returns all valid paths
    =/  tree=(list path)
      .^((list path) %ct (zing ~[prefix /sheets t.t.pax]))
    ``membrane-metatree+!>((tree-to-metatree tree prefix))
  ==
::
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
