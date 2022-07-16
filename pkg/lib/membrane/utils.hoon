/-  *membrane-sheet
|%
++  create-sheet
  |=  [pax=path tit=@t =bowl:gall]
  ^-  sheet
  ::  meta
  :-  ^-  sheet-meta
  :*
    ::  id
    ^-  @uw  (cut 0 [0 32] eny:bowl)
    ::  path
    ^-  path  pax
    ::  title
    ^-  @t  tit
    ::  owner
    ^-  @p  our.bowl
    ::  tags
    ^-  (set tag)  ~
    ::  row-meta
    ^-  (map @ud (set visual))  ~
    ::  column-meta
    ^-  (map @ud (set visual))  ~
    ::  row-count
    ^-  @ud  100
    ::  column-count
    ^-  @ud  26
    ::  whitelist
    ^-  whitelist  ~
    ::  last-modified
    ^-  @da  now:bowl
  ==
  ::  data
  ^-  (map address scell)  ~
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
++  filter-path
  ::  add pax to filt if in dir
  |=  [pax=path dir=path filt=(list path)]
  ?.  =((find dir pax) [~ 0])
    filt
  :-  pax  filt
++  rename-sheet
  ::  change the title of sheet 
  |=  [trgt=sheet tit=@t]
  ^-  sheet
  trgt(title.meta tit)
++  rename-gate
  ::  rename sheet, as a gate (for jab)
  |=  tit=@t
  ^-  $-(sheet sheet)
  |=  trgt=sheet
  ^-  sheet
  trgt(title.meta tit)
++  retag-gate
  ::  retag sheet, as a gate
  |=  tags=(set tag)
  ^-  $-(sheet sheet)
  |=  trgt=sheet
  ^-  sheet
  trgt(tags.meta tags)
++  move-sheet
  ::  remove a sheet and add with a different path
  |=  [max=(map path sheet) opax=path npax=path]
  ^-  (map path sheet)
  =/  sht=sheet  (~(got by max) opax)
  =/  rm=(map path sheet)  (~(del by max) opax)
  %-  ~(put by rm)
  :-  npax
  sht(path.meta npax)
++  tree-to-metatree
  ::  get just metadata for every path in tree
  |=  [max=(map path sheet) tree=(list path)]
  ^-  (map path sheet-meta)
  %-  molt
  %-  turn
  :-  tree
    |=  pax=path
    ^-  [path sheet-meta]
    :-  pax
    =<  meta
    ^-  sheet
    (~(got by max) pax)
--

