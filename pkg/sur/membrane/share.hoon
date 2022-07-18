/-  *membrane-sheet
|%
::  an appeal is what is sent over the wire in a poke
::  when a user wants to share a sheet
+$  appeal  [id=@uw what=@t where=path]
::  an invitation is stored on the user's ship
::  in response to an appeal
+$  invitation  [id=@uw who=@p what=@t when=@da where=path why=status]
+$  status  ?(%invited %waiting %accepted %sent %received)
::  an inbox stores invitations and maps them to
::  whether or not they have been accepted
+$  inbox  (map @uw invitation)
::  an outbox is the same as an inbox but for outbound invitations
+$  outbox  inbox
::  messages between ships for sharing
+$  message
  $%
    [%invite appeal]
    [%rsvp id=@uw]
    [%package id=@uw sheet]
  ==
--