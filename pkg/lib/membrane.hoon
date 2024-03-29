/-  *membrane
|%
::  editing utilities
::  mostly for temp filesystem
::  and therefore soon to be irrelevant
::
++  create-id  |=(eny=@uvJ `id`(cut 0 [0 32] eny))
::
++  create-sheet
  |=  [pax=path tit=@t =bowl:gall]
  ^-  sheet
  =/  =id  (create-id eny.bowl)
  [[id pax tit ~ ~ ~ 100 26 now:bowl] ~]
::
++  filter-tree
  ::  get a tree of valid paths under a dir path
  |=  [dir=path tree=(list path)]
  ^-  (list path)
  ::  if dir is null, return whole tree (treat null as root)
  ?~  dir  tree
  ::  otherwise loop over the tree and filter paths
  =|  filt=(list path)
  |-
  ?~  tree
    filt
  %=  $
    tree  t.tree
    filt  (filter-path i.tree dir filt)
  ==
::
++  filter-path
  ::  add pax to filt if in dir
  |=  [pax=path dir=path filt=(list path)]
  ?.  =((find dir pax) [~ 0])
    filt
  :-  pax  filt
::
++  rename-sheet
  ::  change the title of sheet 
  |=  [trgt=sheet tit=@t]
  ^-  sheet
  trgt(title.meta tit)
::
++  rename-gate
  ::  rename sheet, as a gate (for jab)
  |=  tit=@t
  ^-  $-(sheet sheet)
  |=  trgt=sheet
  ^-  sheet
  trgt(title.meta tit)
::
++  retag-gate
  ::  retag sheet, as a gate
  |=  tags=(set tag)
  ^-  $-(sheet sheet)
  |=  trgt=sheet
  ^-  sheet
  trgt(tags.meta tags)
::
++  move-sheet
  ::  remove a sheet and add with a different path
  |=  [max=(map path sheet) opax=path npax=path]
  ^-  (map path sheet)
  =/  sht=sheet  (~(got by max) opax)
  =/  rm=(map path sheet)  (~(del by max) opax)
  %-  ~(put by rm)
  :-  npax
  sht(path.meta npax)
::
++  tree-to-metatree
  ::  get just metadata for every path in tree
  |=  [tree=(list path) prefix=path]
  ^-  (map path sheet-meta)
  %-  molt
  %-  turn
  :-  tree
    |=  pax=path
    ^-  [path sheet-meta]
    :-  pax
    =<  meta
    ^-  sheet
    .^(sheet %cx (weld prefix pax))
::
++  update-time
  |=  [what=sheet when=@da]
  ^-  sheet
  what(last-modified.meta when)
::  sharing utilities
::
++  process-appeal
  ::  turn an appeal into an invitation
  |=  [=appeal who=@p when=@da]
  ^-  invitation
  [who what.appeal when where.appeal %waiting]
::
++  process-appeal-out
  |=  [=appeal who=@p when=@da]
  ^-  invitation
  [who what.appeal when where.appeal %invited]
::
++  mark-status
  ::  mark an invitation as %waiting, %granted, %sent, or %received
  |=  stat=status
  ^-  $-(invitation invitation)
  |=  inv=invitation
  ^-  invitation
  inv(why stat)
::  clay utils
::
++  base-card
  |=  =soba:clay
  ^-  card:agent:gall
  [%pass /membrane/info %arvo %c %info %membrane %& soba]
::
++  ins-card
  |=  [=path =sheet]
  ^-  card:agent:gall
  (base-card `soba:clay`[path `miso:clay`[%ins %sheet !>(sheet)]]~)
::
++  mut-card
  |=  [=path =sheet]
  ^-  card:agent:gall
  (base-card `soba:clay`[path `miso:clay`[%mut %sheet !>(sheet)]]~)
::
++  del-card
  |=  =path
  ^-  card:agent:gall
  (base-card `soba:clay`[path `miso:clay`[%del ~]]~)
::
++  move-card
  |=  [opax=path npax=path =sheet]
  ^-  card:agent:gall
  %-  base-card
  ^-  soba:clay
  :~  [npax `miso:clay`[%ins %sheet !>(sheet)]]
      [opax `miso:clay`[%del ~]]
  ==
::
++  wrap-path  
  ::  transform naive path into full clay path
  ::  add ship, desk, timestamp, and mark
  |=  pax=path
  ^-  path
  (zing ~[/sheets pax /sheet])
::
++  unwrap-path
  ::  transform clay path back into naive path
  |=  pax=path
  ^-  path
  (snip (tail pax))
--