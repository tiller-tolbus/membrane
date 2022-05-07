::  Imports
::
/-  *cell
/+  default-agent, dbug
::  Type core
::
|%
+$  state-0  sheet
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
::  Agent arms (10) (mandatory)
::
::  default on-init returns [~ this]
::  send no cards (~)
::  initialize state with the agent core (this)
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
::  on-poke handles pokes
::  we will handle one poke which sends the entire state
::  which we accept and use as our new state
::  (if it comes from our ship)
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ::  assert request came from our ship
  ?>  =(our.bowl src.bowl)
  ::  we use %sheet mark for demo
  ::  crash if other mark is used
  ::  later we will specify marks for different actions
  ?+  mark  (on-poke:def mark vase)
    %sheet
  ::  vase should contain an entire spreadsheet
  =/  new-sheet  !<(sheet vase)
  `this(state new-sheet)
  ==
::  We are not accepting subscriptions at this time.
::
++  on-watch  on-watch:def
++  on-agent  on-agent:def
++  on-leave  on-leave:def
::  We accept one kind of scry, [%x %pull ~]
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+  path  (on-peek:def path)
    [%x %pull ~]
  ``sheet+!>(state)
  ==
::  We will not be accepting calls from Arvo at this time
::
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--