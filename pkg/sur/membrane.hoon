|%
+$  id  @uw
+$  sheet  $:(meta=sheet-meta data=(map address cell))
+$  sheet-meta
  $:  =id :: where is this used?
      =path
      title=@t
      tags=(set tag)
      row-meta=(map @ud (set visual))
      column-meta=(map @ud (set visual))
      row-count=@ud
      column-count=@ud
      last-modified=@da
  ==
+$  address     [row-address=@ud column-address=@ud]
+$  tag         @t
+$  cell       [meta=cell-meta data=cell-data]
+$  cell-meta  (set visual)
+$  cell-data  [input=@t output=@t]
+$  visual
  $%  [%bold ?]
      [%italic ?]
      [%underline ?]
      [%monospace ?]
      [%strikethrough ?]
      [%foreground tape]
      [%background tape]
      [%size @ud]
      [%font tape]
      [%height @ud]
      [%width @ud]
  ==
::
+$  config
  $:  dark-mode=$~(%.n ?)
      auto-accept=$~(%.n ?) :: auto-accept invites from pals
      auto-reject=?         :: auto-reject invites from comets
      blacklist=(set @p)
  ==
::
+$  action
  $%  [%write where=path what=sheet]     :: {"write": [path, sheet]}
      [%create where=path what=@t]       :: {"create": [path, title]}
      [%rename where=path what=@t]       :: {"rename": [path, title]}
      [%retag where=path what=(set tag)] :: {"retag": [path, [tag1, tag2, tag3 ... ]]}
      [%delete where=path]               :: {"delete": path}
      [%move opax=path npax=path]        :: {"move": [path, path]}
      [%send-invite who=@p where=path]   :: {"send-invite": [address, path]}
      [%send-rsvp =id]                   :: {"send-rsvp": id}
      [%cancel-invite =id]               :: {"cancel-invite": id}
      [%decline-invite =id]              :: {"decline-invite": id}
  ==
::
::  an appeal is what is sent over the wire in a poke
::  when a user wants to share a sheet
+$  appeal  [=id what=@t where=path]
::  an invitation is stored on the user's ship
::  in response to an appeal
+$  invitation  [who=@p what=@t when=@da where=path why=status]
::
+$  status
  $?  %invited  :: appeal has been sent but not acknowledged
      %waiting  :: appeal has been sent and acknowledged 
      %canceled :: appeal was canceled by sender
      %declined :: appeal was declined by receiver
      %accepted :: appeal has been approved and rsvp sent; awaiting package
      %sent     :: package has been sent but not acknowledged
      %received :: package has been sent and acknowledged
  ==
::  an inbox maps IDs to invitations 
+$  inbox  (map id invitation)
::  an outbox is the same as an inbox but for outbound invitations
+$  outbox  inbox
::  messages between ships for sharing
+$  message
  $%  [%invite a=appeal]
      [%rsvp =id]
      [%package =id s=sheet]
      [%cancel =id]
      [%decline =id]
  ==
--