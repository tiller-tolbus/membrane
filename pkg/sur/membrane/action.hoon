/-  *membrane-sheet
|%
::  mark for all membrane pokes from front-end client is %membrane-action
+$  action
  $%
    ::  {"replace": [path, sheet]}
    [%replace path sheet]
    ::  {"create": [path, title]}
    [%create path @t]
    ::  {"rename": [path, title]}
    [%rename path @t]
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
