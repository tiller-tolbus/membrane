::  vaporware config library
::  none of these config options do anything yet
|%
+$  config
  $:
    dark-mode=$~(%.n ?)
    ::  auto-accept invites from pals
    auto-accept=$~(%.n ?)
    ::  auto-reject invites from comets
    auto-reject=?
    blacklist=(set @p)
  ==
--