/-  *membrane-sheet
|%
::  mark for all membrane pokes from front-end client is %membrane-action
+$  action
  $%
    ::  {"write": [path, sheet]}
    [%write where=path what=sheet]
    ::  {"create": [path, title]}
    [%create where=path what=@t]
    ::  {"rename": [path, title]}
    [%rename where=path what=@t]
    ::  {"retag": [path, [tag1, tag2, tag3 ... ]]}
    [%retag path (set tag)]
    ::  {"delete": path}
    [%delete path]
    ::  {"move": [path, path]}
    [%move path path]
    ::  {"send-invite": [address, path]}
    [%send-invite @p path]
    ::  {"send-rsvp": id}
    [%send-rsvp id=@uw]
    ::  {"cancel-invite": id}
    [%cancel-invite id=@uw]
    ::  {"decline-invite": id}
    [%decline-invite id=@uw]
  ==
--
