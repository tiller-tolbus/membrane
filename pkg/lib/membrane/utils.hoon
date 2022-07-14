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
  --
