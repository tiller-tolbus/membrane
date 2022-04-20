:: Imports
::
/-  *cell
/+  default-agent, dbug
:: Type core
::
|%
+$  state-0  sheet
+$  card  card:agent:gall
--
:: Gall agent boilerplate
::
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %) bowl)
:: Agent arms (10) (mandatory)
::
:: default on-init returns [~ this]
:: send no cards (~)
:: initialize state with the agent core (this)
::
++  on-init  on-init:def
:: on-save exports state to vase for Gall for upgrade
:: this is a demo so probably this will never be used, but just in case
::
++  on-save
  ^-  vase
  !>(state)
:: on-load imports state post-upgrade
:: probably won't use this either
:: 
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  `this(state !<(versioned-state old-vase))
::