/-  *cell
|%
++  dejs-sheet
  |=  jon=json
  ^-  sheet
  ::  input should have the format [%a p=(list row)]
  (turn p.jon dejs-row)
++  dejs-row
  |=  jon=json
  ^-  row
  ::  input should have the format [%a p=(list scell)]
  (turn p.jon dejs-cell)
++  dejs-scell
  |=  jon=json
  ^-  scell
  ::  input should have the format [%s p=@t]
  p.jon
--