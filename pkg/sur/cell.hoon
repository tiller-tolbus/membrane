|%
$+  sheet  (list row)
$+  row
  $:
  id=@ud
  data=(map @ud cell)
$+  cell  @t
$+  push-action  $:(%push sheet)
--