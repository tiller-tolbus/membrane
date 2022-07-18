::  Imports
::
/-  *membrane-sheet
/-  *membrane-action
/+  *membrane-utils
/+  default-agent, dbug
::  Type core
::
|%
+$  state-0  (map path sheet)
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
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ::  only accept pokes from our own ship
  ?>  =(our.bowl src.bowl)
  ::  only accept %membrane-action mark
  ?.  ?=(%membrane-action mark)
    (on-poke:def mark vase)
  =/  act  !<(action vase)
  ?-  -.act
    %replace
      =/  pax=path  +<.act
      `this(state (~(put by state) pax +>.act))
    %create
      =/  pax=path  +<.act
      =/  tit=@t  +>.act
      `this(state (~(put by state) pax (create-sheet pax tit bowl)))
    %rename
      =/  pax=path  +<.act
      =/  tit=@t  +>.act
      `this(state (~(jab by state) pax (rename-gate tit)))
    %retag
      =/  pax=path  +<.act
      =/  tags=(set tag)  +>.act
      `this(state (~(jab by state) pax (retag-gate tags)))
    %delete
      =/  pax=path  +.act
      `this(state (~(del by state) pax))
    %move
      =/  opax=path  +<.act
      =/  npax=path  +>.act
      `this(state (move-sheet state opax npax))
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
      =/  rsv=sheet  (~(got by state) t.t.pax)
      :^  ~  ~  %sheet
        !>(rsv)
    %tree
      =/  pat=path  t.t.pax
      =/  keys=(list path)
        (filter-tree pat ~(tap in ~(key by state)))
      :^  ~  ~  %membrane-tree
        !>(keys)
    %metatree
      =/  pat=path  t.t.pax
      =/  keys=(list path)
        (filter-tree pat ~(tap in ~(key by state)))
      =/  rsv=(map path sheet-meta)
        (tree-to-metatree state keys)
      :^  ~  ~  %membrane-metatree
        !>(rsv)
    ==
::  We will not be accepting calls from Arvo at this time
::
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
