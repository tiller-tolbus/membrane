/-  *membrane-sheet
|%
++  create-sheet
  |=  [tit=@t pax=path =bowl:gall]
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
--