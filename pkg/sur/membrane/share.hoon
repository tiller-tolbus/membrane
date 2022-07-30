/-  *membrane-sheet
|%
::  an appeal is what is sent over the wire in a poke
::  when a user wants to share a sheet
+$  appeal  [id=@uw what=@t where=path]
::  an invitation is stored on the user's ship
::  in response to an appeal
+$  invitation  [who=@p what=@t when=@da where=path why=status]
::  a status indicates one of five things
::  invited: appeal has been sent but not acknowledged
::  waiting: appeal has been sent and acknowledged
::  canceled: appeal was canceled by sender
::  declined: appeal was declined by receiver
::  accepted: appeal has been approved and rsvp sent; awaiting package
::  sent: package has been sent but not acknowledged
::  received: package has been sent and acknowledged
+$  status  $?
  %invited
  %waiting 
  %canceled 
  %declined 
  %accepted 
  %sent 
  %received
  ==
::  an inbox maps ids to invitations 
+$  inbox  (map @uw invitation)
::  an outbox is the same as an inbox but for outbound invitations
+$  outbox  inbox
::  messages between ships for sharing
+$  message
  $%
    [%invite appeal]
    [%rsvp id=@uw]
    [%package id=@uw sheet]
    [%cancel id=@uw]
    [%decline id=@uw]
  ==
--